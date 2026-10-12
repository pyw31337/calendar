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
    #    --fix-dates 를 붙이면 업로드한 날짜로 붙은 날짜 태그를 원본의 실제 촬영일로 바꾼다 (모임 날짜 태그나
    #    사람이 직접 고친 날짜는 그대로 둔다). 붙이지 않아도 미리보기에서 바꿀 수 있는 사진 수를 알려 준다.
    # 2) 이름이 다르게 저장돼 있으면 짝지어 주기 (예: 구글 "박서준" -> 우리 "서준")
    ... --alias 박서준=서준 --alias "Yuri Kim=유리"
    #    미리보기가 같은 사진들의 기존 태그를 보고 짝을 추천한다. 맞으면 --accept-aliases 로 한 번에 받는다.
    #    한 번 정한 짝은 이 맥에 저장돼 다음부터 자동으로 쓰인다 (지우기: --forget-alias 이름).
    # 3) 확인 후 적용
    ... --apply
    #    적용하면 구글/애플이 확인한 "이 사진에 누가 있다" 목록을 이 맥에 남겨 얼굴 인식(face-tags.py)이 그 사진들로
    #    가족 얼굴을 더 정확히 배운다. 사진이나 얼굴은 저장하지 않고, 사진 키와 이름만 남는다.
