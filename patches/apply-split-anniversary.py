from pathlib import Path
import sys

root = Path('.')
main_path = root / 'src' / 'core' / 'app-main.js'
text = main_path.read_text()

import_snip = """import {
  computeKoreanHolidaysForYear,
  getHolidayNamesForDate,
  getKoreanSolarTermsForYear
} from './app-calendar-holidays.js';
"""
import_new = """import {
  computeKoreanHolidaysForYear,
  getHolidayNamesForDate,
  getKoreanSolarTermsForYear
} from './app-calendar-holidays.js';
import {
  getAnniversariesForDate,
  calculateDday,
  getSolarFromLunar
} from './app-anniversary-dates.js';
"""
if import_snip not in text:
    raise SystemExit('holiday import block missing in app-main.js')
if "from './app-anniversary-dates.js'" in text:
    print('import already present; skip')
    sys.exit(0)
text = text.replace(import_snip, import_new, 1)

start = text.find('function isRepeatAnniversaryOnDate(ann, dateStr) {')
end = text.find('function AnniversaryModal(props) {')
if start < 0 or end < 0:
    raise SystemExit(f'extraction markers missing start={start} end={end}')
block = text[start:end]
keep_marker = '// Anniversary badges default to a generic type color'
keep_idx = block.find(keep_marker)
if keep_idx < 0:
    raise SystemExit('getAnniversaryDisplayColor comment marker missing')
rest = block[keep_idx:]
disp_end = rest.find('// Signed day-count from today')
if disp_end < 0:
    raise SystemExit('calculateDday comment marker missing')
kept = rest[:disp_end].rstrip() + '\n\n'
main_path.write_text(text[:start] + kept + text[end:])
print('app-main.js extraction applied', main_path)
