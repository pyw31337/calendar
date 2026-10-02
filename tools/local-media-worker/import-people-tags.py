#!/usr/bin/env python3
"""인물 이름 가져오기: 맥 '사진' 앱 또는 구글 테이크아웃에 이미 붙여 둔 이름을 우리 사진 태그로 옮긴다.

docs/photo-auto-tagging-plan.md 구현안 A / A′. 얼굴을 새로 인식하지 않는다 -- 사진 앱/구글포토가
이미 가진 "이 사진에 누가 있다"는 이름 목록만 읽는다. 사진·얼굴 데이터는 이 맥 밖으로 나가지 않고,
서버에는 사진 키 + 이름 태그만 올라간다(기존 태그는 유지, 중복 없이 추가).

우리 사진은 업로드 때 WebP/JPEG로 다시 압축돼 파일명·EXIF가 원본과 다르다. 그래서 작은 썸네일끼리
지각 해시(dHash 64bit)로 같은 사진을 찾는다. 날짜가 같은 사진끼리 먼저 비교해 오탐을 줄인다.

    # Homebrew 파이썬은 pip --user 설치를 막으므로 전용 가상환경에 설치한다 (한 번만)
    python3 -m venv ~/.venvs/photos && source ~/.venvs/photos/bin/activate
    pip install pillow osxphotos pillow-heif   # pillow 필수, osxphotos는 사진 앱, pillow-heif는 HEIC

    # 1) 미리보기 (아무것도 바꾸지 않음): 어떤 사진에 어떤 이름이 붙을지 출력
    python3 tools/local-media-worker/import-people-tags.py --calendar cw --apple
    python3 tools/local-media-worker/import-people-tags.py --calendar cw --takeout "$HOME/Pictures/Moyeora Inbox/takeout"
    # 2) 이름이 다르게 저장돼 있으면 짝지어 주기 (예: 구글 "박서준" -> 우리 "서준")
    ... --alias 박서준=서준 --alias "Yuri Kim=유리"
    # 3) 확인 후 적용
    ... --apply
"""
import argparse
import io
import json
import os
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow가 필요합니다:  source ~/.venvs/photos/bin/activate && pip install pillow")
try:
    import pillow_heif  # noqa: F401  (registers HEIC support when installed)
    pillow_heif.register_heif_opener()
except Exception:
    pass

PROJECT = 'metro-live-2918e'
ROOT = f'https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents'
COMMAND = f'https://us-central1-{PROJECT}.cloudfunctions.net/mediaCommand'
CACHE = os.path.expanduser('~/Library/Caches/moyeora-people-import')
MAX_TAGS = 20
SAME_DAY_DISTANCE = 8     # of 64 bits; thumbnails of the same shot land well under this
ANY_DAY_DISTANCE = 4      # stricter when the dates do not agree (or one side has none)


# ---------- Firestore REST (read) ----------
def _decode(v):
    if 'stringValue' in v: return v['stringValue']
    if 'integerValue' in v: return int(v['integerValue'])
    if 'doubleValue' in v: return v['doubleValue']
    if 'booleanValue' in v: return v['booleanValue']
    if 'nullValue' in v: return None
    if 'arrayValue' in v: return [_decode(x) for x in v['arrayValue'].get('values', [])]
    if 'mapValue' in v: return {k: _decode(x) for k, x in v['mapValue'].get('fields', {}).items()}
    return None


def _get(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)


def list_all(path):
    out, token = [], ''
    while True:
        p = _get(f'{ROOT}/{path}?pageSize=300' + (f'&pageToken={token}' if token else ''))
        for d in p.get('documents', []):
            out.append({'id': d['name'].split('/')[-1], **{k: _decode(x) for k, x in d.get('fields', {}).items()}})
        token = p.get('nextPageToken')
        if not token:
            return out


def person_labels(calendar_id):
    cal = _decode(_get(f'{ROOT}/calendars/cal_{calendar_id}')['fields']['calendar'])
    names = [p['name'] for p in (cal.get('participants') or []) if isinstance(p, dict) and p.get('name') and not p.get('deletedAt') and not p.get('removedAt')]
    return list(dict.fromkeys(names + list(cal.get('customPersonTags') or [])))


