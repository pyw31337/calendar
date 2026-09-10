import binascii, gzip, hashlib, pathlib, sys
hexdata = ''.join(''.join(pathlib.Path('patches/p%d.hex' % i).read_text().split()) for i in range(1, 9))
if len(hexdata) != 24314:
    print('hexlen', len(hexdata), file=sys.stderr)
    sys.exit(1)
gz = binascii.unhexlify(hexdata)
patch = gzip.decompress(gz)
digest = hashlib.sha256(patch).hexdigest()
if digest != '741fa6f0f0435783286f08587455318ba78321204b92b2988879951e0283ecc5':
    print('bad sha256', digest, file=sys.stderr)
    sys.exit(1)
pathlib.Path('/tmp/fix.patch').write_bytes(patch)
print('patch ok', len(patch), digest)