"""
import argparse
import hashlib
import io
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import zipfile
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

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
# Confirmed name pairs and the people Google/Apple verified per photo stay on this Mac.
PEOPLE_DIR = os.environ.get('MOYEORA_PEOPLE_DIR') or os.path.expanduser('~/Library/Application Support/Moyeora/people')
MAX_TAGS = 20
SAME_DAY_DISTANCE = 8     # of 64 bits; thumbnails of the same shot land well under this
ANY_DAY_DISTANCE = 2      # no date agreement: accept only an almost exact duplicate
KST = timezone(timedelta(hours=9))
NON_PERSON_TAGS = {'인물아님'}
ALIAS_MIN_PHOTOS = 3      # a name pair is suggested only after this many shared photos
ALIAS_MIN_SHARE = 0.6     # ...and when the tag sits on most of that name's photos
ALIAS_MIN_LIFT = 2.0      # ...far more often than on photos in general (not just a common tag)


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


def _read_cached_hash(path):
    try:
        with open(path) as fh:
            return int(fh.read() or 0)
    except (OSError, ValueError):
        return 0


def hash_file(path):
    """path is a file path, or a callable returning an open binary file (a zip member)."""
    cache_file = None
    if isinstance(path, str):
        try:
            info = os.stat(path)
            # Cache only the 64-bit derivative, keyed by the source path and the two fields that
            # can change its pixels. An interrupted 50 GB import then resumes instead of decoding
            # every HEIC again; no original image or Takeout metadata enters this cache.
            key = hashlib.sha256(f'{path}\0{info.st_size}\0{info.st_mtime_ns}'.encode()).hexdigest()
            cache_file = os.path.join(CACHE, 'source-' + key + '.hash')
            if os.path.exists(cache_file):
                value = _read_cached_hash(cache_file)
                if value:
                    return value
        except (OSError, ValueError):
            cache_file = None
    try:
        source = path() if callable(path) else path
        with Image.open(source) as im:
            im.draft('RGB', (256, 256))
            # Phone cameras store the pixels sideways with an EXIF Orientation flag, while our copy
            # was re-encoded upright by the browser. Hash the photo the way it is shown: without
            # this a portrait phone photo never matched its own upload.
            upright = ImageOps.exif_transpose(im)
            upright.thumbnail((256, 256))
            value = dhash(upright)
        if cache_file:
            os.makedirs(CACHE, exist_ok=True)
            with open(cache_file, 'w') as fh:
                fh.write(str(value))
        return value
    except Exception:
        return None


def hash_url(url):
    os.makedirs(CACHE, exist_ok=True)
    key = re.sub(r'[^A-Za-z0-9]', '_', url.split('?')[0].split('%2F')[-1])[-120:]
    cached = os.path.join(CACHE, key + '.hash')
    if os.path.exists(cached):
        return _read_cached_hash(cached) or None
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


def tag_tokens(tags):
    return [t for t in re.split(r'[\s,#]+', str(tags or '')) if t]


def token_date(token):
    """The day a YYMMDD tag names, or None for any other tag."""
    if not re.fullmatch(r'\d{6}', token or ''):
        return None
    try:
        return datetime.strptime('20' + token, '%Y%m%d').date()
    except ValueError:
        return None


def kst_day(ms):
    try:
        return datetime.fromtimestamp(int(ms) / 1000, KST).date() if int(ms) > 0 else None
    except (TypeError, ValueError, OverflowError, OSError):
        return None


def upload_days(row):
    """Days (KST) the photo was posted: the row's and every owner's message time."""
    days = {kst_day(row.get('timestamp'))}
    days.update(kst_day((owner or {}).get('timestamp')) for owner in row.get('owners') or [] if isinstance(owner, dict))
    return {day for day in days if day}


def meeting_days(row):
    """Scheduled meeting days a photo belongs to; their date tag is a calendar fact, never "wrong"."""
    days = set()
    for item in [row] + [o for o in row.get('owners') or [] if isinstance(o, dict)]:
        for value in (item.get('meetingDate'), item.get('messageId'), item.get('sourceOwner')):
            m = re.search(r'(?:^|meeting_.*?_)(\d{4}-\d{2}-\d{2})(?:_|$)', str(value or ''))
            if m:
                try:
                    days.add(datetime.strptime(m.group(1), '%Y-%m-%d').date())
                except ValueError:
                    pass
    return days


def plan_date_fix(row, capture):
    """(new tag tokens, removed tags, added tags) that put the capture day in place of an upload-day
    date tag, or None. A meeting's scheduled day stays, and a date tag on any other day (someone
    chose it) leaves the photo untouched. One day of slack absorbs time zones."""
    if not capture:
        return None
    tokens = tag_tokens(row.get('tags'))
    uploads, keep = upload_days(row), meeting_days(row)
    wrong, near_capture = [], False
    for token in tokens:
        day = token_date(token)
        if not day:
            continue
        if abs((day - capture).days) <= 1:
            near_capture = True
        elif day in keep:
            continue
        elif day in uploads:
            wrong.append(token)
        else:
            return None
    if not wrong:
        return None
    capture_tag = capture.strftime('%y%m%d')
    out, placed = [], near_capture
    for token in tokens:
        if token in wrong:
            if not placed:
                out.append(capture_tag)
                placed = True
            continue
        out.append(token)
    return out, sorted(set(wrong)), ([] if near_capture else [capture_tag])


class NearIndex:
    """Rows within ANY_DAY_DISTANCE bits of a hash without scanning every row: with at most 3
    differing bits one of the four 16-bit quarters is identical (pigeonhole)."""
    def __init__(self, entries):
        assert ANY_DAY_DISTANCE <= 3
        self.buckets = [defaultdict(list) for _ in range(4)]
        for entry in entries:
            for i in range(4):
                self.buckets[i][(entry[1] >> (16 * i)) & 0xFFFF].append(entry)

    def near(self, value):
        seen, out = set(), []
        for i in range(4):
            for entry in self.buckets[i].get((value >> (16 * i)) & 0xFFFF, ()):
                if entry[0]['id'] not in seen:
                    seen.add(entry[0]['id'])
                    out.append(entry)
        return out


# ---------- local files (this Mac only) ----------
def _people_file(kind, calendar_id):
    return os.path.join(PEOPLE_DIR, f'{kind}-{calendar_id}.json')


def _read_json_file(path):
    try:
        with open(path, encoding='utf-8') as fh:
            data = json.load(fh)
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def _write_json_file(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + '.part'
    with open(tmp, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1, sort_keys=True)
        fh.write('\n')
    os.replace(tmp, path)


def load_aliases(calendar_id):
    aliases = _read_json_file(_people_file('aliases', calendar_id)).get('aliases') or {}
    return {str(k): str(v) for k, v in aliases.items() if k and v}


def save_aliases(calendar_id, aliases):
    _write_json_file(_people_file('aliases', calendar_id), {'aliases': dict(sorted(aliases.items()))})


def load_verified_people(calendar_id):
    """{assetKey: [tag names]} for photos whose people Google/Apple named (face-tags.py learns from these)."""
    photos = _read_json_file(_people_file('verified-people', calendar_id)).get('photos') or {}
    return {key: [str(n) for n in (value or {}).get('people') or [] if n] for key, value in photos.items()
            if isinstance(value, dict)}


def save_verified_people(calendar_id, verified, source):
    path = _people_file('verified-people', calendar_id)
    photos = _read_json_file(path).get('photos') or {}
    now = int(datetime.now(timezone.utc).timestamp() * 1000)
    for key, people in verified.items():
        if people:
            photos[key] = {'people': sorted(set(people)), 'source': source, 'at': now}
    _write_json_file(path, {'calendar': calendar_id, 'photos': photos})
    return path


def suggest_aliases(entries, to_label, token_rows, row_count, person_set):
    """[(source name, our tag, shared photos, photos with that name)] for names we could not place:
    the tag that already sits on most of that person's matched photos, far more often than on photos
    in general. Tags another name of the same photo already explains do not count, and two names
    with the same best tag (siblings who are always together) get no suggestion."""
    totals, together = Counter(), defaultdict(Counter)
    for entry in entries:
        tokens = {t for t in tag_tokens(entry['row'].get('tags')) if not token_date(t) and t not in NON_PERSON_TAGS}
        names = list(dict.fromkeys(entry['raw']))
        explained = {to_label(n) for n in names} - {None}
        for name in names:
            if to_label(name):
                continue
            totals[name] += 1
            for token in tokens - explained:
                together[name][token] += 1
    picks = {}
    for name, total in totals.items():
        good = []
        for token, shared in together[name].items():
            lift = (shared / total) / max(token_rows.get(token, 0) / max(row_count, 1), 1e-9)
            if shared >= ALIAS_MIN_PHOTOS and shared / total >= ALIAS_MIN_SHARE and lift >= ALIAS_MIN_LIFT:
                good.append((token in person_set, shared, token))
        good.sort(reverse=True)
        if not good or (len(good) > 1 and good[1][:2] == good[0][:2]):
            continue
        picks[name] = (good[0][2], good[0][1], total)
    by_tag = Counter(tag for tag, _, _ in picks.values())
    return sorted(((name, tag, shared, total) for name, (tag, shared, total) in picks.items() if by_tag[tag] == 1),
                  key=lambda item: (-item[2], item[0]))


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
    ap.add_argument('--accept-aliases', action='store_true', help='미리보기가 추천한 이름 짝을 모두 받아 저장하고 이번에 바로 쓴다')
    ap.add_argument('--forget-alias', action='append', default=[], help='저장해 둔 이름 짝 지우기 (원본이름)')
    ap.add_argument('--places', action='store_true',
                    help='원본의 촬영 위치도 가져온다 (위치가 없는 우리 사진만; 서버가 그 위치로 장소 태그를 붙인다)')
    ap.add_argument('--fix-dates', action='store_true',
                    help='업로드한 날짜로 붙은 날짜 태그를 원본의 실제 촬영일로 바꾼다 (모임 날짜·직접 고친 날짜는 유지)')
    ap.add_argument('--apply', action='store_true')
    args = ap.parse_args()
    if not re.fullmatch(r'[a-z0-9_-]{1,60}', args.calendar, re.I):
        sys.exit('calendar id 형식이 아닙니다')

    # Name pairs chosen before (this Mac only) apply automatically; --alias adds or overrides one.
    saved_aliases = load_aliases(args.calendar)
    aliases = dict(saved_aliases)
    aliases.update(dict(a.split('=', 1) for a in args.alias if '=' in a))
    for name in args.forget_alias:
        aliases.pop(name, None)
    if aliases != saved_aliases:
        save_aliases(args.calendar, aliases)
        print(f'이름 짝 {len(aliases)}개를 이 맥에 저장했습니다 (다음부터 자동으로 씁니다).')
    elif aliases:
        print(f'저장해 둔 이름 짝 {len(aliases)}개를 씁니다: ' + ', '.join(f'{k}={v}' for k, v in sorted(aliases.items())[:10]))
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
    token_rows = Counter(t for r in rows for t in set(tag_tokens(r.get('tags'))))
    # Comparing every Takeout original with every calendar thumbnail turns 38k originals into
    # tens of millions of Python hash comparisons. Date is an independent source fact, so use
    # it to form the candidate set first; keep untagged calendar photos in the set so the
    # importer can still repair their missing date. The no-date fallback stays intentionally
    # strict (ANY_DAY_DISTANCE) and is only used when the source lacks a camera date.
    ours_by_date = {}
    for entry in ours:
        for date in entry[2]:
            ours_by_date.setdefault(date, []).append(entry)
    # Any of our photos can still match at the almost-exact threshold, whatever its date tag says:
    # an undated photo, one tagged with the day it was uploaded (its real capture day's bucket
    # never holds it; --fix-dates then gives it the real date) or a meeting photo taken earlier.
    # The index finds those few without comparing against every photo.
    strict = NearIndex(ours)

    def candidate_rows(source_date, value):
        if not source_date:
            return strict.near(value)
        dated = []
        for offset in (-1, 0, 1):
            dated.extend(ours_by_date.get(source_date + timedelta(days=offset), []))
        # Deduplicate burst photos that happen to have both adjacent date labels.
        seen = set()
        return [entry for entry in dated + strict.near(value)
                if not (entry[0]['id'] in seen or seen.add(entry[0]['id']))]
    print(f'우리 사진 {len(ours)}장 해시 완료')

    # Materialise only compact JSON/paths descriptors, then decode originals in parallel. On a
    # 50 GB Takeout the old serial decoder spent close to an hour before it could even show a
    # dry-run result; image bytes remain local and are discarded as soon as their hash is made.
    source = list(from_apple() if args.apple else from_takeout(args.takeout))
    print(f'원본 메타데이터 {len(source)}건을 읽었습니다. 지각 해시를 병렬로 계산합니다.')

    def item_hash(item):
        return next((value for value in (hash_file(path) for path in item['paths']) if value), None)

    plan, seen_src, no_image, hashed_src, closest_hist, ambiguous = {}, 0, 0, 0, {}, 0
    print('원본 사진과 비교하는 중...')
    with ThreadPoolExecutor(8) as pool:
      hashed_source = pool.map(item_hash, source)
      for item, h in zip(source, hashed_source):
        seen_src += 1
        if seen_src % 200 == 0:
            print(f'  {seen_src}장 확인', flush=True)
        # Names are mapped to our tags after matching, so a name pair suggested from these very
        # matches (--accept-aliases) applies in the same run.
        geo = item.get('geo') if args.places else None
        if not item['names'] and not geo and not item.get('date'):
            continue
        if not h:
            no_image += 1
            continue
        hashed_src += 1
        matches = []
        closest = 64
        for row, rh, dates in candidate_rows(item['date'], h):
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
        entry = plan.setdefault(row['id'], {'row': row, 'raw': [], 'dates': [], 'geo': None})
        entry['raw'].extend(x for x in item['names'] if x not in entry['raw'])
        if item.get('date') and not entry['dates']:
            entry['dates'].append(item['date'])
        elif item.get('date') and entry['dates'][0] != item['date']:
            # The same visual hash associated with two source dates is not a date fact. Keep
            # names/GPS reviewable, but never create competing calendar-day tags from it.
            entry['dateConflict'] = True
        if geo and not entry['geo']:
            entry['geo'] = geo

    # Name pairs: for each source name we could not place, the tag already on most of its photos.
    person_set = set(person_labels(args.calendar))
    alias_suggestions = suggest_aliases(plan.values(), to_label, token_rows, len(rows), person_set)
    if args.accept_aliases and alias_suggestions:
        aliases.update({name: tag for name, tag, _, _ in alias_suggestions})
        save_aliases(args.calendar, aliases)
        to_label = name_mapper(labels, aliases)
        print(f'추천된 이름 짝 {len(alias_suggestions)}개를 받아 저장했습니다: '
              + ', '.join(f'{name}={tag}' for name, tag, _, _ in alias_suggestions))
        alias_suggestions = []
    unknown = Counter()
    for entry in plan.values():
        entry['names'] = list(dict.fromkeys(label for label in map(to_label, entry['raw']) if label))
        unknown.update(name for name in entry['raw'] if not to_label(name))

    changes, date_fixes = [], 0
    for key, entry in plan.items():
        row = entry['row']
        current = tag_tokens(row.get('tags'))
        # An upload-day date tag on a photo whose camera date we now know is the wrong day.
        fix = plan_date_fix(row, entry['dates'][0]) if entry['dates'] and not entry.get('dateConflict') else None
        if fix:
            date_fixes += 1
        base = fix[0] if fix and args.fix_dates else current
        add = [n for n in entry['names'] if n not in base]
        # A Takeout camera date is a direct metadata fact. Never add a second date when the
        # calendar already has one, even if its spelling is the long YYYYMMDD variant.
        if not entry.get('dateConflict') and not date_tokens(row.get('tags')):
            add.extend(date.strftime('%y%m%d') for date in entry['dates'] if date.strftime('%y%m%d') not in current)
        fixed = fix if fix and args.fix_dates else None
        if not add and not fixed:
            continue
        tags = ' '.join((base + add)[:MAX_TAGS])
        changes.append({'assetKey': key, 'add': (fixed[2] if fixed else []) + add, 'remove': fixed[1] if fixed else [], 'item': {
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
    if date_fixes:
        print(f'업로드한 날짜로 날짜 태그가 붙은 사진 {date_fixes}장: '
              + ('실제 촬영일로 바꿉니다.' if args.fix_dates else '--fix-dates 를 붙이면 실제 촬영일로 바꿉니다.'))
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
        removed = ' '.join('-#' + r for r in c.get('remove') or [])
        print(f"  {c['assetKey']}: {removed + ' ' if removed else ''}+{' '.join('#' + a for a in c['add'])}")
    if alias_suggestions:
        print('\n같은 사진들의 기존 태그로 본 이름 짝 추천 (맞으면 --accept-aliases, 일부만이면 --alias 로):')
        for name, tag, shared, total in alias_suggestions[:30]:
            note = '' if tag in person_set else '  (인물 탭에 아직 없는 태그)'
            print(f"  {name} = {tag}   ({name} 사진 {total}장 중 {shared}장에 #{tag}){note}")
        print('  ' + ' '.join(f'--alias "{name}={tag}"' for name, tag, _, _ in alias_suggestions[:30]))
    suggested = {name for name, _, _, _ in alias_suggestions}
    rest = [(n, k) for n, k in unknown.most_common() if n not in suggested]
    if rest:
        print('\n우리 사진과 맞춘 사진에서 우리 인물 태그와 짝을 못 찾은 이름 (필요하면 --alias 원본=우리태그):')
        for n, k in rest[:30]:
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
    # Face learning: the people Google/Apple named on each matched photo (local file only).
    # A photo two different originals matched (different camera dates) is not verified.
    verified = {key: entry['names'] for key, entry in plan.items() if entry['names'] and not entry.get('dateConflict')}
    if verified:
        path = save_verified_people(args.calendar, verified, 'apple' if args.apple else 'takeout')
        print(f'얼굴 인식이 배울 수 있게 인물이 확인된 사진 {len(verified)}장을 이 맥에 남겼습니다 ({path}).')
        print('  -> python tools/local-media-worker/face-tags.py --calendar ' + args.calendar + ' 로 추천 정확도를 다시 확인하세요.')


if __name__ == '__main__':
    main()
