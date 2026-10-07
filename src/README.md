# src/ — 운영 Vite 애플리케이션

이 디렉터리는 현재 GitHub Pages에 배포되는 모아엘가 캘린더의 실제 소스입니다. `npm run build`는
`src/index.html`을 Vite 진입점으로 사용해 루트 `dist/`에 운영 번들을 만듭니다.

## 역할

- `src/core/` — 데이터 계약, Firebase 접근, 도메인 규칙, 상태 훅. React 화면에 의존하지 않는
  규칙은 이곳에 두어 Node 테스트와 서버 작업에서도 재사용합니다.
- `src/ui/` — React 화면과 화면별 어댑터. 무거운 목적지 화면은 `main.jsx`의 동적 import를 통해
  해당 라우트에서만 불러옵니다.
- `src/ui/v2/` — V2 셸, 모바일 안전영역, 공통 목적지 크롬 및 화면별 스타일입니다.
- `src/app.css` — 앱 전체 토큰·기본 레이아웃. 화면 전용 규칙은 가능한 한 `src/ui/v2/`로 분리합니다.
- `src/main.jsx` — 운영 부팅 진입점과 라우트별 UI 청크 로더입니다.

## 루트 레거시 파일

- `index.html`, `assets/`, `share/`는 공유 링크·서비스 워커·PWA 호환을 위해 배포 단계에서 함께
  복사되는 정적 호환 자산입니다. 새 제품 UI나 비즈니스 로직의 작성 위치가 아닙니다.
- `share/`의 `stress_*`, `test_*` 디렉터리는 로컬 회귀 자료입니다. 빌드는 manifest에 등록된
  운영 캘린더(`kkot`, `cw`, `jhair`) 경로만 `dist/share/`에 게시합니다.

## 검증

```bash
npm run check:all
npm run build
npm run check:dist-budget
```

`npm run check:secrets`는 무시된 로컬 파일까지 검사하므로 Firebase Admin 키나 서비스 계정 키를
발견하면 배포 전에 실패합니다.
