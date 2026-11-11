#!/usr/bin/env python3
"""Run as root on ECS, via SSH stdin or as a standalone file. No third-party dependencies."""
from contextlib import contextmanager
from datetime import datetime, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import signal
import subprocess
import sys
import tarfile
import uuid

# Keep in step with scripts/package-site.mjs and scripts/build-site.mjs.
PAGES = {'index.html', 'guide.html'}
SMOKE_FILES = ('index.html', 'guide.html', 'styles/base.css', 'scripts/site.js', 'assets/tokens.json')
DOMAINS = ('deernova.me', 'www.deernova.me')


class DeployError(Exception):
    pass


def command(args):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, timeout=25).stdout


class Site:
    def __init__(self, root=Path('/var/www')):
        self.root = Path(root).resolve()
        self.releases = self.root / 'releases'
        self.current = self.root / 'deernova'
        self.previous = self.root / '.deernova-previous'

    @contextmanager
    def locked(self):
        # A process crash releases flock automatically; no stale lock directory.
        with (self.root / '.deernova-deploy.lock').open('a') as lock:
            try:
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                raise DeployError('Another deploy or rollback is running') from None
            yield

    def release_path(self, value):
        path = Path(value)
        if path.is_symlink():
            raise DeployError('Release must be a real directory, not a symlink')
        resolved = path.resolve(strict=True)
        valid = ((resolved.parent == self.releases.resolve() and re.fullmatch(r'deernova-[A-Za-z0-9]+', resolved.name))
                 or (resolved.parent == self.root.resolve() and re.fullmatch(r'deernova-before-[A-Za-z0-9]+', resolved.name)))
        if not valid or not resolved.is_dir():
            raise DeployError('Release is outside the managed Deernova directories')
        return resolved

    def current_path(self):
        if self.current.is_symlink():
            return self.release_path(self.current.resolve(strict=True))
        if self.current.is_dir():
            return self.current
        if self.current.exists():
            raise DeployError('Current website is not a directory')
        return None

    def status(self):
        current = self.current_path()
        previous = self.release_path(self.previous.resolve(strict=True)) if self.previous.is_symlink() else None
        return {'current': str(current) if current else None, 'previous': str(previous) if previous else None}

    def check(self):
        if not self.root.is_dir():
            raise DeployError('/var/www does not exist; provision Nginx first')
        command(['nginx', '-t'])
        command(['systemctl', 'is-active', 'nginx'])
        command(['curl', '--version'])
        return {'ready': True, **self.status()}

    def link(self, target, destination):
        temporary = self.root / ('.deernova-link-' + uuid.uuid4().hex)
        try:
            temporary.symlink_to(target, target_is_directory=True)
            os.replace(temporary, destination)
        finally:
            temporary.unlink(missing_ok=True)

    def extract(self, archive, expected):
        if not re.fullmatch(r'[a-fA-F0-9]{64}', expected):
            raise DeployError('Expected SHA256 must contain 64 hexadecimal characters')
        # Hash and extract from the same open file, not two different path lookups.
        with Path(archive).open('rb') as data:
            if hashlib.file_digest(data, 'sha256').hexdigest() != expected.lower():
                raise DeployError('SHA256 mismatch')
            data.seek(0)
            stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
            release = self.releases / ('deernova-' + stamp)
            with tarfile.open(fileobj=data, mode='r:gz') as bundle:
                seen = set()
                total = 0
                for member in bundle.getmembers():
                    path = Path(member.name)
                    if path.is_absolute() or '..' in path.parts or not path.parts:
                        raise DeployError('Invalid archive path')
                    if path.parts[0] not in {*PAGES, 'styles', 'scripts', 'assets'}:
                        raise DeployError('Unexpected archive entry')
                    if not (member.isfile() or member.isdir()):
                        raise DeployError('Links and special files are forbidden')
                    if path.as_posix() in seen:
                        raise DeployError('Duplicate archive entry')
                    seen.add(path.as_posix())
                    total += member.size
                    if total > 512 * 1024 * 1024:
                        raise DeployError('Expanded archive exceeds 512 MiB')
                release.mkdir(parents=True, exist_ok=False)
                try:
                    bundle.extractall(release, filter='data')
                    self.digests(release)
                    for path in [release, *release.rglob('*')]:
                        os.chmod(path, 0o755 if path.is_dir() else 0o644)
                except BaseException:
                    shutil.rmtree(release)
                    raise
        return release

    def digests(self, release):
        result = {}
        for name in SMOKE_FILES:
            path = release / name
            if not path.is_file() or path.is_symlink() or not path.resolve().is_relative_to(release.resolve()):
                raise DeployError('Release is missing a required public file: ' + name)
            data = path.read_bytes()
            if name in PAGES and re.search(rb'\{\{\w+\}\}', data):
                raise DeployError('Unresolved HTML placeholder in ' + name)
            result[name] = hashlib.sha256(data).hexdigest()
        return result

    def health(self, release):
        checks = self.digests(release)
        for domain in DOMAINS:
            for name, expected in checks.items():
                path = '' if name == 'index.html' else name
                body = command(['curl', '--fail', '--silent', '--show-error', '--noproxy', '*',
                                '--connect-timeout', '5', '--max-time', '15',
                                '--resolve', domain + ':443:127.0.0.1', '-H', 'Cache-Control: no-cache',
                                'https://' + domain + '/' + path])
                if hashlib.sha256(body).hexdigest() != expected:
                    raise DeployError('HTTPS content mismatch: ' + domain + '/' + path)
        return checks

    def activate(self, target):
        self.digests(target)
        command(['nginx', '-t'])
        old = self.current_path()
        if old == self.current:
            old = self.root / ('deernova-before-' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ'))
            self.current.rename(old)
        try:
            self.link(target, self.current)
            command(['systemctl', 'reload', 'nginx'])
            checks = self.health(target)
            if old:
                self.link(old, self.previous)
        except BaseException:
            # This also covers TERM/INT raised by the CLI signal handler.
            if old:
                self.link(old, self.current)
            else:
                self.current.unlink(missing_ok=True)
            command(['systemctl', 'reload', 'nginx'])
            raise
        return {**self.status(), 'checks': checks}

    def deploy(self, archive, expected):
        with self.locked():
            self.current_path()  # Reject an unexpected current path before unpacking.
            release = self.extract(archive, expected)
            try:
                result = self.activate(release)
            except BaseException:
                # Keep the candidate if restoration failed and it is still active.
                if not self.current.is_symlink() or self.current.resolve() != release:
                    shutil.rmtree(release)
                raise
            return {**result, 'sha256': expected.lower()}

    def rollback(self, requested=None):
        with self.locked():
            if requested is None:
                if not self.previous.is_symlink():
                    raise DeployError('No recorded previous release; pass an explicit release path')
                requested = self.previous.resolve(strict=True)
            target = self.release_path(requested)
            if target == self.current_path():
                raise DeployError('Requested release is already active')
            return self.activate(target)


def main(args):
    if sys.version_info < (3, 12):
        raise DeployError('Server requires Python 3.12 or newer (Ubuntu 24.04 includes it)')
    if os.geteuid() != 0:
        raise DeployError('Run with root or sudo -n privileges')
    site = Site()
    # Compatibility with the original console command: deploy-site.py ARCHIVE SHA256.
    legacy = len(args) == 2 and args[0] not in ('deploy', 'rollback', 'status', 'check')
    if legacy:
        args = ['deploy', *args]
    if args == ['check']:
        result = site.check()
    elif args == ['status']:
        result = site.status()
    elif len(args) == 3 and args[0] == 'deploy':
        result = site.deploy(args[1], args[2])
    elif 1 <= len(args) <= 2 and args[0] == 'rollback':
        result = site.rollback(args[1] if len(args) == 2 else None)
    else:
        raise DeployError('Usage: deploy-site.py check|status|deploy ARCHIVE SHA256|rollback [RELEASE]')
    if legacy:
        print('DEPLOYED=' + str(result['current']))
        print('PREVIOUS=' + str(result['previous']))
        print('SHA256=' + result['sha256'])
    else:
        print(json.dumps(result))


if __name__ == '__main__':
    def interrupted(signum, frame):
        raise DeployError('Deployment interrupted by signal ' + str(signum))
    signal.signal(signal.SIGTERM, interrupted)
    signal.signal(signal.SIGINT, interrupted)
    try:
        main(sys.argv[1:])
    except (DeployError, OSError, ValueError, tarfile.TarError, subprocess.SubprocessError) as error:
        print('deernova deploy: ' + str(error), file=sys.stderr)
        sys.exit(1)
