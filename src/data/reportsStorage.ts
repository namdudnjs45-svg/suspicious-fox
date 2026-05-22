/** 서버 전송 실패 시 마스킹된 제보만 임시 저장(localStorage)합니다. */

export const FOX_REPORTS_STORAGE_KEY = "suspiciousFox:reports";

export type FoxStoredReport = {
  id: string;
  category: string;
  maskedText: string;
  createdAt: string;
};

function safeParseReports(raw: string | null): FoxStoredReport[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter(
      (x): x is FoxStoredReport =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as FoxStoredReport).id === "string" &&
        typeof (x as FoxStoredReport).category === "string" &&
        typeof (x as FoxStoredReport).maskedText === "string" &&
        typeof (x as FoxStoredReport).createdAt === "string",
    );
  } catch {
    return [];
  }
}

export function readFoxReports(): FoxStoredReport[] {
  return safeParseReports(window.localStorage.getItem(FOX_REPORTS_STORAGE_KEY));
}

/**
 * 서버에 제보 보내기에 실패했을 때만 호출합니다. 마스킹된 텍스트만 저장합니다.
 */
export function backupFoxReportAfterServerFailure(entry: { category: string; maskedText: string }): FoxStoredReport {
  const record: FoxStoredReport = {
    id: crypto.randomUUID(),
    category: entry.category,
    maskedText: entry.maskedText,
    createdAt: new Date().toISOString(),
  };

  try {
    const prev = readFoxReports();
    window.localStorage.setItem(FOX_REPORTS_STORAGE_KEY, JSON.stringify([...prev, record]));
  } catch {
    try {
      window.localStorage.setItem(FOX_REPORTS_STORAGE_KEY, JSON.stringify([record]));
    } catch {
      /* 저장 불가 환경 */
    }
  }

  return record;
}
