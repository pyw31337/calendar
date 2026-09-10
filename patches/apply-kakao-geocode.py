#!/usr/bin/env python3
"""Apply Kakao reverse-geocode tagging on latest main without touching UI files."""
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'patches' / 'kakao-geocode'


def fail(msg):
    print(f'[apply-kakao-geocode] FAIL: {msg}', file=sys.stderr)
    sys.exit(1)


def must_replace(path, old, new, label):
    text = path.read_text(encoding='utf-8')
    if new in text:
        print(f'[apply-kakao-geocode] already applied: {label}')
        return text
    if old not in text:
        fail(f'snippet not found in {path.relative_to(ROOT)} ({label})')
    updated = text.replace(old, new, 1)
    path.write_text(updated, encoding='utf-8')
    print(f'[apply-kakao-geocode] patched {path.relative_to(ROOT)} ({label})')
    return updated


def restore_from_hex(stem, dest):
    import gzip
    parts = sorted(SRC.glob(f'{stem}.*.hex'))
    if not parts:
        fail(f'missing hex parts for {stem}')
    hx = ''.join(part.read_text(encoding='utf-8').strip() for part in parts)
    dest.write_bytes(gzip.decompress(bytes.fromhex(hx)))
    print(f'[apply-kakao-geocode] restored {dest.relative_to(ROOT)} from {len(parts)} hex parts')


