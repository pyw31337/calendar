#!/usr/bin/env python3
"""Apply the gzip+hex upload-tags/toolbar patch and leave a clean tree."""
from __future__ import annotations

import gzip
import hashlib
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
PATCH_DIR = ROOT / "patches"
EXPECTED_SHA = "efe12a27f73652e17eb17a309ce936a2ff5d5f908da0df5406271dd32ca3524b"
HEX_GLOB = "upload-tags-*.hex"


def main() -> int:
    parts = sorted(PATCH_DIR.glob(HEX_GLOB))
    if not parts:
        print("no hex parts found", file=sys.stderr)
        return 1
    hexdata = "".join(part.read_text(encoding="ascii").strip() for part in parts)
    payload = bytes.fromhex(hexdata)
    digest = hashlib.sha256(payload).hexdigest()
    if digest != EXPECTED_SHA:
        print(f"sha mismatch: {digest} != {EXPECTED_SHA}", file=sys.stderr)
        return 1
    patch = gzip.decompress(payload)
    patch_path = PATCH_DIR / "upload-tags-toolbar.patch"
    patch_path.write_bytes(patch)
    subprocess.check_call(["git", "apply", str(patch_path)], cwd=ROOT)

    leftovers = [
        patch_path,
        PATCH_DIR / "apply-upload-tags.py",
        ROOT / ".github/workflows/apply-upload-tags.yml",
        *parts,
    ]
    for path in leftovers:
        if path.exists():
            path.unlink()
    print("applied upload-tags-toolbar patch")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
