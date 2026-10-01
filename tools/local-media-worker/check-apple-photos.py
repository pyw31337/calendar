#!/usr/bin/env python3
"""iMac '사진' 앱 보관함 점검 (읽기 전용). docs/photo-auto-tagging-plan.md 구현안 A′의 사전 점검.

사진 앱 보관함을 osxphotos로 읽어, 우리 앱으로 인물·장소·날짜를 가져올 수 있는 상태인지 요약한다.
사진 파일·보관함은 바꾸지 않고, 결과는 화면에만 출력한다(아무 데도 보내지 않음).

    # 처음 한 번 (터미널)
    python3 -m pip install --user osxphotos
    # 시스템 설정 > 개인정보 보호 및 보안 > 전체 디스크 접근 권한 > 터미널 켜기
    python3 tools/local-media-worker/check-apple-photos.py
"""
import collections
import sys

try:
    import osxphotos
except ImportError:
    sys.exit("osxphotos가 없습니다. 먼저 실행하세요:  python3 -m pip install --user osxphotos")


def main():
    try:
        db = osxphotos.PhotosDB()
    except Exception as err:  # 권한이 없으면 여기서 실패한다
        sys.exit(f"사진 보관함을 열지 못했습니다: {err}\n"
                 "시스템 설정 > 개인정보 보호 및 보안 > 전체 디스크 접근 권한에서 터미널을 켜고 다시 실행하세요.")

    photos = [p for p in db.photos() if not p.intrash]
    total = len(photos)
    if not total:
        sys.exit("보관함에 사진이 없습니다. iCloud 사진 동기화가 끝났는지 확인하세요.")

    missing = sum(1 for p in photos if p.ismissing)
    cloud = sum(1 for p in photos if p.iscloudasset)
    with_gps = sum(1 for p in photos if p.location and p.location[0] is not None)
    videos = sum(1 for p in photos if p.ismovie)
    years = collections.Counter(p.date.year for p in photos if p.date)

    people = collections.Counter()
    unnamed_faces = 0
    for p in photos:
        for name in p.persons:
            # osxphotos reports a face nobody named as "_UNKNOWN_".
            if name and name != "_UNKNOWN_":
                people[name] += 1
            else:
                unnamed_faces += 1

    pct = lambda n: f"{n:,}장 ({n * 100 / total:.0f}%)"
    print(f"보관함: {db.library_path}")
    print(f"사진·동영상: {total:,}장 (동영상 {videos:,})")
    print(f"iCloud 사진: {pct(cloud)}")
    print(f"원본이 이 맥에 없음(아직 내려받지 않음): {pct(missing)}")
    print(f"위치(GPS) 있음: {pct(with_gps)}")
    print("연도별: " + ", ".join(f"{y} {n:,}" for y, n in sorted(years.items())))
    print(f"\n이름 붙은 인물 {len(people)}명 (이름 없는 얼굴 {unnamed_faces:,}개)")
    for name, count in people.most_common(30):
        print(f"  {name}: {count:,}장")

    print("\n판단")
    if missing:
        print(f"- 원본 {missing:,}장이 아직 iCloud에만 있어요. 사진 앱 > 설정 > iCloud > '이 Mac에 원본 다운로드'를 켜면")
        print("  비교(매칭) 정확도가 올라가요. 인물·위치 정보 자체는 지금도 읽혀요.")
    else:
        print("- 원본이 모두 이 맥에 있어요.")
    if not people:
        print("- 이름 붙은 인물이 없어요. 사진 앱 > 인물에서 자주 나오는 얼굴에 이름을 붙이면 그 이름을 가져올 수 있어요.")
    else:
        print("- 위 인물 이름을 우리 앱 인물 태그(예: 서준)와 짝지어 가져올 수 있어요.")
    print(f"- 위치가 있는 {with_gps:,}장은 장소 태그 후보로 쓸 수 있어요.")


if __name__ == "__main__":
    main()
