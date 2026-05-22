/**
 * 사례 해설 피드백 — 추후 서버 API로 교체 시 이 모듈의 저장 부분만 갈아끼우면 됩니다.
 */

export type EpisodeFeedbackType = "similar" | "helpful" | "unsure";

export type EpisodeFeedbackRecord = {
  episodeId: string;
  feedbackType: EpisodeFeedbackType;
  /** ISO8601 문자열 */
  createdAt: string;
};

export const EPISODE_FEEDBACK_STORAGE_KEY = "suspiciousFox:episodeFeedback";

function parseStoredRows(raw: string | null): EpisodeFeedbackRecord[] {
  if (raw == null || raw.trim() === "") return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: EpisodeFeedbackRecord[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === "object" &&
        "episodeId" in item &&
        "feedbackType" in item &&
        "createdAt" in item &&
        typeof (item as EpisodeFeedbackRecord).episodeId === "string" &&
        typeof (item as EpisodeFeedbackRecord).createdAt === "string"
      ) {
        const ft = (item as EpisodeFeedbackRecord).feedbackType;
        if (ft === "similar" || ft === "helpful" || ft === "unsure") {
          out.push(item as EpisodeFeedbackRecord);
        }
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** 프로젝트에 전역으로 붙일 수 있는 analytics 훅(있으면만 호출). */
function tryAnalyticsEpisodeFeedbackClicked(episodeId: string, feedbackType: EpisodeFeedbackType) {
  try {
    const g = globalThis as unknown as {
      trackEvent?: (eventName: string, metadata?: Record<string, unknown>) => void;
    };
    if (typeof g.trackEvent === "function") {
      g.trackEvent("episode_feedback_clicked", { episodeId, feedbackType });
    }
  } catch {
    /* 없거나 실패하면 무시 */
  }
}

export function loadEpisodeFeedbackRecords(): EpisodeFeedbackRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return parseStoredRows(localStorage.getItem(EPISODE_FEEDBACK_STORAGE_KEY));
  } catch {
    return [];
  }
}

/** 해당 사례에 대한 가장 마지막 피드백 하나. */
export function getLatestEpisodeFeedback(episodeId: string): EpisodeFeedbackRecord | null {
  const rows = loadEpisodeFeedbackRecords();
  let last: EpisodeFeedbackRecord | null = null;
  for (const row of rows) {
    if (row.episodeId === episodeId) {
      last = row;
    }
  }
  return last;
}

/**
 * 같은 episodeId 에 대해서는 새 기록만 남기고 이전 줄을 제거(마지막 선택만 보존).
 * 전체 목록에서는 다른 에피소드 기록은 유지합니다.
 */
export function saveEpisodeFeedback(input: {
  episodeId: string;
  feedbackType: EpisodeFeedbackType;
}): EpisodeFeedbackRecord {
  const record: EpisodeFeedbackRecord = {
    episodeId: input.episodeId,
    feedbackType: input.feedbackType,
    createdAt: new Date().toISOString(),
  };

  if (typeof localStorage !== "undefined") {
    try {
      const prev = parseStoredRows(localStorage.getItem(EPISODE_FEEDBACK_STORAGE_KEY));
      const without = prev.filter((r) => r.episodeId !== input.episodeId);
      without.push(record);
      localStorage.setItem(EPISODE_FEEDBACK_STORAGE_KEY, JSON.stringify(without));
    } catch {
      /* 저장 실패는 조용히 무시 */
    }
  }

  tryAnalyticsEpisodeFeedbackClicked(input.episodeId, input.feedbackType);
  return record;
}