# ---------- hashing ----------
def dhash(img):
    g = img.convert('L').resize((9, 8), Image.LANCZOS)
    # Pillow 12 deprecates getdata(); get_flattened_data() is the replacement where available.
    px = list(g.get_flattened_data() if hasattr(g, 'get_flattened_data') else g.getdata())
    bits = 0
    for row in range(8):
        for col in range(8):
            bits = (bits << 1) | (1 if px[row * 9 + col] > px[row * 9 + col + 1] else 0)
    return bits


def hamming(a, b):
    return bin(a ^ b).count('1')


def hash_file(path):
    try:
        with Image.open(path) as im:
            im.draft('RGB', (256, 256))
            return dhash(im)
    except Exception:
        return None


def hash_url(url):
    os.makedirs(CACHE, exist_ok=True)
    key = re.sub(r'[^A-Za-z0-9]', '_', url.split('?')[0].split('%2F')[-1])[-120:]
    cached = os.path.join(CACHE, key + '.hash')
    if os.path.exists(cached):
        return int(open(cached).read() or 0) or None
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            h = dhash(Image.open(io.BytesIO(r.read())))
    except Exception:
        h = None
    with open(cached, 'w') as f:
        f.write(str(h or 0))
    return h


def date_tokens(tags):
    out = set()
    for t in re.findall(r'(?<!\d)(\d{6})(?!\d)', tags or ''):
        try:
            out.add(datetime.strptime('20' + t, '%Y%m%d').date())
        except ValueError:
            pass
    return out


# ---------- sources ----------
def from_apple():
    try:
        import osxphotos
    except ImportError:
        sys.exit("osxphotos가 필요합니다:  source ~/.venvs/photos/bin/activate && pip install osxphotos")
    db = osxphotos.PhotosDB()
    for p in db.photos():
        names = [n for n in (p.persons or []) if n and n != '_UNKNOWN_']
        if not names or p.ismovie or p.intrash:
            continue
        # A JPEG derivative avoids HEIC decoding and works when the original is still in iCloud.
        paths = [x for x in (p.path_derivatives or []) if x and os.path.exists(x)] + ([p.path] if p.path else [])
        yield {'names': names, 'paths': paths, 'date': p.date.date() if p.date else None, 'label': p.original_filename}


def from_takeout(folder):
    for dirpath, _, files in os.walk(folder):
        for f in files:
            if not f.lower().endswith('.json'):
                continue
            try:
                meta = json.load(open(os.path.join(dirpath, f), encoding='utf-8'))
            except Exception:
                continue
            names = [p.get('name') for p in (meta.get('people') or []) if p.get('name')]
            title = meta.get('title')
            if not names or not title:
                continue
            image = os.path.join(dirpath, title)
            if not os.path.exists(image):
                # Takeout trims long names; "<title>.supplemental-metadata.json" sits next to the file.
                stem = f.split('.supplemental')[0].replace('.json', '')
                image = os.path.join(dirpath, stem)
            if not os.path.exists(image):
                continue
            ts = (meta.get('photoTakenTime') or {}).get('timestamp')
            when = (datetime.utcfromtimestamp(int(ts)) + timedelta(hours=9)).date() if ts else None
            yield {'names': names, 'paths': [image], 'date': when, 'label': title}


