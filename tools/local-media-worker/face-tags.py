#!/usr/bin/env python3
"""얼굴 인식 인물 추천: 이미 인물 태그가 붙은 우리 사진으로 가족 얼굴을 배우고, 태그가 없는 사진에서
같은 얼굴을 찾아 "이 사진에 김유리 님이 있어요"라고 추천한다 (docs/photo-auto-tagging-plan.md 구현안 B).

- 얼굴 찾기 YuNet, 얼굴 비교 SFace (OpenCV 공식 모델, Apache-2.0). 처음 실행할 때 약 39MB를 받고 체크섬을 확인한다.
- 사진·얼굴 이미지·얼굴 특징값은 이 맥 밖으로 나가지 않는다
  (~/Library/Application Support/Moyeora/faces/faces.sqlite). 서버에는 사진 키 + 추천 이름 + 점수만 올라간다.
- 추천은 태그를 직접 바꾸지 않는다. 보관함 > 추천 탭 "얼굴로 찾은 사람"에서 가족이 골라서 붙이거나
  "아니에요"를 누르면, 그 사진에는 그 이름을 다시 추천하지 않는다.
- 배우는 대상은 캘린더 참석자와 인물 탭에 추가한 인물 태그(customPersonTags)다. "박서준"은 "서준" 태그도
  같은 사람으로 본다. 얼굴이 하나뿐이고 인물 태그도 하나뿐인 사진이 기본 학습 자료다.

    source ~/.venvs/photos/bin/activate
    pip install opencv-python-headless numpy pillow     # 한 번만

    python tools/local-media-worker/face-tags.py                            # 미리보기: 사진 분석에 등록된 캘린더 전부
    python tools/local-media-worker/face-tags.py --calendar cw              # 미리보기: 한 캘린더만 (cw,kkot 처럼 여러 개도)
    python tools/local-media-worker/face-tags.py --upload                   # 추천을 앱으로 보냄
    python tools/local-media-worker/face-tags.py --enable-schedule          # 매일 밤 사진 분석 때 자동 실행
    python tools/local-media-worker/face-tags.py --disable-schedule --forget  # 끄고 이 맥의 얼굴 데이터 삭제
"""
import argparse
import hashlib
import importlib.util
import io
import json
import os
import re
import sqlite3
import subprocess
import sys
import time
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

try:
    import numpy as np
    import cv2
except ImportError:
    sys.exit("OpenCV가 필요합니다:  source ~/.venvs/photos/bin/activate && pip install opencv-python-headless numpy pillow")
if not hasattr(cv2, 'FaceDetectorYN') or not hasattr(cv2, 'FaceRecognizerSF'):
    sys.exit("OpenCV 4.5.4 이상이 필요합니다:  pip install -U opencv-python-headless")
try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow가 필요합니다:  pip install pillow")
try:
    import pillow_heif  # noqa: F401
    pillow_heif.register_heif_opener()
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.expanduser('~/Library/Application Support/Moyeora')
MODEL_DIR = os.environ.get('MOYEORA_FACE_MODELS') or os.path.join(APP_DIR, 'face-models')
DB_PATH = os.environ.get('MOYEORA_FACE_DB') or os.path.join(APP_DIR, 'faces', 'faces.sqlite')
DEFAULT_CONFIG = os.path.join(APP_DIR, 'media-worker.json')
LFS = 'https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models'
MODELS = {
    'yunet': (f'{LFS}/face_detection_yunet/face_detection_yunet_2023mar.onnx',
              '8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4'),
    'sface': (f'{LFS}/face_recognition_sface/face_recognition_sface_2021dec.onnx',
              '0ba9fbfa01b5270c96627c4ef784da859931e02f04419c829e83484087c34e79'),
}

