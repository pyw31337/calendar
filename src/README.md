# src/ (P6 Vite 준비용)

현재 상태 (2026-08-20):
- 이 폴더는 P6 Vite 마이그레이션을 위한 **복사본**입니다.
- 실제 라이브 서비스는 여전히 루트의 `index.html` + `assets/` 를 사용합니다.
- 여기에 있는 파일을 수정해도 라이브에는 영향이 없습니다.

구조:
- src/core/   → 기존 assets의 핵심 로직 복사본
- src/ui/     → 기존 assets/ui-*.js 복사본
- src/main.jsx → Vite 진입점 스텁 (아직 사용 안 함)
- src/app.css → 스타일 복사본

다음 목표 (P6-2):
1. App 본체를 뷰 단위로 분리 준비
2. dynamic import 구조 설계
3. 실제 Vite 빌드가 동작하도록 전환 (P6-3에서 진행)