# ---------- names ----------
def name_mapper(labels, aliases):
    label_set = set(labels)
    given = {l[1:]: l for l in labels if re.fullmatch(r'[가-힣]{3}', l)}

    def to_label(name):
        name = name.strip()
        if name in aliases:
            return aliases[name]
        if name in label_set:
            return name
        if re.fullmatch(r'[가-힣]{3}', name) and name[1:] in label_set:
            return name[1:]            # 구글 "박서준" -> 우리 태그 "서준"
        if name in given:
            return name
        compact = name.replace(' ', '')
        return compact if compact in label_set else None
    return to_label


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--calendar', required=True)
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument('--apple', action='store_true')
    src.add_argument('--takeout')
    ap.add_argument('--alias', action='append', default=[], help='원본이름=우리태그')
    ap.add_argument('--apply', action='store_true')
    args = ap.parse_args()
    if not re.fullmatch(r'[a-z0-9_-]{1,60}', args.calendar, re.I):
        sys.exit('calendar id 형식이 아닙니다')

    aliases = dict(a.split('=', 1) for a in args.alias if '=' in a)
    labels = person_labels(args.calendar)
    to_label = name_mapper(labels, aliases)

    print('우리 사진 목록을 읽는 중...')
    rows = [r for r in list_all(f'calendars/cal_{args.calendar}/photoIndex') if r.get('thumb') or r.get('full')]
    print(f'우리 사진 {len(rows)}장의 썸네일을 비교용으로 준비합니다 (처음 한 번은 몇 분 걸리고, 다음부터는 저장해 둔 값을 씁니다)')
    hashes = []
    with ThreadPoolExecutor(8) as pool:
        for i, h in enumerate(pool.map(lambda r: hash_url(r.get('thumb') or r.get('full')), rows), 1):
            hashes.append(h)
            if i % 100 == 0 or i == len(rows):
                print(f'  {i}/{len(rows)}', flush=True)
    ours = [(r, h, date_tokens(r.get('tags'))) for r, h in zip(rows, hashes) if h]
    print(f'우리 사진 {len(ours)}장 해시 완료')

    source = from_apple() if args.apple else from_takeout(args.takeout)
    unknown, plan, seen_src, no_image = {}, {}, 0, 0
    print('원본 사진과 비교하는 중...')
    for item in source:
        seen_src += 1
        if seen_src % 200 == 0:
            print(f'  {seen_src}장 확인', flush=True)
        mapped = []
        for n in item['names']:
            label = to_label(n)
            if label:
                mapped.append(label)
            else:
                unknown[n] = unknown.get(n, 0) + 1
        if not mapped:
            continue
        h = next((x for x in (hash_file(p) for p in item['paths']) if x), None)
        if not h:
            no_image += 1
            continue
        best = None
        for row, rh, dates in ours:
            limit = SAME_DAY_DISTANCE if (item['date'] and any(abs((item['date'] - d).days) <= 1 for d in dates)) else ANY_DAY_DISTANCE
            dist = hamming(h, rh)
            if dist <= limit and (best is None or dist < best[1]):
                best = (row, dist)
        if not best:
            continue
        row = best[0]
        entry = plan.setdefault(row['id'], {'row': row, 'names': []})
        entry['names'].extend(x for x in mapped if x not in entry['names'])

    changes = []
    for key, entry in plan.items():
        row = entry['row']
        current = [t for t in re.split(r'[\s,#]+', row.get('tags') or '') if t]
        add = [n for n in entry['names'] if n not in current]
        if not add:
            continue
        tags = ' '.join((current + add)[:MAX_TAGS])
        changes.append({'assetKey': key, 'add': add, 'item': {
            'imageUrl': row.get('full') or row.get('thumb'), 'thumbUrl': row.get('thumb') or row.get('full'),
            'messageId': row.get('messageId') or '', 'memoId': row.get('messageId') if row.get('source') == 'memo' else '',
            'directMediaUrl': row.get('directMediaUrl') or '', 'tags': tags}})

    print(f'\n원본 사진 {seen_src}장 중 이름 있는 사진을 우리 사진 {len(plan)}장과 연결, 새 인물 태그가 붙을 사진 {len(changes)}장')
    if no_image:
        print(f'이 맥에 이미지가 없어 비교하지 못한 사진 {no_image}장 -- 사진 앱 > 설정 > iCloud > "이 Mac에 원본 다운로드"를 켜면 늘어납니다.')
    for c in changes[:30]:
        print(f"  {c['assetKey']}: +{' '.join('#' + a for a in c['add'])}")
    if unknown:
        print('\n우리 인물 태그와 짝을 못 찾은 이름 (필요하면 --alias 원본=우리태그):')
        for n, k in sorted(unknown.items(), key=lambda x: -x[1])[:30]:
            print(f'  {n}: {k}장')
    if not args.apply:
        print('\n미리보기만 했습니다. 확인 후 --apply 를 붙여 다시 실행하세요.')
        return
    applied = 0
    for i in range(0, len(changes), 80):
        chunk = [c['item'] for c in changes[i:i + 80]]
        req = urllib.request.Request(COMMAND, data=json.dumps({'calendarId': args.calendar, 'op': 'bulkTagAssets', 'items': chunk}).encode(),
                                     headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req, timeout=60) as r:
            res = json.load(r)
        if res.get('ok') is not False:
            applied += len(chunk)
    print(f'\n{applied}장에 인물 태그를 붙였습니다.')


if __name__ == '__main__':
    main()