DETECT_SCORE = 0.85   # YuNet confidence; lower picks up blurry/side faces that SFace cannot tell apart
MIN_FACE_PX = 40      # faces smaller than this (after downscale) carry too little detail
MAX_SIDE = 1600
MATCH = 0.42          # cosine on SFace features; OpenCV's same-person threshold is 0.363, kept stricter
MARGIN = 0.06         # best person must beat the runner-up by this much, or we say nothing
TOPK = 3              # score = mean of the 3 closest known faces (children change; one centroid would not)
MIN_SAMPLES = 3       # a person needs this many clean faces before we suggest them
PRUNE = 0.25          # a "clean" sample this far from the person's average is a mistagged photo
UPLOAD_BATCH = 100
VIDEO_EXT = re.compile(r'\.(mp4|mov|m4v|webm|avi|3gp)(?:$|[?#])', re.I)


# ---------- shared Firestore helpers (same as the people import) ----------
def _people_import():
    spec = importlib.util.spec_from_file_location('people_import', os.path.join(HERE, 'import-people-tags.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


# ---------- models ----------
def ensure_models():
    os.makedirs(MODEL_DIR, exist_ok=True)
    paths = {}
    for name, (url, sha) in MODELS.items():
        path = os.path.join(MODEL_DIR, os.path.basename(url))
        if not (os.path.exists(path) and _sha256(path) == sha):
            print(f'얼굴 모델 내려받는 중: {os.path.basename(path)}', flush=True)
            tmp = path + '.part'
            with urllib.request.urlopen(url, timeout=120) as r, open(tmp, 'wb') as f:
                f.write(r.read())
            if _sha256(tmp) != sha:
                os.remove(tmp)
                sys.exit(f'모델 파일 체크섬이 맞지 않습니다: {url}')
            os.replace(tmp, path)
        paths[name] = path
    return paths


def _sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


class FaceEngine:
    def __init__(self):
        paths = ensure_models()
        self.detector = cv2.FaceDetectorYN.create(paths['yunet'], '', (320, 320), DETECT_SCORE, 0.3, 5000)
        self.recognizer = cv2.FaceRecognizerSF.create(paths['sface'], '')

    def faces(self, bgr):
        """[(box, score, unit feature vector)] for every usable face in a BGR image."""
        h, w = bgr.shape[:2]
        self.detector.setInputSize((w, h))
        _, found = self.detector.detect(bgr)
        out = []
        for row in (found if found is not None else []):
            x, y, fw, fh = (float(v) for v in row[:4])
            if min(fw, fh) < MIN_FACE_PX:
                continue
            feature = self.recognizer.feature(self.recognizer.alignCrop(bgr, row)).flatten().astype(np.float32)
            feature /= (np.linalg.norm(feature) + 1e-9)
            out.append(((x, y, fw, fh), float(row[14]), feature))
        return out


def load_bgr(data):
    with Image.open(io.BytesIO(data)) as im:
        if getattr(im, 'is_animated', False):
            im.seek(0)
        im = ImageOps.exif_transpose(im).convert('RGB')
        im.thumbnail((MAX_SIDE, MAX_SIDE))
        return cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR)


# ---------- local cache ----------
def open_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.executescript('''
      CREATE TABLE IF NOT EXISTS photos (calendar TEXT, asset TEXT, url TEXT, faces INTEGER, error TEXT, at INTEGER,
                                         PRIMARY KEY (calendar, asset));
      CREATE TABLE IF NOT EXISTS faces (calendar TEXT, asset TEXT, idx INTEGER, x REAL, y REAL, w REAL, h REAL,
                                        score REAL, emb BLOB, PRIMARY KEY (calendar, asset, idx));
      CREATE TABLE IF NOT EXISTS uploaded (calendar TEXT, asset TEXT, names TEXT, PRIMARY KEY (calendar, asset));
      CREATE TABLE IF NOT EXISTS runs (calendar TEXT PRIMARY KEY, revision TEXT, at INTEGER);
    ''')
    return db


def photo_url(row):
    for key in ('full', 'imageUrl', 'thumb', 'thumbUrl'):
        value = str(row.get(key) or '').strip()
        if value.startswith('https://') and not VIDEO_EXT.search(value):
            return value
    return ''


def download(url):
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            return r.read(), ''
    except Exception as error:
        return None, str(error)[:200]


def scan_photos(db, engine, calendar, rows, max_new=0, quiet=False):
    """Detect faces on photos not seen before (or whose file changed). Returns how many were new."""
    known = {asset: url for asset, url in db.execute('SELECT asset, url FROM photos WHERE calendar = ?', (calendar,))}
    todo = [(row['id'], photo_url(row)) for row in rows if photo_url(row) and known.get(row['id']) != photo_url(row)]
    if max_new:
        todo = todo[:max_new]
    if not quiet:
        print(f'얼굴을 찾는 중... 새 사진 {len(todo)}장 (전에 본 사진은 저장해 둔 값을 씁니다)', flush=True)
    done = 0
    with ThreadPoolExecutor(6) as pool:
        for start in range(0, len(todo), 24):
            chunk = todo[start:start + 24]
            for (asset, url), (data, error) in zip(chunk, pool.map(lambda item: download(item[1]), chunk)):
                found = []
                if data:
                    try:
                        found = engine.faces(load_bgr(data))
                    except Exception as decode_error:
                        error = str(decode_error)[:200]
                db.execute('DELETE FROM faces WHERE calendar = ? AND asset = ?', (calendar, asset))
                for idx, (box, score, feature) in enumerate(found):
                    db.execute('INSERT INTO faces VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                               (calendar, asset, idx, *box, score, feature.astype(np.float32).tobytes()))
                db.execute('INSERT OR REPLACE INTO photos VALUES (?, ?, ?, ?, ?, ?)',
                           (calendar, asset, url, len(found), error or '', int(time.time())))
                done += 1
            db.commit()
            if not quiet and (done % 120 < 24 or done == len(todo)):
                print(f'  {done}/{len(todo)}', flush=True)
    return done


def load_faces(db, calendar, live_assets):
    out = defaultdict(list)
    for asset, emb in db.execute('SELECT asset, emb FROM faces WHERE calendar = ? ORDER BY asset, idx', (calendar,)):
        if asset in live_assets:
            out[asset].append(np.frombuffer(emb, dtype=np.float32))
    return out


# ---------- people ----------
def person_variants(labels):
    """박서준 also counts when a photo is tagged 서준 (the app's 인물 tab does the same)."""
    return {label: ([label, label[1:]] if re.fullmatch(r'[가-힣]{3}', label) else [label]) for label in labels}


def tag_tokens(tags):
    return [t for t in re.split(r'[\s,#]+', str(tags or '')) if t]


def people_in(tags, variants):
    tokens = set(tag_tokens(tags))
    return {label for label, names in variants.items() if any(name in tokens for name in names)}


def preferred_spelling(rows, variants):
    """The spelling the family actually types most (서준, not 박서준), so a suggestion matches."""
    use = defaultdict(int)
    for row in rows:
        for token in tag_tokens(row.get('tags')):
            use[token] += 1
    return {label: max(names, key=lambda name: (use[name], name == label)) for label, names in variants.items()}


# ---------- learning and matching (pure numpy; unit-tested with public faces) ----------
def score_people(gallery, feature):
    scores = {}
    for label, known in gallery.items():
        sims = known @ feature
        k = min(TOPK, len(sims))
        scores[label] = float(np.sort(sims)[-k:].mean())
    return scores


def prune(samples):
    gallery = {}
    for label, features in samples.items():
        stack = np.stack(features)
        center = stack.mean(0)
        center /= (np.linalg.norm(center) + 1e-9)
        keep = stack[stack @ center >= PRUNE]
        if len(keep) >= MIN_SAMPLES:
            gallery[label] = keep
    return gallery


def assign(gallery, features, allowed=None):
    """Each face -> at most one person, each person at most once per photo, most confident first."""
    candidates = []
    for index, feature in enumerate(features):
        scores = score_people(gallery, feature)
        if allowed is not None:
            scores = {label: value for label, value in scores.items() if label in allowed}
        ranked = sorted(scores.items(), key=lambda item: -item[1])
        if not ranked:
            continue
        best, value = ranked[0]
        runner_up = ranked[1][1] if len(ranked) > 1 else 0.0
        if value >= MATCH and value - runner_up >= MARGIN:
            candidates.append((value, index, best))
    used_faces, used_people, out = set(), set(), []
    for value, index, label in sorted(candidates, reverse=True):
        if index in used_faces or label in used_people:
            continue
        used_faces.add(index)
        used_people.add(label)
        out.append((label, value, index))
    return out


def learn(photo_faces, photo_people):
    """Clean samples: one face + one person tag. Then photos with as many faces as person tags add
    the faces the first gallery can place (e.g. a two-person selfie tagged with both names)."""
    samples = defaultdict(list)
    for asset, features in photo_faces.items():
        people = photo_people.get(asset) or set()
        if len(features) == 1 and len(people) == 1:
            samples[next(iter(people))].append(features[0])
    gallery = prune(samples)
    for asset, features in photo_faces.items():
        people = photo_people.get(asset) or set()
        if len(features) >= 2 and len(features) == len(people) and people <= set(gallery):
            for label, _, index in assign(gallery, features, allowed=people):
                samples[label].append(features[index])
    return prune(samples), {label: len(features) for label, features in samples.items()}


def self_check(gallery):
    """Leave-one-out on the learned faces: how often a known face would be named right/wrong."""
    right = wrong = unknown = 0
    for label, known in gallery.items():
        for i in range(len(known)):
            rest = dict(gallery)
            rest[label] = np.delete(known, i, axis=0)
            if len(rest[label]) == 0:
                continue
            got = assign(rest, [known[i]])
            if not got:
                unknown += 1
            elif got[0][0] == label:
                right += 1
            else:
                wrong += 1
    return right, wrong, unknown


def suggest(gallery, photo_faces, photo_people):
    out = {}
    for asset, features in photo_faces.items():
        tagged = photo_people.get(asset) or set()
        names = [(label, value) for label, value, _ in assign(gallery, features) if label not in tagged]
        if names:
            out[asset] = names
    return out


# ---------- upload ----------
def read_config(path):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return {}


def worker_token(config):
    cmd = ['/usr/bin/security', 'find-generic-password', '-s', config.get('tokenService') or 'Moyeora Media Analysis Worker', '-w']
    if config.get('tokenAccount'):
        cmd[2:2] = ['-a', config['tokenAccount']]
    try:
        return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout.strip()
    except Exception:
        sys.exit('사진 분석 워커 토큰을 키체인에서 찾지 못했습니다 (setup-media-analysis-worker.sh를 먼저 실행하세요).')


def upload(db, calendar, config, suggestions, photo_faces, spelling, quiet=False):
    project = config.get('projectId') or 'metro-live-2918e'
    endpoint = config.get('endpoint') or f'https://asia-northeast3-{project}.cloudfunctions.net/ingestMediaAnalysis'
    previous = {asset: names for asset, names in db.execute('SELECT asset, names FROM uploaded WHERE calendar = ?', (calendar,))}
    items, now = [], int(time.time() * 1000)
    for asset in set(photo_faces) | set(previous):
        people = [{'name': spelling.get(label, label), 'score': round(value, 3)} for label, value in suggestions.get(asset, [])]
        signature = json.dumps(sorted(p['name'] for p in people), ensure_ascii=False)
        if previous.get(asset, '[]') == signature:
            continue
        items.append({'assetKey': asset, 'facePeople': people, 'faceCount': len(photo_faces.get(asset, [])), 'faceAnalyzedAt': now, '_sig': signature})
    if not items:
        if not quiet:
            print('앱에 새로 보낼 추천이 없습니다.')
        return 0
    token = worker_token(config)
    sent = 0
    for start in range(0, len(items), UPLOAD_BATCH):
        chunk = items[start:start + UPLOAD_BATCH]
        body = {'calendarId': calendar, 'kind': 'faces', 'workerId': 'macos-faces',
                'items': [{k: v for k, v in item.items() if k != '_sig'} for item in chunk]}
        req = urllib.request.Request(endpoint, data=json.dumps(body, ensure_ascii=False).encode(), method='POST',
                                     headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'})
        with urllib.request.urlopen(req, timeout=60) as r:
            result = json.load(r)
        if not result.get('ok'):
            raise RuntimeError(result.get('message') or 'upload failed')
        for item in chunk:
            db.execute('INSERT OR REPLACE INTO uploaded VALUES (?, ?, ?)', (calendar, item['assetKey'], item['_sig']))
        db.commit()
        sent += len(chunk)
    if not quiet:
        print(f'앱으로 보낸 사진 {sent}장 (보관함 > 추천 > 얼굴로 찾은 사람)')
    return sent


def set_schedule(config_path, enabled):
    config = read_config(config_path)
    if not config:
        sys.exit(f'{config_path} 가 없습니다. 사진 분석 워커(setup-media-analysis-worker.sh)를 먼저 설정하세요.')
    if enabled:
        config['facePython'] = sys.executable
    else:
        config.pop('facePython', None)
    with open(config_path, 'w') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(f'매일 사진 분석 때 얼굴 추천도 같이 돌도록 설정했습니다 ({sys.executable}).' if enabled
          else '매일 얼굴 추천을 껐습니다. 앱에 이미 올라간 추천은 남아 있고, 붙이지 않으면 태그는 바뀌지 않습니다.')


def forget():
    for path in (DB_PATH, DB_PATH + '-journal'):
        if os.path.exists(path):
            os.remove(path)
    print(f'이 맥에 저장된 얼굴 데이터를 지웠습니다 ({DB_PATH}).')


def main():
    ap = argparse.ArgumentParser(description='우리 사진의 인물 태그로 얼굴을 배워 태그 없는 사진에 인물을 추천합니다')
    ap.add_argument('--calendar', help='cw 또는 cw,kkot,jhair. 생략하면 사진 분석에 등록된 캘린더 전부')
    ap.add_argument('--config', default=DEFAULT_CONFIG)
    ap.add_argument('--upload', action='store_true', help='추천을 앱(보관함 > 추천)으로 보냄')
    ap.add_argument('--max-new', type=int, default=0, help='이번에 새로 볼 사진 수 제한 (0 = 전부)')
    ap.add_argument('--quiet', action='store_true')
    ap.add_argument('--if-changed', action='store_true', help='사진이 바뀌었거나 몇 시간 지났을 때만 (자동 실행용)')
    ap.add_argument('--enable-schedule', action='store_true', help='매일 사진 분석 때 자동 실행')
    ap.add_argument('--disable-schedule', action='store_true', help='매일 자동 실행 끄기')
    ap.add_argument('--forget', action='store_true', help='이 맥에 저장된 얼굴 데이터 삭제')
    args = ap.parse_args()
    if args.enable_schedule or args.disable_schedule or args.forget:
        if args.enable_schedule or args.disable_schedule:
            set_schedule(args.config, args.enable_schedule)
        if args.forget:
            forget()
        return
    config = read_config(args.config)
    calendars = [c.strip() for c in (args.calendar or '').split(',') if c.strip()] or list(config.get('calendarIds') or [])
    if not calendars:
        sys.exit('--calendar 를 주세요 (예: --calendar cw). 사진 분석 워커를 설정했다면 그 캘린더 전부를 자동으로 봅니다.')
    bad = [c for c in calendars if not re.fullmatch(r'[A-Za-z0-9_-]{1,60}', c)]
    if bad:
        sys.exit(f'캘린더 id 형식이 아닙니다: {", ".join(bad)}')

    people_import = _people_import()
    engine = FaceEngine()
    db = open_db()
    failed = []
    for calendar in calendars:
        if not args.quiet and len(calendars) > 1:
            print(f'\n===== {calendar} =====')
        try:
            run_calendar(calendar, args, config, people_import, engine, db)
        except Exception as error:  # one calendar failing must not stop the others
            failed.append(calendar)
            print(f'{calendar}: 실패 - {str(error)[:200]}', file=sys.stderr)
    if failed:
        sys.exit(1)


def photo_index_revision(people_import, calendar):
    try:
        doc = people_import._get(f'{people_import.ROOT}/calendars/cal_{calendar}/photoIndexMeta/summary')
        return str(people_import._decode(doc.get('fields', {}).get('revision', {'nullValue': None})) or '')
    except Exception:
        return ''


def run_calendar(calendar, args, config, people_import, engine, db):
    """Faces are learned and matched per calendar: people, photos and suggestions never cross
    from one calendar to another (each calendar is its own group)."""
    revision = photo_index_revision(people_import, calendar)
    if args.if_changed:
        # The scheduler checks every 15 minutes, but only new data is worth any work: skip unless
        # the photo index changed (new upload, tag edit, person tag). That check is one document
        # read; no time-based full re-run.
        last = db.execute('SELECT revision, at FROM runs WHERE calendar = ?', (calendar,)).fetchone()
        # No revision document (older calendars) -> at most once a day.
        if last and (last[0] == revision if revision else time.time() - (last[1] or 0) < 24 * 3600):
            return
    rows = [r for r in people_import.list_all(f'calendars/cal_{calendar}/photoIndex') if photo_url(r)]
    labels = people_import.person_labels(calendar)
    variants = person_variants(labels)
    spelling = preferred_spelling(rows, variants)

    scan_photos(db, engine, calendar, rows, args.max_new, args.quiet)
    photo_faces = load_faces(db, calendar, {r['id'] for r in rows})
    photo_people = {r['id']: people_in(r.get('tags'), variants) for r in rows}
    gallery, sample_counts = learn(photo_faces, photo_people)
    suggestions = suggest(gallery, photo_faces, photo_people)

    if not args.quiet:
        face_total = sum(len(v) for v in photo_faces.values())
        print(f'\n사진 {len(rows)}장에서 얼굴 {face_total}개를 찾았습니다.')
        print('인물 태그로 배운 사람 (배운 얼굴 수):')
        print('  ' + ', '.join(f'{spelling.get(l, l)} {len(f)}' for l, f in sorted(gallery.items(), key=lambda x: -len(x[1]))) if gallery else '  (아직 없음)')
        short = [f'{spelling.get(l, l)} {n}' for l, n in sample_counts.items() if l not in gallery]
        never = [spelling.get(l, l) for l in labels if l not in sample_counts]
        if short or never:
            print(f'  얼굴이 {MIN_SAMPLES}장 미만이라 아직 못 배운 사람: ' + ', '.join(short + [f'{n} 0' for n in never]))
            print('  -> 그 사람 혼자 나온 사진에 인물 태그를 몇 장 붙이면 배웁니다.')
        right, wrong, unknown = self_check(gallery)
        total = right + wrong + unknown
        if total:
            print(f'배운 얼굴로 스스로 시험: 맞힘 {right * 100 // total}% · 틀림 {wrong * 100 // total}% · 모름(추천 안 함) {unknown * 100 // total}%')
        per_person = defaultdict(int)
        for names in suggestions.values():
            for label, _ in names:
                per_person[spelling.get(label, label)] += 1
        print(f'\n새로 추천할 사진 {len(suggestions)}장: ' + ', '.join(f'{n} {k}장' for n, k in sorted(per_person.items(), key=lambda x: -x[1])))
        for asset, names in list(suggestions.items())[:15]:
            print(f"  {asset}: " + ' '.join(f'+#{spelling.get(l, l)}({v:.2f})' for l, v in names))

    if args.upload:
        upload(db, calendar, config, suggestions, photo_faces, spelling, args.quiet)
    elif not args.quiet:
        print('\n미리보기만 했습니다. 앱 추천으로 보내려면 --upload 를 붙여 다시 실행하세요.')
    db.execute('INSERT OR REPLACE INTO runs VALUES (?, ?, ?)', (calendar, revision, int(time.time())))
    db.commit()

if __name__ == '__main__':
    main()
