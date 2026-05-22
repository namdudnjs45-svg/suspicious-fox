/**
 * MVP 메인 허브 카드 데이터.
 * 나중에 카테고리 탭 등으로 묶을 때를 대비해 `categoryKey` 를 둡니다.
 */

import { resolvePublicAssetUrl } from "./diaryEpisodes";

export { withPreferredLineBreaks } from "./diaryEpisodes";

/** 향후 섹션(보이스피싱·중고거래 등)으로 묶을 때 쓸 힌트 키 */
export type HubCategoryKey =
  | "voice_phishing_like"
  | "ticket_resale_like"
  | "secondhand_trade_like"
  | "crowd_report";

export type MvpSituationHubRow =
  | {
      rowType: "playable";
      categoryKey: HubCategoryKey;
      emoji: string;
      episodeId: string;
      title: string;
      blurb: string;
    }
  | {
      rowType: "reportInvite";
      categoryKey: HubCategoryKey;
      emoji: string;
      title: string;
      blurb: string;
      /** 카드 라벨(작은 pill) */
      recruitingBadge: string;
      ctaLabel: string;
    };

/** 상단 라벨 */
export const MVP_HUB_EYEBROW = "여우의 수상한 일기장";

/** 메인 제목 */
export const MVP_HUB_TITLE = "오늘, 어떤 여우를 구해볼까요?";

/** 부제 */
export const MVP_HUB_SUBTITLE = "수상한 순간을 찾아내면, 여우가 사기를 피할 수 있어요.";

/** Vite `public/fox-main.png` → `/fox-main.png` */
export const MVP_HUB_FOX_IMAGE_PATH = "/fox-main.png";

export function resolveHeroFoxSrcOrDefault(publicPath: string): string {
  return resolvePublicAssetUrl(publicPath);
}

/** 첫 화면 목록 순서 고정 */
export const MVP_SITUATION_HUB_ROWS: readonly MvpSituationHubRow[] = [
  {
    rowType: "playable",
    categoryKey: "voice_phishing_like",
    emoji: "📞",
    episodeId: "court-registry-call",
    title: "법원 전화를 받은 여우",
    blurb: "등기 보낸다는데, 진짜 법원일까요?",
  },
  {
    rowType: "playable",
    categoryKey: "ticket_resale_like",
    emoji: "🎟️",
    episodeId: "cheap-ticket-deal",
    title: "저렴한 티켓을 찾은 여우",
    blurb: "너무 좋은 가격, 정말 괜찮을까요?",
  },
  {
    rowType: "playable",
    categoryKey: "secondhand_trade_like",
    emoji: "📦",
    episodeId: "family-message-trap",
    title: "싸게 올린 물건에 혹한 여우",
    blurb: "싼 가격·직거래 피함·선입금 재촉… 어디서 멈출까요?",
  },
  {
    rowType: "reportInvite",
    categoryKey: "crowd_report",
    emoji: "✉️",
    title: "다양한 사례를 수집하고 있어요",
    blurb: "혹시 제보하고 싶은 사례가 있다면, 여우를 도와주세요.",
    recruitingBadge: "사례 모집 중",
    ctaLabel: "여우 도와주기",
  },
] as const;
