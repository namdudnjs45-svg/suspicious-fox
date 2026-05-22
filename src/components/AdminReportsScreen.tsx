import { useEffect, useState } from "react";

import { apiUrl } from "../utils/apiUrl";

const STORAGE_KEY_ADMIN = "suspiciousFox:adminReportsKey";

export type DashboardReportRow = {
  category: string;
  maskedText: string;
  createdAt: string;
  attachments?: { fileName: string; mimeType: string; byteSize: number }[];
};

const FETCH_ERR =
  "목록을 불러오지 못했어요. 잠시 후 다시 시도하거나, 서버에 관리자 키가 설정돼 있는지 확인해 주세요.";
const KEY_MISSING = "관리자 키를 입력한 뒤 확인·새로고침을 눌러 주세요.";

function readEnvAdminKey(): string {
  const v = import.meta.env.VITE_ADMIN_REPORTS_KEY;
  return typeof v === "string" ? v.trim() : "";
}

function parseAttachmentRows(raw: unknown): DashboardReportRow["attachments"] {
  if (!Array.isArray(raw)) return undefined;
  const mapped = raw
    .map((a) => {
      if (typeof a !== "object" || a === null) return null;
      const r = a as { fileName?: unknown; mimeType?: unknown; byteSize?: unknown };
      if (
        typeof r.fileName !== "string" ||
        typeof r.mimeType !== "string" ||
        typeof r.byteSize !== "number"
      ) {
        return null;
      }
      return { fileName: r.fileName, mimeType: r.mimeType, byteSize: r.byteSize };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);
  return mapped.length > 0 ? mapped : undefined;
}

function formatAttachmentsSummary(attachments: DashboardReportRow["attachments"]): string {
  if (!attachments?.length) return "—";
  if (attachments.length === 1) return attachments[0].fileName;
  return `${attachments[0].fileName} 외 ${attachments.length - 1}장`;
}

export function AdminReportsScreen() {
  const [draftKey, setDraftKey] = useState(() => {
    const fromSession = sessionStorage.getItem(STORAGE_KEY_ADMIN)?.trim() ?? "";
    return fromSession || readEnvAdminKey();
  });

  const [rows, setRows] = useState<DashboardReportRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goHome = () => {
    window.location.hash = "";
  };

  const fetchList = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/reports"), {
        headers: { "x-admin-reports-key": key },
      });
      if (!res.ok) {
        setRows(null);
        setError(FETCH_ERR);
        return;
      }
      const data = (await res.json()) as unknown;
      if (!Array.isArray(data)) {
        setRows([]);
        return;
      }
      const parsed: DashboardReportRow[] = data
        .map((x) => {
          if (typeof x !== "object" || x === null) return null;
          const o = x as Partial<DashboardReportRow> & {
            attachments?: unknown;
          };
          if (
            typeof o.category !== "string" ||
            typeof o.maskedText !== "string" ||
            typeof o.createdAt !== "string"
          ) {
            return null;
          }
          let attachments = parseAttachmentRows(o.attachments);
          return {
            category: o.category,
            maskedText: o.maskedText,
            createdAt: o.createdAt,
            ...(attachments ? { attachments } : {}),
          };
        })
        .filter((x): x is DashboardReportRow => x !== null);
      setRows(parsed);
    } catch {
      setRows(null);
      setError(FETCH_ERR);
    } finally {
      setLoading(false);
    }
  };

  const loadWithDraftKey = () => {
    const k = draftKey.trim();
    if (!k) {
      setError(KEY_MISSING);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY_ADMIN, k);
    void fetchList(k);
  };

  useEffect(() => {
    const initial = draftKey.trim();
    if (!initial) return undefined;
    void fetchList(initial);
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 최초 자동 로드만
  }, []);

  return (
    <main className="sf-screen sf-appFrame sf-mvpHubshell admin-reportsRoot">
      <header className="admin-reportsHeader">
        <div>
          <p className="admin-reportsEyebrow">관리자</p>
          <h1 className="admin-reportsTitle">사례 제보 대시보드</h1>
          <p className="admin-reportsNote">화면에는 마스킹된 내용만 표시됩니다.</p>
        </div>
        <button type="button" className="admin-reportsHomeBtn" onClick={goHome}>
          앱으로 돌아가기
        </button>
      </header>

      <section className="admin-reportsPanel" aria-labelledby="admin-reports-access">
        <h2 id="admin-reports-access" className="admin-reportsPanelTitle">
          접속
        </h2>
        <p className="admin-reportsPanelHelp">
          서버의 환경 변수 <code className="admin-reportsCode">ADMIN_REPORTS_KEY</code> 와 같은 값을 넣어 주세요.
        </p>
        <div className="admin-reportsKeyRow">
          <input
            type="password"
            autoComplete="off"
            className="admin-reportsKeyInput"
            value={draftKey}
            onChange={(e) => setDraftKey(e.target.value)}
            placeholder="관리자 키"
          />
          <button type="button" className="admin-reportsKeyBtn" onClick={loadWithDraftKey}>
            확인·새로고침
          </button>
        </div>
      </section>

      {error ? (
        <p className="admin-reportsAlert" role="alert">
          {error}
        </p>
      ) : null}

      <section className="admin-reportsTableSection" aria-labelledby="admin-reports-recent">
        <h2 id="admin-reports-recent" className="admin-reportsSectionTitle">
          최근 사례 제보
        </h2>
        {loading ? <p className="admin-reportsMuted">불러오는 중…</p> : null}
        {!loading && rows !== null && rows.length === 0 ? (
          <p className="admin-reportsMuted">아직 저장된 제보가 없어요.</p>
        ) : null}
        {!loading && rows !== null && rows.length > 0 ? (
          <div className="admin-reportsTableWrap">
            <table className="admin-reportsTable">
              <thead>
                <tr>
                  <th scope="col">createdAt</th>
                  <th scope="col">category</th>
                  <th scope="col">첨부(메타)</th>
                  <th scope="col">maskedText</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.createdAt}-${i}`}>
                    <td className="admin-reportsCell admin-reportsCell--time">
                      {new Date(r.createdAt).toLocaleString("ko-KR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="admin-reportsCell">{r.category}</td>
                    <td className="admin-reportsCell admin-reportsCell--meta" title={formatAttachmentsSummary(r.attachments)}>
                      {formatAttachmentsSummary(r.attachments)}
                    </td>
                    <td className="admin-reportsCell admin-reportsCell--text">
                      <span className="admin-reportsMasked">{r.maskedText}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}
