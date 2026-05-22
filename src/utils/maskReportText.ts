/**
 * 제보 저장용 텍스트 마스킹. 저장소에는 마스킹된 문자열만 넘기도록 합니다.
 */

export const REPORT_LINK_PLACEHOLDER = "[링크 마스킹]";

function hostnameFromMaybeUrl(candidate: string, baseForWww?: string): string | null {
  const trimmed = candidate.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(baseForWww ? `${baseForWww}${trimmed}` : trimmed);
    return u.hostname || null;
  } catch {
    return null;
  }
}

/**
 * 숫자·링크 줄은 순서가 겹치지 않도록 앞쪽 규칙부터 적용합니다.
 */
export function maskReportText(raw: string): string {
  let s = raw;

  s = s.replace(/(카카오톡\s*(?:아이디|ID)?\s*[:：]\s*)(\S+)/gi, "$1***");
  s = s.replace(/(카톡\s*[:：]\s*)(\S+)/gi, "$1***");

  s = s.replace(/(?:https?:\/\/|kakaotalk:\/\/|line:\/\/)[^\s<>"'`]+/gi, (full) => {
    const host = hostnameFromMaybeUrl(full);
    return host ?? REPORT_LINK_PLACEHOLDER;
  });

  s = s.replace(/\bwww\.[^\s<>"'`]+/gi, (full) => {
    const first = full.split(/[/?#]/)[0] ?? "";
    const host = hostnameFromMaybeUrl(first, "http://");
    return host ?? REPORT_LINK_PLACEHOLDER;
  });

  s = s.replace(/\b(?:open\.kakao\.com|talk\.apps\.kr|band\.app)[^\s<>"'`]*/gi, REPORT_LINK_PLACEHOLDER);

  s = s.replace(/\b[a-z][a-z\d+.-]*:\/[^\s<>"'`]+/gi, (full) => {
    const host = hostnameFromMaybeUrl(full);
    return host ?? REPORT_LINK_PLACEHOLDER;
  });

  s = s.replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, (email) => {
    const [local, domain = ""] = email.split("@");
    if (!local || !domain) return REPORT_LINK_PLACEHOLDER;
    const first = local[0]!;
    return `${first}***@${domain}`;
  });

  s = s.replace(/\b(\d{6})-(\d{7})\b/g, "$1-*******");

  s = s.replace(/\b(\d{4})-(\d{4})-(\d{4})-(\d{4})\b/g, "$1-****-****-$4");

  s = s.replace(/\b(01[016789])([- ])(\d{3,4})\2(\d{4})\b/g, "$1$2****$2$4");

  s = s.replace(/\b(01[016789])(\d{3,4})(\d{4})\b/g, "$1****$3");

  s = s.replace(/\b(0\d{1,2})-(\d{3,4})-(\d{4})\b/g, (full, a: string, _mid: string, last: string) => {
    if (/^01[016789]$/.test(a)) return full;
    return `${a}-****-${last}`;
  });

  /* 계좌·긴 번호 줄 (예: 110-123-456789) — 휴대폰 010등은 상단 규칙에서 제외 */
  s = s.replace(
    /\b(?!(?:01[016789])-)(\d{2,4})-(\d{2,6})-(\d{6,})\b/g,
    (_, a: string, b: string, c: string) => `${a}-${"*".repeat(b.length)}-${"*".repeat(c.length)}`,
  );

  return s;
}
