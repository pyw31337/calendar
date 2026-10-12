#!/usr/bin/env python3
"""검증된 원본 메타데이터 가져오기: 맥 '사진' 또는 구글 테이크아웃의 인물·촬영일·GPS를 우리 사진에 옮긴다.

docs/photo-auto-tagging-plan.md 구현안 A / A′. 얼굴을 새로 인식하지 않는다 -- 사진 앱/구글포토가
이미 가진 "이 사진에 누가 있다"는 이름 목록만 읽는다. 사진·얼굴 데이터는 이 맥 밖으로 나가지 않고,
서버에는 사진 키 + 명시 인물/촬영일/좌표만 올라간다(기존 태그는 유지, 중복 없이 추가).

우리 사진은 업로드 때 WebP/JPEG로 다시 압축돼 파일명·EXIF가 원본과 다르다. 그래서 작은 썸네일끼리
지각 해시(dHash 64bit)로 같은 사진을 찾는다. 날짜가 같은 사진끼리 먼저 비교해 오탐을 줄인다.

    # Homebrew 파이썬은 pip --user 설치를 막으므로 전용 가상환경에 설치한다 (한 번만)
    python3 -m venv ~/.venvs/photos && source ~/.venvs/photos/bin/activate
    pip install pillow osxphotos pillow-heif   # pillow 필수, osxphotos는 사진 앱, pillow-heif는 HEIC

    # 1) 미리보기 (아무것도 바꾸지 않음): 어떤 사진에 어떤 이름이 붙을지 출력
    python3 tools/local-media-worker/import-people-tags.py --calendar cw --apple
    python3 tools/local-media-worker/import-people-tags.py --calendar cw --takeout "$HOME/Pictures/Moyeora Inbox/takeout"
    #    --takeout 에는 테이크아웃 zip 파일들이 든 폴더(압축 안 풀어도 됨), zip 하나, 또는 푼 폴더를 줄 수 있다.
    #    --places 를 붙이면 원본의 촬영 위치도 가져온다: 위치가 없는 우리 사진(아이폰 Safari 업로드는 GPS가
    #    지워져 옴)에 위치를 넣고, 서버가 그 위치로 장소 태그를 붙인다. 이름이 없는 사진도 위치는 가져온다.
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
import urllib.parse
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow가 필요합니다:  source ~/.venvs/photos/bin/activate && pip install pillow")
try:
    import pillow_heif  # noqa: F401  (registers HEIC support when installed)
    pillow_heif.register_heif_opener()
except Exception:
    pass

PROJECT = 'metro-live-2918e'
ROOT = f'https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents'
COMMAND = f'https://asia-northeast3-{PROJECT}.cloudfunctions.net/mediaCommand'
CACHE = os.path.expanduser('~/Library/Caches/moyeora-people-import')
MAX_TAGS = 20
SAME_DAY_DISTANCE = 8     # of 64 bits; thumbnails of the same shot land well under this
ANY_DAY_DISTANCE = 2      # no date agreement: accept only an almost exact duplicate


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
    """path is a file path, or a callable returning an open binary file (a zip member)."""
    try:
        source = path() if callable(path) else path
        with Image.open(source) as im:
            im.draft('RGB', (256, 256))
            # Phone cameras store the pixels sideways with an EXIF Orientation flag, while our copy
            # was re-encoded upright by the browser. Hash the photo the way it is shown: without
            # this a portrait phone photo never matched its own upload.
            return dhash(ImageOps.exif_transpose(im))
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
def _geo_pair(lat, lng):
    """(lat, lng) when it is a real coordinate; Takeout writes 0.0/0.0 for "no location"."""
    try:
        lat, lng = float(lat), float(lng)
    except (TypeError, ValueError):
        return None
    if not (-90 <= lat <= 90 and -180 <= lng <= 180) or (abs(lat) < 1e-6 and abs(lng) < 1e-6):
        return None
    return (round(lat, 6), round(lng, 6))


def from_apple():
    try:
        import osxphotos
    except ImportError:
        sys.exit("osxphotos가 필요합니다:  source ~/.venvs/photos/bin/activate && pip install osxphotos")
    db = osxphotos.PhotosDB()
    for p in db.photos():
        names = [n for n in (p.persons or []) if n and n != '_UNKNOWN_']
        geo = _geo_pair(*(p.location or (None, None)))
        if (not names and not geo) or p.ismovie or p.intrash:
            continue
        # A JPEG derivative avoids HEIC decoding and works when the original is still in iCloud.
        paths = [x for x in (p.path_derivatives or []) if x and os.path.exists(x)] + ([p.path] if p.path else [])
        yield {'names': names, 'paths': paths, 'date': p.date.date() if p.date else None, 'label': p.original_filename, 'geo': geo}


def _takeout_entries(target):
    """Every file of a Takeout export -- extracted folders and/or the .zip parts themselves, so the
    export never has to be unzipped (Takeout can put a photo and its .json in different parts)."""
    entries = {}
    zips = []
    paths = [target] if os.path.isfile(target) else []
    if os.path.isdir(target):
        for dirpath, _, files in os.walk(target):
            for f in files:
                paths.append(os.path.join(dirpath, f))
    for path in paths:
        if path.lower().endswith('.zip'):
            try:
                z = zipfile.ZipFile(path)
            except zipfile.BadZipFile:
                print(f'  열 수 없는 zip을 건너뜀: {path}')
                continue
            zips.append(z)
            for name in z.namelist():
                if not name.endswith('/'):
                    entries[name] = (z, name)
        else:
            rel = os.path.relpath(path, target) if os.path.isdir(target) else os.path.basename(path)
            entries[rel] = (None, path)
    return entries, zips


def from_takeout(target):
    entries, zips = _takeout_entries(target)
    if zips:
        print(f'테이크아웃 zip {len(zips)}개를 압축을 풀지 않고 읽습니다.')

    def read_json(ref):
        z, name = ref
        with (z.open(name) if z else open(name, 'rb')) as fh:
            return json.load(fh)

    def opener(ref):
        z, name = ref
        return (lambda: z.open(name)) if z else name

    for key, ref in entries.items():
        if not key.lower().endswith('.json'):
            continue
        try:
            meta = read_json(ref)
        except Exception:
            continue
        if not isinstance(meta, dict):
            continue
        if meta.get('trashed') is True:
            continue
        names = [p.get('name') for p in (meta.get('people') or []) if isinstance(p, dict) and p.get('name')]
        title = meta.get('title')
        geo_data = meta.get('geoData') or {}
        geo_exif = meta.get('geoDataExif') or {}
        geo = _geo_pair(geo_data.get('latitude'), geo_data.get('longitude')) or _geo_pair(geo_exif.get('latitude'), geo_exif.get('longitude'))
        ts = (meta.get('photoTakenTime') or {}).get('timestamp') or (meta.get('creationTime') or {}).get('timestamp')
        when = (datetime.utcfromtimestamp(int(ts)) + timedelta(hours=9)).date() if ts else None
        if (not names and not geo and not when) or not title:
            continue
        folder = os.path.dirname(key)
        image = entries.get(os.path.join(folder, title)) if folder else entries.get(title)
        if not image:
            # Takeout trims long names; "<file>.supplemental-metadata.json" / "<file>.json" sit next to it.
            stem = os.path.basename(key).split('.supplemental')[0]
            if stem.lower().endswith('.json'):
                stem = stem[:-5]
            image = entries.get(os.path.join(folder, stem) if folder else stem)
        if not image:
            continue
        yield {'names': names, 'paths': [opener(image)], 'date': when, 'label': title, 'geo': geo,
               # Folder context is diagnostic only. It is deliberately not turned into a tag:
               # Takeout has dated/system albums whose names are not calendar facts.
               'album': os.path.basename(folder)}


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
    ap.add_argument('--places', action='store_true',
                    help='원본의 촬영 위치도 가져온다 (위치가 없는 우리 사진만; 서버가 그 위치로 장소 태그를 붙인다)')
    ap.add_argument('--apply', action='store_true')
    args = ap.parse_args()
    if not re.fullmatch(r'[a-z0-9_-]{1,60}', args.calendar, re.I):
        sys.exit('calendar id 형식이 아닙니다')

    aliases = dict(a.split('=', 1) for a in args.alias if '=' in a)
    print('우리 사진 목록을 읽는 중...')
    rows = [r for r in list_all(f'calendars/cal_{args.calendar}/photoIndex') if r.get('thumb') or r.get('full')]
    # People are often only ever written as photo tags (e.g. "리아", "지후") rather than as calendar
    # participants, so tags already used on our photos count as known names too. Date tags
    # (YYMMDD) are not names.
    used_tags = {t for r in rows for t in re.split(r'[\s,#]+', r.get('tags') or '') if t and not t.isdigit()}
    labels = list(dict.fromkeys(person_labels(args.calendar) + sorted(used_tags)))
    to_label = name_mapper(labels, aliases)
    print(f'우리 사진 {len(rows)}장의 썸네일을 비교용으로 준비합니다 (처음 한 번은 몇 분 걸리고, 다음부터는 저장해 둔 값을 씁니다)')
    hashes = []
    with ThreadPoolExecutor(8) as pool:
        for i, h in enumerate(pool.map(lambda r: hash_url(r.get('thumb') or r.get('full')), rows), 1):
            hashes.append(h)
            if i % 100 == 0 or i == len(rows):
                print(f'  {i}/{len(rows)}', flush=True)
    ours = [(r, h, date_tokens(r.get('tags'))) for r, h in zip(rows, hashes) if h]
    # Comparing every Takeout original with every calendar thumbnail turns 38k originals into
    # tens of millions of Python hash comparisons. Date is an independent source fact, so use
    # it to form the candidate set first; keep untagged calendar photos in the set so the
    # importer can still repair their missing date. The no-date fallback stays intentionally
    # strict (ANY_DAY_DISTANCE) and is only used when the source lacks a camera date.
    ours_by_date = {}
    undated_ours = []
    for entry in ours:
        if entry[2]:
            for date in entry[2]:
                ours_by_date.setdefault(date, []).append(entry)
        else:
            undated_ours.append(entry)

    def candidate_rows(source_date):
        if not source_date:
            return ours
        dated = []
        for offset in (-1, 0, 1):
            dated.extend(ours_by_date.get(source_date + timedelta(days=offset), []))
        # A photo without a current date tag can only match at the almost-exact threshold below.
        # Deduplicate burst photos that happen to have both adjacent date labels.
        seen = set()
        return [entry for entry in dated + undated_ours
                if not (entry[0]['id'] in seen or seen.add(entry[0]['id']))]
    print(f'우리 사진 {len(ours)}장 해시 완료')

    source = from_apple() if args.apple else from_takeout(args.takeout)
    unknown, plan, seen_src, no_image, hashed_src, closest_hist, ambiguous = {}, {}, 0, 0, 0, {}, 0
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
        geo = item.get('geo') if args.places else None
        if not mapped and not geo and not item.get('date'):
            continue
        h = next((x for x in (hash_file(p) for p in item['paths']) if x), None)
        if not h:
            no_image += 1
            continue
        hashed_src += 1
        matches = []
        closest = 64
        for row, rh, dates in candidate_rows(item['date']):
            same_day = item['date'] and any(abs((item['date'] - d).days) <= 1 for d in dates)
            limit = SAME_DAY_DISTANCE if same_day else ANY_DAY_DISTANCE
            dist = hamming(h, rh)
            closest = min(closest, dist)
            if dist <= limit:
                matches.append((row, dist, bool(same_day)))
        # Diagnostics: how close the nearest of our photos came, so a 0-match run says why.
        bucket = '0-4' if closest <= 4 else '5-8' if closest <= 8 else '9-12' if closest <= 12 else '13-16' if closest <= 16 else '17+'
        closest_hist[bucket] = closest_hist.get(bucket, 0) + 1
        if not matches:
            continue
        matches.sort(key=lambda entry: (entry[1], not entry[2], entry[0]['id']))
        # A hash collision or near-identical burst must not assign a person's name/GPS to an
        # arbitrary sibling. Require a clearly better best match; duplicated images can be
        # handled manually after the importer shows them.
        if len(matches) > 1 and matches[1][1] <= matches[0][1] + 1:
            ambiguous += 1
            continue
        row = matches[0][0]
        entry = plan.setdefault(row['id'], {'row': row, 'names': [], 'dates': [], 'geo': None})
        entry['names'].extend(x for x in mapped if x not in entry['names'])
        if item.get('date') and not entry['dates']:
            entry['dates'].append(item['date'])
        elif item.get('date') and entry['dates'][0] != item['date']:
            # The same visual hash associated with two source dates is not a date fact. Keep
            # names/GPS reviewable, but never create competing calendar-day tags from it.
            entry['dateConflict'] = True
        if geo and not entry['geo']:
            entry['geo'] = geo

    changes = []
    for key, entry in plan.items():
        row = entry['row']
        current = [t for t in re.split(r'[\s,#]+', row.get('tags') or '') if t]
        add = [n for n in entry['names'] if n not in current]
        # A Takeout camera date is a direct metadata fact. Never add a second date when the
        # calendar already has one, even if its spelling is the long YYYYMMDD variant.
        if not entry.get('dateConflict') and not date_tokens(row.get('tags')):
            add.extend(date.strftime('%y%m%d') for date in entry['dates'] if date.strftime('%y%m%d') not in current)
        if not add:
            continue
        tags = ' '.join((current + add)[:MAX_TAGS])
        changes.append({'assetKey': key, 'add': add, 'item': {
            'imageUrl': row.get('full') or row.get('thumb'), 'thumbUrl': row.get('thumb') or row.get('full'),
            'messageId': row.get('messageId') or '', 'memoId': row.get('messageId') if row.get('source') == 'memo' else '',
            'directMediaUrl': row.get('directMediaUrl') or '', 'tags': tags}})

    # Location: only for our photos that have none (iOS Safari strips GPS from web uploads). The
    # coordinate goes onto each message/memo showing the photo (imageGeoMap, the same field the
    # browser writes after an upload); completePhotoLocationTags then adds the place tags.
    geo_changes = []
    for key, entry in plan.items():
        row = entry['row']
        if not entry.get('geo') or (row.get('latitude') is not None and row.get('longitude') is not None):
            continue
        owners = []
        for owner in row.get('owners') or []:
            m = re.match(r'^(message|memo):(.+):\d+$', str((owner or {}).get('sourceOwner') or ''))
            if m and (m.group(1), m.group(2)) not in owners:
                owners.append((m.group(1), m.group(2)))
        if owners:
            geo_changes.append({'assetKey': key, 'geo': entry['geo'], 'owners': owners})

    print(f'\n원본 사진 {seen_src}장 중 검증 메타데이터를 우리 사진 {len(plan)}장과 연결, 새 인물/촬영일 태그가 붙을 사진 {len(changes)}장')
    if ambiguous:
        print(f'가까운 일치가 둘 이상이라 안전하게 건너뛴 사진 {ambiguous}장')
    if args.places:
        print(f'위치가 없던 우리 사진 {len(geo_changes)}장에 원본의 촬영 위치를 넣습니다 (장소 태그는 서버가 위치로 붙임)')
    print(f'비교에 쓴 원본 사진 {hashed_src}장, 이 맥에 이미지가 없어 건너뛴 사진 {no_image}장')
    if no_image:
        print('  -> 사진 앱 > 설정 > iCloud > "이 Mac에 원본 다운로드"를 켜고, 다운로드가 끝난 뒤 다시 실행하면 늘어납니다.')
    if closest_hist:
        order = ['0-4', '5-8', '9-12', '13-16', '17+']
        print('가장 비슷한 우리 사진과의 차이(64칸 중 다른 칸 수, 작을수록 같은 사진): '
              + ', '.join(f'{k}: {closest_hist[k]}장' for k in order if k in closest_hist))
    for c in changes[:30]:
        print(f"  {c['assetKey']}: +{' '.join('#' + a for a in c['add'])}")
    if unknown:
        print('\n우리 인물 태그와 짝을 못 찾은 이름 (필요하면 --alias 원본=우리태그):')
        for n, k in sorted(unknown.items(), key=lambda x: -x[1])[:30]:
            print(f'  {n}: {k}장')
    if not args.apply:
        print('\n미리보기만 했습니다. 확인 후 --apply 를 붙여 다시 실행하세요.')
        return
    placed = 0
    for change in geo_changes:
        lat, lng = change['geo']
        value = {'mapValue': {'fields': {'lat': {'doubleValue': lat}, 'lng': {'doubleValue': lng}}}}
        body = {'fields': {'imageGeoMap': {'mapValue': {'fields': {change['assetKey']: value}}}}}
        ok = False
        for kind, doc_id in change['owners']:
            collection = 'messages' if kind == 'message' else 'memos'
            url = (f'{ROOT}/calendars/cal_{args.calendar}/{collection}/{urllib.parse.quote(doc_id)}'
                   f'?updateMask.fieldPaths=imageGeoMap.%60{change["assetKey"]}%60&currentDocument.exists=true')
            req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'}, method='PATCH')
            try:
                with urllib.request.urlopen(req, timeout=30):
                    ok = True
            except Exception as error:
                print(f"  위치 저장 실패 {collection}/{doc_id}: {error}")
        placed += 1 if ok else 0
    if geo_changes:
        print(f'{placed}장에 촬영 위치를 넣었습니다.')
    applied = 0
    for i in range(0, len(changes), 80):
        chunk = [c['item'] for c in changes[i:i + 80]]
        req = urllib.request.Request(COMMAND, data=json.dumps({'calendarId': args.calendar, 'op': 'bulkTagAssets', 'items': chunk}).encode(),
                                     headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req, timeout=60) as r:
            res = json.load(r)
        if res.get('ok') is not False:
            applied += len(chunk)
    print(f'\n{applied}장에 검증된 인물/촬영일 태그를 붙였습니다.')


if __name__ == '__main__':
    main()
