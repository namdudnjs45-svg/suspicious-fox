# Scenario comic PNGs (`public/scenarios`)

4컷 일기 에피소드 이미지는 **import 없이** `/scenarios/파일명` URL로 제공됩니다.  
`src/data/diaryEpisodes.ts` 의 `scenarioComicImg()`와 이름이 **정확히** 맞아야 배포 후 화면에 보입니다.

## 필요한 파일 (현재 코드 기준)

- **법원·등기 줄:** `court-v2-01.png` … `court-v2-04.png`
- **티켓:** `ticket-01.png` … `ticket-04.png`
- **중고거래(선입금):** `item-01.png` … `item-04.png`

이 폴더에 위 파일명으로 PNG를 넣으면 Vercel 등 프로덕션에서도 같은 경로로 로드됩니다.
