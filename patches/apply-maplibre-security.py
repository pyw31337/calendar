#!/usr/bin/env python3
import gzip, hashlib, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
PARTS = sorted((ROOT / 'patches').glob('maplibre-security-0*.hex'))
EXPECTED_GZIP_SHA = 'f0c12b03d74bc831e813c5fb4c0a52c26d93eb5a3fceb4be909728081f50211e'
EXPECTED_PATCH_SHA = 'c3231becc672e29f2a01728bb3e796e1cb331aecf6b5649c6dec08faed635945'

if len(PARTS) != 6:
    sys.exit(f'expected 6 hex parts, got {len(PARTS)} {[p.name for p in PARTS]}')
hex_text = ''.join(p.read_text().strip() for p in PARTS)
if any(c not in '0123456789abcdef' for c in hex_text):
    sys.exit('hex file contains non-hex characters')
gz = bytes.fromhex(hex_text)
gzip_sha = hashlib.sha256(gz).hexdigest()
if gzip_sha != EXPECTED_GZIP_SHA:
    sys.exit(f'gzip sha mismatch: {gzip_sha}')
patch = gzip.decompress(gz)
patch_sha = hashlib.sha256(patch).hexdigest()
if patch_sha != EXPECTED_PATCH_SHA:
    sys.exit(f'patch sha mismatch: {patch_sha}')
(ROOT / 'patches' / 'maplibre-security.patch').write_bytes(patch)
subprocess.check_call(['git', 'apply', '--whitespace=nowarn', 'patches/maplibre-security.patch'], cwd=ROOT)
print('applied maplibre security patch', patch_sha)
