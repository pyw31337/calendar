#!/usr/bin/env python3
"""End-to-end check of import-people-tags.py on a fake Takeout folder and fake calendar photos.

No network: the calendar's photo list, the thumbnails and the tag command are replaced in memory.
Run:  python3 -I tools/local-media-worker/test_people_import.py   (needs Pillow; face part needs OpenCV)
"""
import contextlib
import importlib.util
import io
import json
import os
import random
import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from unittest import mock

HERE = os.path.dirname(os.path.abspath(__file__))
KST = timezone(timedelta(hours=9))


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, filename))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


people = load('people_import', 'import-people-tags.py')
from PIL import Image, ImageDraw  # noqa: E402  (after the importer's own Pillow check)


def picture(seed):
    """A distinct, photo-like test image (smooth background + a few shapes)."""
    rnd = random.Random(seed)
    im = Image.new('RGB', (1200, 900))
    draw = ImageDraw.Draw(im)
    for y in range(0, 900, 6):
        shade = int(255 * y / 900)
        draw.rectangle([0, y, 1200, y + 6], fill=(shade, rnd.randint(0, 255), 255 - shade))
    for _ in range(6):
        x, y = rnd.randint(0, 1000), rnd.randint(0, 700)
        draw.ellipse([x, y, x + rnd.randint(80, 300), y + rnd.randint(80, 300)],
                     fill=(rnd.randint(0, 255), rnd.randint(0, 255), rnd.randint(0, 255)))
    return im


def ms(day, hour=12):
    return int(datetime(day.year, day.month, day.day, hour, tzinfo=KST).timestamp() * 1000)


D = lambda text: datetime.strptime(text, '%Y-%m-%d').date()  # noqa: E731


class PeopleImportTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = self.tmp.name
        self.takeout = os.path.join(root, 'takeout', 'Google Photos', 'Photos from 2026')
        os.makedirs(self.takeout)
        self.ours_dir = os.path.join(root, 'ours')
        os.makedirs(self.ours_dir)
        people.CACHE = os.path.join(root, 'cache')
        people.PEOPLE_DIR = os.path.join(root, 'people')
        # (asset, our tags, upload day, capture day, Google names, extra row fields)
        self.cases = [
            ('asset:upload', '260926', '2026-09-26', '2026-08-07', ['박서준'], {}),
            ('asset:meeting', '260926 도은', '2026-09-27', '2026-08-01', ['Doeun Park'],
             {'messageId': 'meeting_cw_2026-09-26_1790475201467_0_x'}),
            ('asset:chosen', '260815 도은', '2026-09-20', '2026-08-15', ['Doeun Park'], {}),
            ('asset:doeun2', '260811 도은', '2026-08-11', '2026-08-11', ['Doeun Park'], {}),
            ('asset:doeun3', '260812 도은 서준', '2026-08-12', '2026-08-12', ['Doeun Park', '박서준'], {}),
        ]
        self.rows = []
        for index, (asset, tags, upload, capture, names, extra) in enumerate(self.cases):
            im = picture(index)
            original = os.path.join(self.takeout, f'IMG_{index}.jpg')
            im.save(original, quality=95)
            with open(original + '.supplemental-metadata.json', 'w') as fh:
                json.dump({'title': f'IMG_{index}.jpg', 'people': [{'name': n} for n in names],
                           'photoTakenTime': {'timestamp': str(ms(D(capture)) // 1000)}}, fh)
            # Our copy: the browser re-encodes a smaller JPEG on upload.
            ours = os.path.join(self.ours_dir, f'{index}.jpg')
            small = im.copy()
            small.thumbnail((480, 480))
            small.save(ours, quality=70)
            self.rows.append({'id': asset, 'thumb': ours, 'full': ours, 'tags': tags,
                              'timestamp': ms(D(upload)), 'messageId': extra.get('messageId', f'm{index}'),
                              'source': 'chat', 'owners': [], **extra})
        # Photos without 도은, so the 도은 tag is specific to that person (lift).
        for index in range(5, 15):
            self.rows.append({'id': f'asset:other{index}', 'thumb': '', 'full': f'https://x/{index}.jpg',
                              'tags': f'2609{index:02d} 서준 바다', 'timestamp': ms(D('2026-09-01'))})
        self.sent = []

    def tearDown(self):
        self.tmp.cleanup()

    def run_importer(self, *flags):
        def fake_hash_url(url):
            if not os.path.exists(url):
                return None
            with Image.open(url) as im:
                return people.dhash(im)

        def fake_urlopen(req, timeout=None):
            body = json.loads(req.data.decode())
            self.sent.append(body)
            return contextlib.closing(io.BytesIO(json.dumps({'ok': True}).encode()))

        argv = ['import-people-tags.py', '--calendar', 'cw', '--takeout', os.path.join(self.tmp.name, 'takeout'), *flags]
        out = io.StringIO()
        with mock.patch.object(people, 'list_all', lambda path: [dict(r) for r in self.rows]), \
                mock.patch.object(people, 'person_labels', lambda cal: ['서준', '도은', '유리']), \
                mock.patch.object(people, 'hash_url', fake_hash_url), \
                mock.patch.object(people.urllib.request, 'urlopen', fake_urlopen), \
                mock.patch.object(sys, 'argv', argv), contextlib.redirect_stdout(out):
            people.main()
        return out.getvalue()

    def sent_tags(self):
        return {item['imageUrl']: item['tags'] for body in self.sent for item in body.get('items', [])}

    def test_preview_counts_upload_dates_and_suggests_name_pair(self):
        text = self.run_importer()
        self.assertIn('업로드한 날짜로 날짜 태그가 붙은 사진 1장: --fix-dates', text)
        self.assertIn('Doeun Park = 도은', text)
        self.assertIn('--alias "Doeun Park=도은"', text)
        self.assertEqual(self.sent, [], 'a preview sends nothing')
        self.assertFalse(os.path.exists(os.path.join(people.PEOPLE_DIR, 'verified-people-cw.json')))

    def test_fix_dates_accept_aliases_apply(self):
        text = self.run_importer('--fix-dates', '--accept-aliases', '--apply')
        tags = self.sent_tags()
        by_asset = {row['id']: tags.get(row['full']) for row in self.rows[:5]}
        # Upload day 260926 -> capture day 260807, in the same place, plus the verified person.
        self.assertEqual(by_asset['asset:upload'], '260807 서준')
        # The meeting's scheduled day stays; the accepted pair adds nothing new (도은 already there).
        self.assertIsNone(by_asset['asset:meeting'])
        # A date someone chose (or the real day) is never replaced.
        self.assertIsNone(by_asset['asset:chosen'])
        self.assertIsNone(by_asset['asset:doeun2'])
        self.assertIn('추천된 이름 짝 1개를 받아 저장했습니다: Doeun Park=도은', text)
        self.assertEqual(people.load_aliases('cw'), {'Doeun Park': '도은'})
        verified = people.load_verified_people('cw')
        self.assertEqual(verified['asset:upload'], ['서준'])
        self.assertEqual(verified['asset:doeun3'], ['도은', '서준'])
        self.assertEqual(verified['asset:meeting'], ['도은'])

        # The saved pair applies on the next run without any flag.
        self.sent.clear()
        text = self.run_importer()
        self.assertIn('저장해 둔 이름 짝 1개를 씁니다: Doeun Park=도은', text)
        self.assertNotIn('Doeun Park: ', text, 'no longer an unknown name')

    def test_without_fix_dates_upload_date_stays(self):
        self.run_importer('--apply')
        tags = self.sent_tags()
        self.assertEqual(tags.get(self.rows[0]['full']), '260926 서준', 'names still added, the date untouched')


class DateRuleTest(unittest.TestCase):
    def row(self, tags, upload, **extra):
        return {'tags': tags, 'timestamp': ms(D(upload)), **extra}

    def test_plan_date_fix(self):
        fix = people.plan_date_fix
        self.assertEqual(fix(self.row('260926 바다', '2026-09-26'), D('2026-08-07')), (['260807', '바다'], ['260926'], ['260807']))
        self.assertIsNone(fix(self.row('260926', '2026-09-26'), D('2026-09-25')), 'one day of time-zone slack')
        self.assertIsNone(fix(self.row('260815', '2026-09-26'), D('2026-08-07')), 'a chosen date is kept')
        self.assertIsNone(fix(self.row('260926', '2026-09-27', messageId='meeting_cw_2026-09-26_1_x'), D('2026-08-07')))
        # Capture day already tagged as well: the upload day just goes.
        self.assertEqual(fix(self.row('260807 260926', '2026-09-26'), D('2026-08-07')), (['260807'], ['260926'], []))

    def test_near_index_finds_every_hash_within_the_strict_distance(self):
        rnd = random.Random(7)
        entries = [({'id': str(i)}, rnd.getrandbits(64), set()) for i in range(3000)]
        index = people.NearIndex(entries)
        for _ in range(300):
            target = rnd.choice(entries)
            query = target[1]
            for bit in rnd.sample(range(64), people.ANY_DAY_DISTANCE):
                query ^= 1 << bit
            found = {e[0]['id'] for e in index.near(query)}
            expected = {e[0]['id'] for e in entries if people.hamming(e[1], query) <= people.ANY_DAY_DISTANCE}
            self.assertTrue(expected <= found)


class FaceLearningTest(unittest.TestCase):
    def test_verified_people_replace_family_tags_for_learning(self):
        try:
            faces = load('face_tags', 'face-tags.py')
        except SystemExit:
            self.skipTest('OpenCV not installed')
        variants = faces.person_variants(['박서준', '김도은'])
        tagged = {'a': {'박서준', '김도은'}, 'b': {'박서준'}, 'c': set()}
        verified = {'a': ['서준'], 'c': ['리아']}
        learn_from, known, trusted = faces.learning_people(tagged, verified, variants)
        self.assertEqual(learn_from['a'], {'박서준'}, 'Google saw one face: a clean sample')
        self.assertEqual(learn_from['b'], {'박서준'})
        self.assertEqual(learn_from['c'], set(), '리아 is not a person we learn: fall back to tags')
        self.assertEqual(trusted, {'a'})
        self.assertEqual(known['a'], {'박서준', '김도은'})


if __name__ == '__main__':
    unittest.main(verbosity=1)
