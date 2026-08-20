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
