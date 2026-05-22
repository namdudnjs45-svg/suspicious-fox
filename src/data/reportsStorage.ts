/** 서버 전송 실패 시 마스킹된 제보만 임시 저장(localStorage)합니다. */

export const FOX_REPORTS_STORAGE_KEY = "suspiciousFox:reports";

/** 제보 요청과 동일하게 메타만 다룹니다(파일 바이너리는 저장하지 않습니다). */
export type FoxReportAttachmentSummary = {
  fileName: string;
  mimeType: string;
  byteSize: number;
};

export type FoxStoredReport = {
  id: string;
  category: string;
  maskedText: string;
  /** 첨부가 있었다면 파일명·타입·크기 요약만 보관합니다. */
  attachments?: FoxReportAttachmentSummary[];
  createdAt: string;
};

function isAttachmentSummary(o: unknown): o is FoxReportAttachmentSummary {
  if (typeof o !== "object" || o === null) return false;
  const x = o as Partial<FoxReportAttachmentSummary>;
  return (
    typeof x.fileName === "string" &&
    typeof x.mimeType === "string" &&
    typeof x.byteSize === "number" &&
    Number.isFinite(x.byteSize)
  );
}

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
        typeof (x as FoxStoredReport).createdAt === "string" &&
        (!(x as FoxStoredReport).attachments ||
          (Array.isArray((x as FoxStoredReport).attachments) &&
            (x as FoxStoredReport).attachments!.length <= 3 &&
            (x as FoxStoredReport).attachments!.every(isAttachmentSummary))),
    );
  } catch {
    return [];
  }
}

export function readFoxReports(): FoxStoredReport[] {
  return safeParseReports(window.localStorage.getItem(FOX_REPORTS_STORAGE_KEY));
}

/**
 * 서버에 제보 보내기에 실패했을 때만 호출합니다. 마스킹 텍스트와 선택한 첨부의 메타 요약만 저장합니다(파일 본문은 저장하지 않습니다).
 */
export function backupFoxReportAfterServerFailure(entry: {
  category: string;
  maskedText: string;
  attachments?: FoxReportAttachmentSummary[];
}): FoxStoredReport {
  const record: FoxStoredReport = {
    id: crypto.randomUUID(),
    category: entry.category,
    maskedText: entry.maskedText,
    createdAt: new Date().toISOString(),
    ...(entry.attachments && entry.attachments.length > 0 ? { attachments: entry.attachments } : {}),
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
