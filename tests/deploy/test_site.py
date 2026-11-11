import hashlib
import importlib.util
import io
from pathlib import Path
import subprocess
import tarfile
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import urlparse

spec = importlib.util.spec_from_file_location('deploy_site', Path(__file__).resolve().parents[2] / 'scripts/deploy-site.py')
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.site = deploy.Site(self.root)
        self.old = self.root / 'releases/deernova-old'
        self.files(self.old, b'old')
        self.site.current.symlink_to(self.old)
        self.calls = []
        mock = patch.object(deploy, 'command', side_effect=self.command)
        mock.start()
        self.addCleanup(mock.stop)

    def files(self, root, data):
        for name in deploy.SMOKE_FILES:
            path = root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

    def command(self, args):
        self.calls.append(args)
        if args[0] == 'curl' and args[-1].startswith('https:'):
            path = urlparse(args[-1]).path.lstrip('/') or 'index.html'
            return (self.site.current / path).read_bytes()
        return b''

    def archive(self, extra=None, omit=None, body=b'new'):
        path = self.root / 'site.tgz'
        with tarfile.open(path, 'w:gz') as archive:
            for name in deploy.SMOKE_FILES:
                if name != omit:
                    item = tarfile.TarInfo(name)
                    item.size = len(body)
                    archive.addfile(item, io.BytesIO(body))
            if extra:
                archive.addfile(extra, io.BytesIO(b''))
        return path, hashlib.sha256(path.read_bytes()).hexdigest()

    def test_deploy_and_rollback_keep_versions_and_verify_both_domains(self):
        result = self.site.deploy(*self.archive())
        new = Path(result['current'])
        self.assertEqual(self.site.current.resolve(), new)
        self.assertEqual(self.site.previous.resolve(), self.old)
        self.assertEqual((new / 'index.html').stat().st_mode & 0o777, 0o644)
        self.assertEqual(new.stat().st_mode & 0o777, 0o755)
        self.assertEqual(len([call for call in self.calls if call[0] == 'curl']), 10)
        rolled = self.site.rollback()
        self.assertEqual(rolled['current'], str(self.old))
        self.assertEqual(rolled['previous'], str(new))
        self.assertTrue(new.is_dir())

    def test_invalid_archives_never_replace_current(self):
        cases = ['../escape', '/tmp/escape', '.git/config', 'assets/../../escape', 'index.html']
        for name in cases:
            with self.subTest(name=name):
                with self.assertRaises(deploy.DeployError):
                    self.site.deploy(*self.archive(tarfile.TarInfo(name)))
                self.assertEqual(self.site.current.resolve(), self.old)
        link = tarfile.TarInfo('assets/link')
        link.type, link.linkname = tarfile.SYMTYPE, '/etc/passwd'
        with self.assertRaises(deploy.DeployError):
            self.site.deploy(*self.archive(link))
        with self.assertRaises(deploy.DeployError):
            self.site.deploy(*self.archive(omit='guide.html'))
        with self.assertRaises(deploy.DeployError):
            self.site.deploy(*self.archive(body=b'{{version}}'))
        path, _ = self.archive()
        with self.assertRaisesRegex(deploy.DeployError, 'SHA256 mismatch'):
            self.site.deploy(path, '0' * 64)
        self.assertEqual(list(self.site.releases.iterdir()), [self.old])

    def test_health_failure_restores_current_and_preserves_previous(self):
        self.site.previous.symlink_to(self.old)
        with patch.object(self.site, 'health', side_effect=deploy.DeployError('bad HTTPS')):
            with self.assertRaisesRegex(deploy.DeployError, 'bad HTTPS'):
                self.site.deploy(*self.archive())
        self.assertEqual(self.site.current.resolve(), self.old)
        self.assertEqual(self.site.previous.resolve(), self.old)
        self.assertEqual(list(self.site.releases.iterdir()), [self.old])

    def test_reload_failure_restores_current(self):
        failed = False
        def fail_once(args):
            nonlocal failed
            if args == ['systemctl', 'reload', 'nginx'] and not failed:
                failed = True
                raise subprocess.CalledProcessError(1, args)
            return self.command(args)
        with patch.object(deploy, 'command', side_effect=fail_once):
            with self.assertRaises(subprocess.CalledProcessError):
                self.site.deploy(*self.archive())
        self.assertEqual(self.site.current.resolve(), self.old)

    def test_nginx_config_failure_does_not_switch(self):
        with patch.object(deploy, 'command', side_effect=subprocess.CalledProcessError(1, ['nginx', '-t'])):
            with self.assertRaises(subprocess.CalledProcessError):
                self.site.deploy(*self.archive())
        self.assertEqual(self.site.current.resolve(), self.old)
        self.assertEqual(list(self.site.releases.iterdir()), [self.old])

    def test_lock_prevents_overlapping_changes_and_releases_after_failure(self):
        with self.site.locked():
            with self.assertRaisesRegex(deploy.DeployError, 'Another deploy'):
                self.site.deploy(*self.archive())
        self.site.deploy(*self.archive())

    def test_rollback_rejects_unknown_paths_and_current_release(self):
        outside = self.root / 'unrelated'
        self.files(outside, b'unrelated')
        alias = self.site.releases / 'deernova-alias'
        alias.symlink_to(self.old)
        for path in (outside, alias, self.old):
            with self.subTest(path=str(path)), self.assertRaises(deploy.DeployError):
                self.site.rollback(path)
        with self.assertRaisesRegex(deploy.DeployError, 'No recorded'):
            self.site.rollback()
        self.assertEqual(self.site.current.resolve(), self.old)

    def test_failed_rollback_restores_new_version(self):
        new = self.site.deploy(*self.archive())['current']
        with patch.object(self.site, 'health', side_effect=deploy.DeployError('unhealthy old release')):
            with self.assertRaises(deploy.DeployError):
                self.site.rollback()
        self.assertEqual(str(self.site.current.resolve()), new)
        self.assertEqual(self.site.previous.resolve(), self.old)

    def test_legacy_directory_survives_failed_first_switch(self):
        self.site.current.unlink()
        self.files(self.site.current, b'legacy')
        with patch.object(self.site, 'health', side_effect=deploy.DeployError('bad HTTPS')):
            with self.assertRaises(deploy.DeployError):
                self.site.deploy(*self.archive())
        self.assertEqual((self.site.current / 'index.html').read_bytes(), b'legacy')
        self.assertTrue(self.site.current.resolve().name.startswith('deernova-before-'))

    def test_health_mismatch_is_detected_even_with_success_status(self):
        with patch.object(deploy, 'command', return_value=b'stale proxy response'):
            with self.assertRaisesRegex(deploy.DeployError, 'content mismatch'):
                self.site.health(self.old)


if __name__ == '__main__':
    unittest.main()
