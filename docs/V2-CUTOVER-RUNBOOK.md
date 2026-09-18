# V2 기본 화면 전환 런북

이 문서는 `?shell=v2`로 검증하던 V2를 기본 화면으로 바꾸는 절차와 즉시 롤백 방법을 고정한다. 전환은 **표시 셸만** 바꾸며 Firebase 데이터·Storage·공유 URL을 수정하거나 이전하지 않는다.

## 현재 준비 상태

- 기본값은 여전히 V1이다.
- `?shell=v2`는 V2를 강제한다.
- `?shell=v1`은 V2 기본 배포 이후에도 V1을 강제하는 즉시 롤백 URL이다.
- GitHub Pages 배포는 저장소 변수 `VITE_DEFAULT_SHELL`가 정확히 `v2`일 때만 V2를 기본값으로 빌드한다. 변수가 비어 있으면 V1 기본값을 유지한다.
- 배포 전 Chromium 스모크는 V1/V2 메모의 계산 스타일(카드 여백, 태그 색, PC·모바일 그리드 여백, `word-break`, 이미지 1:1)을 검사한다.
- V2 기본값 빌드에서도 기존 작성기·이모티콘·사이드 메뉴 동작은 `?shell=v1` 롤백 URL로 별도 검사하며, V2의 화면 전환 계약과 섞지 않는다.

## 전환 전 준비

1. V2를 명시한 URL에서 PC·모바일의 캘린더, 채팅, 메모, 장소, 정산, 갤러리, 보관함, 콘텐츠를 확인한다.
2. 읽기 전용 백업을 만든다. `npm run ops:export` 결과를 안전한 위치에 보관하고, `npm run ops:audit`로 대상 캘린더 수량을 기록한다.
3. 다음 게이트를 모두 통과한다.

   ```bash
   npm run check:all
   npm run safety:test
   npm run check:v2-cutover
   ```

4. GitHub Actions의 **Deploy Vite Pages**가 최신 `main` 기준으로 성공할 수 있는지 확인한다. 새 기능 배포와 기본 셸 전환을 같은 변경에 섞지 않는다.

## 기본 V2 전환

1. GitHub 저장소 설정 → **Secrets and variables → Actions → Variables**에서 `VITE_DEFAULT_SHELL` 값을 `v2`로 설정한다.
2. 코드 변경 없이 **Deploy Vite Pages** 워크플로를 수동 실행한다. 배포 워크플로는 이 변수를 빌드 시점에 주입한다.
3. 배포 후 아래 주소를 각각 확인한다.

   ```text
   /calendar/?id=cw
   /calendar/?id=cw&shell=v2
   /calendar/?id=cw&shell=v1
   ```

   첫 두 주소는 V2, 마지막 주소는 기존 V1을 표시해야 한다. `kkot`, `jhair`에서도 메인·메모·채팅·갤러리 한 번씩 확인한다.
4. `npm run smoke:live`를 실행하고 Pages 배포 SHA가 최신인지 확인한다.

## 즉시 롤백

사용자에게는 우선 `?shell=v1` URL을 안내할 수 있다. 전체 기본값을 되돌릴 때는 다음만 수행한다.

1. 저장소 변수 `VITE_DEFAULT_SHELL`을 비우거나 삭제한다.
2. **Deploy Vite Pages** 워크플로를 다시 실행한다.
3. `/calendar/?id=cw`가 V1, `/calendar/?id=cw&shell=v2`가 V2인 것을 확인한다.

Firebase 데이터 복구, Storage 삭제, Git reset은 이 롤백에 필요하지 않다.

## 전환 완료 기준

- V1 강제 URL과 V2 기본 URL 모두 부팅·탭 전환·공유 링크를 정상 처리한다.
- 배포 전 스모크의 V1/V2 메모 계산 스타일 계약이 통과한다.
- PC 1440px와 모바일 390px에서 가로 스크롤·처리되지 않은 JavaScript 오류가 없다.
- 최소 한 번의 실제 Android Chrome 및 Samsung Internet 또는 Whale 확인을 마친다.
