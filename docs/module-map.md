# 프론트 모듈 지도

점검일: 2026-08-20

## 로드 순서
1. 상수·유틸·firebase-services
2. ui-*.js (GATHER_UI_COMPONENTS)
3. app-main.js (App)

## 규칙
- 새 UI는 assets/ui-*.js + index.html defer
- assets/ 와 public/assets/ 미러 필수
- App 본체는 P6 Vite에서 import 경계로 분리 권장
