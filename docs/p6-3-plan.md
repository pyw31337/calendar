# P6-3 계획: Vite 빌드 산출물 배포

작성일: 2026-08-20
상태: 문서만 (배포 미변경)

## 지금 라이브가 돌아가는 방식
- GitHub Pages가 저장소의 index.html + assets/*.js 를 그대로 배포
- 워크플로: pages-build-deployment, Verify Calendar, Daily Live Smoke
- 사용자는 CDN React + defer 스크립트로 앱을 실행

## P6-3 목표
Vite 빌드 결과물(dist)을 Pages에 배포하는 경로를 만들기.
아직 라이브 경로를 바꾸지 않는다.

## 안전한 순서
1. 이 문서 작성 (현재 단계)
2. Vite 빌드가 src 스텁으로라도 로컬에서 성공하는지 확인 (라이브 미연결)
3. Actions에 "build only, deploy 안 함" 잡 추가
4. 안전 태그 후, Pages를 dist로 전환하는 건 맨 마지막
5. 구형 assets 경로 제거는 P6-4

## 절대 하지 말 것
- index.html 의 assets 스크립트 태그를 지금은 지우지 말 것
- assets/app-main.js 에서 함수를 지우지 말 것
- Pages 배포 소스를 지금 dist로 바꾸지 말 것

## 로컬 Vite 빌드 프로브 (2026-08-20)
결과: 성공(경고 다수)
- vite build 가 index.html 을 엔트리로 사용
- assets/*.js 는 type="module" 이 아니라 번들되지 않음
- 변환된 모듈 3개, dist/index.html 약 12KB
- src/main.jsx 는 아직 실제 엔트리가 아님
- dist 를 Pages 배포 소스로 쓰면 라이브 앱 JS가 빠짐 → 전환 금지

## 로컬 Vite 빌드 프로브 (2026-08-20)
결과: 성공(경고 다수)
- vite build 가 index.html 을 엔트리로 사용
- assets/*.js 는 type="module" 이 아니라 번들되지 않음
- 변환된 모듈 3개, dist/index.html 약 12KB
- src/main.jsx 는 아직 실제 엔트리가 아님
- dist 를 Pages 배포 소스로 쓰면 라이브 앱 JS가 빠짐 → 전환 금지

## Vite 전용 엔트리 (2026-08-20)
- 라이브 index.html 은 그대로 둠
- Vite 빌드 입력: src/index.html → src/main.jsx
- dist 는 아직 Pages 배포에 사용하지 않음
