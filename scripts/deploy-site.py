#!/usr/bin/env python3
"""Run as root on ECS: python3 deploy-site.py ARCHIVE EXPECTED_SHA256."""
import hashlib
import os
from pathlib import Path
import subprocess
import sys
import tarfile
from datetime import datetime, timezone

archive = Path(sys.argv[1]).resolve()
expected = sys.argv[2].lower()
assert len(expected) == 64 and hashlib.sha256(archive.read_bytes()).hexdigest() == expected, 'SHA256 mismatch'
stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
release = Path('/var/www/releases') / ('deernova-' + stamp)
current = Path('/var/www/deernova')
release.mkdir(parents=True, exist_ok=False)
with tarfile.open(archive) as bundle:
    for member in bundle.getmembers():
        path = Path(member.name)
        assert not path.is_absolute() and '..' not in path.parts, 'Invalid archive path'
        assert member.isfile() or member.isdir(), 'Links and special files are forbidden'
        assert path.parts[0] in {'index.html', 'guide.html', 'styles', 'scripts', 'assets'}, 'Unexpected archive entry'
    bundle.extractall(release, filter='data')
assert (release / 'index.html').is_file() and (release / 'guide.html').is_file()
for path in [release, *release.rglob('*')]:
    os.chmod(path, 0o755 if path.is_dir() else 0o644)
subprocess.run(['nginx', '-t'], check=True)
previous = None
if current.is_symlink():
    previous = current.resolve(strict=True)
elif current.exists():
    previous = current.with_name('deernova-before-' + stamp)
    current.rename(previous)
temporary = current.with_name('.deernova-next-' + stamp)
temporary.symlink_to(release, target_is_directory=True)
os.replace(temporary, current)
try:
    subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
    subprocess.run(['curl', '--fail', '--silent', '--show-error', '--resolve', 'deernova.me:443:127.0.0.1', 'https://deernova.me/', '-o', '/dev/null'], check=True)
except Exception:
    if previous:
        temporary.symlink_to(previous, target_is_directory=True)
        os.replace(temporary, current)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
    raise
print('DEPLOYED=' + str(release))
print('PREVIOUS=' + str(previous))
print('SHA256=' + expected)
