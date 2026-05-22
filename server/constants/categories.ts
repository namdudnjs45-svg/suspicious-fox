/** 프런트 `FOX_REPORT_CATEGORY_OPTIONS` 과 동일한 값만 받습니다 */

export const REPORT_CATEGORY_ALLOWLIST = [
  "보이스피싱",
  "중고거래",
  "티켓거래",
  "가족·지인 사칭",
  "문자 링크",
  "기타",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORY_ALLOWLIST)[number];

export function isAllowedCategory(cat: unknown): cat is ReportCategory {
  return typeof cat === "string" && REPORT_CATEGORY_ALLOWLIST.includes(cat as ReportCategory);
}