def main():
    restore_from_hex('photo-metadata-tags.js', ROOT / 'src/core/photo-metadata-tags.js')
    restore_from_hex('app-place-search.js', ROOT / 'src/core/app-place-search.js')

    functions = ROOT / 'functions/index.js'
    must_replace(
        functions,
        "  const query = String(req.query.query || '').trim().slice(0, 200);\n"
        "  if (!query) { res.status(400).json({ ok: false, message: 'query is required' }); return; }\n"
        "  setPublicCacheHeaders(res, 300);\n"
        "  // 30/minute per IP -- generous for a real person typing/refining a place search, but stops a\n",
        "  const query = String(req.query.query || '').trim().slice(0, 200);\n"
        "  const xRaw = String(req.query.x || '').trim();\n"
        "  const yRaw = String(req.query.y || '').trim();\n"
        "  const xN = Number(xRaw);\n"
        "  const yN = Number(yRaw);\n"
        "  const isCoord = !query && Number.isFinite(xN) && Number.isFinite(yN) && Math.abs(xN) <= 180 && Math.abs(yN) <= 90;\n"
        "  if (!query && !isCoord) { res.status(400).json({ ok: false, message: 'query is required' }); return; }\n"
        "  setPublicCacheHeaders(res, 300);\n"
        "  // 30/minute per IP -- generous for a real person typing/refining a place search, but stops a\n",
        'kakao query-or-coord gate',
    )
    must_replace(
        functions,
        "  const cacheKey = query.toLocaleLowerCase('ko-KR');\n"
        "  const cached = await readExternalCache('kakaoSearch', cacheKey);\n"
        "  if (cached) { res.status(200).json(cached); return; }\n"
        "  try {\n"
        "    const kakaoRes = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=10`, {\n"
        "      headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` }\n"
        "    });\n",
        "  const cacheKey = isCoord ? `coord:${xN.toFixed(4)},${yN.toFixed(4)}` : query.toLocaleLowerCase('ko-KR');\n"
        "  const cacheProvider = isCoord ? 'kakaoCoord' : 'kakaoSearch';\n"
        "  const cached = await readExternalCache(cacheProvider, cacheKey);\n"
        "  if (cached) { res.status(200).json(cached); return; }\n"
        "  try {\n"
        "    const kakaoUrl = isCoord\n"
        "      ? `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${encodeURIComponent(String(xN))}&y=${encodeURIComponent(String(yN))}`\n"
        "      : `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=10`;\n"
        "    const kakaoRes = await fetch(kakaoUrl, {\n"
        "      headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` }\n"
        "    });\n",
        'kakao coord2address fetch',
    )
    must_replace(
        functions,
        "      res.status(kakaoRes.status).json({ ok: false, message: 'Kakao local search failed' });\n",
        "      res.status(kakaoRes.status).json({ ok: false, message: isCoord ? 'Kakao coord2address failed' : 'Kakao local search failed' });\n",
        'kakao error message',
    )
    must_replace(
        functions,
        "    const result = { ok: true, documents: json.documents || [] };\n"
        "    await writeExternalCache('kakaoSearch', cacheKey, result, 24 * 60 * 60 * 1000);\n",
        "    const result = { ok: true, mode: isCoord ? 'coord' : 'keyword', documents: json.documents || [] };\n"
        "    await writeExternalCache(cacheProvider, cacheKey, result, 24 * 60 * 60 * 1000);\n",
        'kakao cache write',
    )
    must_replace(
        functions,
        "    res.status(502).json({ ok: false, message: 'Kakao local search request failed' });\n",
        "    res.status(502).json({ ok: false, message: isCoord ? 'Kakao coord2address request failed' : 'Kakao local search request failed' });\n",
        'kakao 502 message',
    )

    main_js = ROOT / 'src/core/app-main.js'
    must_replace(
        main_js,
        "import {\n"
        "  buildMetadataTags as buildPhotoMetadataTags,\n"
        "  parseNominatimLocation,\n"
        "  todayUploadTagOptions,\n"
        "  withUploadDateTag\n"
        "} from './photo-metadata-tags.js';\n",
        "import {\n"
        "  buildMetadataTags as buildPhotoMetadataTags,\n"
        "  parseNominatimLocation,\n"
        "  todayUploadTagOptions,\n"
        "  withUploadDateTag\n"
        "} from './photo-metadata-tags.js';\n"
        "import { reverseGeocodeCoords } from './app-place-search.js';\n",
        'app-main reverseGeocode import',
    )
    must_replace(
        main_js,
        "        const waitMs = Math.max(0, 1100 - (Date.now() - photoLocationRequestAt));\n"
        "        if (waitMs) await new Promise(resolve => setTimeout(resolve, waitMs));\n"
        "        photoLocationRequestAt = Date.now();\n"
        "        const response = await fetch(\n"
        "          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1&accept-language=ko&zoom=18`,\n"
        "          { headers: { Accept: 'application/json', 'User-Agent': 'GatherCalendar/1.0 (https://github.com/pyw31337/calendar)' } }\n"
        "        );\n"
        "        if (response.ok) {\n"
        "          const parsed = parseNominatimLocation(await response.json());\n"
        "          if (parsed.location || (parsed.locationTags && parsed.locationTags.length)) {\n"
        "            photoLocationCache.set(key, parsed);\n"
        "            if (parsed.location) result.location = parsed.location;\n"
        "            if (parsed.locationTags.length) result.locationTags = parsed.locationTags;\n"
        "          }\n"
        "        }\n",
        "        let parsed = null;\n"
        "        if (typeof reverseGeocodeCoords === 'function') {\n"
        "          parsed = await reverseGeocodeCoords(lat, lon, {\n"
        "            firebaseConfig: typeof firebaseConfig !== 'undefined' ? firebaseConfig : {}\n"
        "          });\n"
        "        } else {\n"
        "          const waitMs = Math.max(0, 1100 - (Date.now() - photoLocationRequestAt));\n"
        "          if (waitMs) await new Promise(resolve => setTimeout(resolve, waitMs));\n"
        "          photoLocationRequestAt = Date.now();\n"
        "          const response = await fetch(\n"
        "            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1&accept-language=ko&zoom=18`,\n"
        "            { headers: { Accept: 'application/json', 'User-Agent': 'GatherCalendar/1.0 (https://github.com/pyw31337/calendar)' } }\n"
        "          );\n"
        "          if (response.ok) parsed = parseNominatimLocation(await response.json());\n"
        "        }\n"
        "        if (parsed && (parsed.location || (parsed.locationTags && parsed.locationTags.length))) {\n"
        "          photoLocationCache.set(key, parsed);\n"
        "          if (parsed.location) result.location = parsed.location;\n"
        "          if (parsed.locationTags.length) result.locationTags = parsed.locationTags;\n"
        "        }\n",
        'extractPhotoMetadata kakao-first reverse geocode',
    )

    tests = ROOT / 'scripts/firebase-safety-tests.mjs'
    test_text = tests.read_text(encoding='utf-8')
    if 'parseKakaoAddress' in test_text and 'Kakao building_name must become a POI tag' in test_text:
        print('[apply-kakao-geocode] tests already include Kakao cases')
    else:
        needle = (
            "  assert(withUploadDateTag('#hello', new Date('2026-09-10T12:00:00+09:00')) === '#260910 #hello', "
            "'upload-date tag prepends existing file tags');\n}\n"
        )
        addition = (
            "  assert(withUploadDateTag('#hello', new Date('2026-09-10T12:00:00+09:00')) === '#260910 #hello', "
            "'upload-date tag prepends existing file tags');\n}\n\n"
            "{\n"
            "  const {\n"
            "    parseKakaoAddress,\n"
            "    mergeLocationResults,\n"
            "    normalizeKoreaSido,\n"
            "    normalizeKoreaSigungu,\n"
            "    formatDeviceHashtag\n"
            "  } = await import('../src/core/photo-metadata-tags.js');\n"
            "  assert(normalizeKoreaSido('\uacbd\uae30') === '\uacbd\uae30\ub3c4', 'Kakao short sido \uacbd\uae30 must expand to \uacbd\uae30\ub3c4');\n"
            "  assert(normalizeKoreaSigungu('\ubd80\ucc9c\uc2dc \uc6d0\ubbf8\uad6c') === '\ubd80\ucc9c\uc2dc', 'Kakao \uc2dc+\uad6c must keep the city');\n"
            "  assert(formatDeviceHashtag('samsung SM-X910') === '\uac24\ub7ed\uc2dc\ud0edS9\uc6b8\ud2b8\ub77c', 'tablet EXIF codes must map too');\n"
            "  const kakaoApt = parseKakaoAddress({\n"
            "    road_address: {\n"
            "      region_1depth_name: '\uacbd\uae30',\n"
            "      region_2depth_name: '\ubd80\ucc9c\uc2dc \uc6d0\ubbf8\uad6c',\n"
            "      building_name: '\ubaa8\uc544\uc5d8\uac00 \ub354 \uc2a4\uce74\uc774'\n"
            "    },\n"
            "    address: {\n"
            "      region_1depth_name: '\uacbd\uae30',\n"
            "      region_2depth_name: '\ubd80\ucc9c\uc2dc \uc6d0\ubbf8\uad6c',\n"
            "      region_3depth_name: '\ucd98\uc758\ub3d9'\n"
            "    }\n"
            "  });\n"
            "  assert(kakaoApt.locationTags.includes('#\ubaa8\uc544\uc5d8\uac00'), 'Kakao building_name must become a POI tag');\n"
            "  assert(kakaoApt.locationTags.includes('#\uacbd\uae30\ub3c4\ubd80\ucc9c\uc2dc'), 'Kakao \uacbd\uae30+\ubd80\ucc9c\uc2dc must compact to #\uacbd\uae30\ub3c4\ubd80\ucc9c\uc2dc');\n"
            "  const kakaoSchool = parseKakaoAddress({\n"
            "    place_name: '\uc624\ub958\ub0a8\ucd08\ub4f1\ud559\uad50',\n"
            "    address_name: '\uacbd\uae30 \ubd80\ucc9c\uc2dc \uc6d0\ubbf8\uad6c \uc624\ub958\ub3d9 123-4',\n"
            "    category_name: '\uad50\uc721,\ud559\ubb38 > \ud559\uad50 > \ucd08\ub4f1\ud559\uad50'\n"
            "  });\n"
            "  assert(kakaoSchool.locationTags.includes('#\uc624\ub958\ub0a8\ucd08\ub4f1\ud559\uad50'), 'Kakao keyword school must become a POI tag');\n"
            "  const merged = mergeLocationResults(\n"
            "    kakaoApt,\n"
            "    { poi: '', station: '\ucc9c\uc655\uc5ed', sido: '\uacbd\uae30\ub3c4', sigungu: '\ubd80\ucc9c\uc2dc', locationTags: ['#\ucc9c\uc655\uc5ed'] }\n"
            "  );\n"
            "  assert(merged.locationTags.some(tag => tag.includes('\ucc9c\uc655\uc5ed') && tag.includes('\ubaa8\uc544\uc5d8\uac00')), "
            "'Kakao building + Nominatim station must combine');\n"
            "}\n"
        )
        if needle not in test_text:
            fail('test append needle not found')
        tests.write_text(test_text.replace(needle, addition, 1), encoding='utf-8')
        print('[apply-kakao-geocode] appended Kakao tag tests')

    print('[apply-kakao-geocode] OK')


if __name__ == '__main__':
    main()
