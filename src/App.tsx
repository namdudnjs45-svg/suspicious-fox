import { useCallback, useEffect, useState } from "react";

import "./App.css";

import { AdminReportsScreen } from "./components/AdminReportsScreen";
import { DiaryComicQuiz } from "./components/DiaryComicQuiz";
import { SituationMvpHub } from "./components/SituationMvpHub";
import { DIARY_EPISODES, findDiaryEpisodeById } from "./data/diaryEpisodes";

/** 허브에서 고른 id가 에피소드와 일치하는지 런타임 확인합니다. */
const PLAYABLE_IDS = new Set<string>(DIARY_EPISODES.map((e) => e.id));

function isAdminHash(): boolean {
  const raw = window.location.hash.replace(/^#\/?/, "").split("/")[0] ?? "";
  return raw.toLowerCase() === "admin";
}

/** MVP 플로우: 상황 카드 허브 → 선택한 에피소드 상세(4컷·퀴즈·해설). */
export default function App() {
  const [detailEpisodeId, setDetailEpisodeId] = useState<string | null>(null);
  const [adminUi, setAdminUi] = useState(isAdminHash);

  useEffect(() => {
    const onHash = () => setAdminUi(isAdminHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const openEpisode = useCallback((id: string) => {
    if (!PLAYABLE_IDS.has(id)) return;
    setDetailEpisodeId(id);
  }, []);

  const closeDetail = useCallback(() => setDetailEpisodeId(null), []);

  if (adminUi) {
    return (
      <div className="sf-app sf-app--mvp">
        <AdminReportsScreen />
      </div>
    );
  }

  let body: JSX.Element;

  if (detailEpisodeId === null) {
    body = (
      <main className="sf-screen sf-appFrame sf-mvpHubshell">
        <SituationMvpHub onPickEpisodeId={openEpisode} />
      </main>
    );
  } else {
    const episode = findDiaryEpisodeById(detailEpisodeId);
    body =
      episode === undefined ? (
        <main className="sf-screen sf-appFrame sf-mvpHubshell">
          <div className="mvp-hubRoot">
            <p className="mvp-hubFallbackText">선택한 이야기를 불러오지 못했어요.</p>
            <button type="button" className="mvp-hubGhostBtn" onClick={closeDetail}>
              목록으로
            </button>
          </div>
        </main>
      ) : (
        <main className="sf-screen sf-appFrame sf-mvpQuizShell">
          <DiaryComicQuiz episode={episode} onBack={closeDetail} />
        </main>
      );
  }

  return <div className="sf-app sf-app--mvp">{body}</div>;
}
