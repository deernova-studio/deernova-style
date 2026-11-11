#!/bin/bash
# Install a verified One binary inside this repository; never edit the user's PATH.
set -euo pipefail
cd "$(dirname "$0")/.."
version=0.1.25
case "$(uname -s)/$(uname -m)" in
  Darwin/arm64) platform=darwin_arm64; checksum=6b9f37e20eb2d00c3eb9d1ab726821b39b4b27835d7ead3f88c54c7d08007307 ;;
  Darwin/x86_64) platform=darwin_amd64; checksum=c867f3621a5b50a27c2c474c953cfb66f29f6c0dbc3e37201f00309fdaaf682c ;;
  Linux/aarch64|Linux/arm64) platform=linux_arm64; checksum=12c652698236842710aec96e112e65a8b69d1c4436d4cdca28170a9e526c527a ;;
  Linux/x86_64) platform=linux_amd64; checksum=8f068275597be0be1ec72414e2fca4b968a3cc77d15769580b69c1fb639b7233 ;;
  *) echo 'One bootstrap supports macOS/Linux on arm64 or x86_64.' >&2; exit 1 ;;
esac
root="$PWD/.cache/one"
mkdir -p "$root/bin"
stage=$(mktemp -d "$root/bootstrap.XXXXXX")
trap 'rm -rf "$stage"' EXIT
curl --fail --silent --show-error --location --retry 3 --max-time 120 \
  "https://github.com/1cli-team/one-cli/releases/download/v$version/one-cli_$platform.tar.gz" \
  -o "$stage/one.tar.gz"
actual=$(shasum -a 256 "$stage/one.tar.gz" | awk '{print $1}')
[[ "$actual" == "$checksum" ]] || { echo 'One archive SHA256 mismatch.' >&2; exit 1; }
tar -xzf "$stage/one.tar.gz" -C "$stage"
install -m 755 "$stage/one" "$root/bin/one"
"$root/bin/one" --version
echo "One installed: $root/bin/one"
echo 'For this terminal: export PATH="$PWD/.cache/one/bin:$PATH"'
