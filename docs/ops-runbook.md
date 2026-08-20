# 운영 런북 (P7)

## 1. 배포
1. 로컬 검증: npm run check:all && npm run safety:test
2. main push → GitHub Pages + Verify Calendar
3. 배포 후: npm run smoke:live

## 2. 안전 태그
git tag safe-20260820-p5
git push origin safe-20260820-p5

## 3. Google Cloud 예산 알림
1. console.cloud.google.com → 결제 → 예산 및 알림
2. 예산 만들기 (프로젝트 지정, 월 $5~$10 권장)
3. 임계값 50% / 90% / 100% + 이메일

## 4. CI
- Verify Calendar: safety + check:all + tab-wiring + size-budget + build
- Live smoke: main push 후 + 매일 01:00 UTC
