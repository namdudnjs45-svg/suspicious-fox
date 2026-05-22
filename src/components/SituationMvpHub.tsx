import { useState } from "react";

import {
  MVP_HUB_EYEBROW,
  MVP_HUB_FOX_IMAGE_PATH,
  MVP_HUB_SUBTITLE,
  MVP_HUB_TITLE,
  MVP_SITUATION_HUB_ROWS,
  resolveHeroFoxSrcOrDefault,
  withPreferredLineBreaks,
} from "../data/mvpSituations";
import { FoxReportModal } from "./FoxReportModal";

/** MVP 허브 — 히어로 + 상황 선택 카드 목록 */

type SituationMvpHubProps = {
  onPickEpisodeId: (episodeId: string) => void;
};

function FoxHeroIllustration() {
  return (
    <svg
      className="hero-fox-placeholderSvg"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id="mvpFoxGlow-v2" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="rgba(254, 215, 170, 0.55)" />
          <stop offset="55%" stopColor="rgba(255, 237, 213, 0.25)" />
          <stop offset="100%" stopColor="rgba(255, 251, 246, 0)" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="86" fill="url(#mvpFoxGlow-v2)" />
      <circle cx="100" cy="100" r="78" fill="#FFFBF5" stroke="rgba(251, 191, 120, 0.55)" strokeWidth="3" />

      <ellipse cx="100" cy="128" rx="52" ry="44" fill="#FFEDD5" stroke="#FDBA74" strokeWidth="2.2" />
      <ellipse cx="100" cy="88" rx="44" ry="38" fill="#FFEDD5" stroke="#FB923C" strokeWidth="2" />

      <path
        d="M52 62 L74 82 L82 62 Z"
        fill="#FED7AA"
        stroke="#EA580C"
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
      <path
        d="M148 62 L126 82 L118 62 Z"
        fill="#FED7AA"
        stroke="#EA580C"
        strokeWidth="1.85"
        strokeLinejoin="round"
      />

      <ellipse cx="87" cy="86" rx="5.5" ry="6.5" fill="#292524" />
      <ellipse cx="113" cy="86" rx="5.5" ry="6.5" fill="#292524" />
      <ellipse cx="88.8" cy="83.8" rx="1.9" ry="2.4" fill="#fafafa" />
      <ellipse cx="114.8" cy="83.8" rx="1.9" ry="2.4" fill="#fafafa" />

      <path d="M88 106 Q100 116 112 106" stroke="#EA580C" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      <ellipse cx="72" cy="100" rx="10" ry="6.5" fill="#FECACA" opacity="0.55" />
      <ellipse cx="128" cy="100" rx="10" ry="6.5" fill="#FECACA" opacity="0.55" />

      <path
        d="M48 154 Q100 174 152 154"
        stroke="rgba(251, 146, 60, 0.35)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HubHeroFox() {
  const [imgBroken, setImgBroken] = useState(false);
  const heroSrc = resolveHeroFoxSrcOrDefault(MVP_HUB_FOX_IMAGE_PATH);

  return (
    <div className="mvp-hubHeroRing">
      <div className="hero-fox-frame">
        <img
          src={heroSrc}
          alt="일기 쓰는 여우"
          className={`hero-fox-image${imgBroken ? " hero-fox-image--broken" : ""}`}
          decoding="async"
          onError={() => setImgBroken(true)}
        />
        {imgBroken ? (
          <div className="hero-fox-svgFallback" aria-hidden>
            <FoxHeroIllustration />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** 부제 · 첫 쉼표에서 한 줄 나눔(두 줄일 때 마침 느낌 정리) */
function SubtitleWithCommaBreak({ text }: { text: string }) {
  const idx = text.indexOf(",");
  if (idx <= 0) {
    return <p className="mvp-hubSubtitle mvp-hubLineBlurb--free">{withPreferredLineBreaks(text)}</p>;
  }
  const left = text.slice(0, idx).trim();
  const right = text.slice(idx + 1).trim();
  return (
    <p className="mvp-hubSubtitle mvp-hubSubtitle--two">
      <span className="mvp-hubSubtitleLine">{withPreferredLineBreaks(left)},</span>
      <span className="mvp-hubSubtitleLine">{withPreferredLineBreaks(right)}</span>
    </p>
  );
}

export function SituationMvpHub({ onPickEpisodeId }: SituationMvpHubProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const handleNavigateOtherReports = () => {
    setReportModalOpen(false);
    window.requestAnimationFrame(() => {
      document.getElementById("mvp-hubSituationCards")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <main className="mvp-hubRoot" aria-label="여우 상황 고르기">
      <header className="mvp-hubHeader">
        <HubHeroFox />
        <p className="mvp-hubEyebrow">{MVP_HUB_EYEBROW}</p>
        <h1 className="mvp-hubTitle mvp-hubLineTitle">{withPreferredLineBreaks(MVP_HUB_TITLE)}</h1>
        <SubtitleWithCommaBreak text={MVP_HUB_SUBTITLE} />
      </header>

      <ul id="mvp-hubSituationCards" className="mvp-hubCardList" role="list">
        {MVP_SITUATION_HUB_ROWS.map((row) =>
          row.rowType === "playable" ? (
            <li key={row.episodeId}>
              <button type="button" className="mvp-hubPickCard" onClick={() => onPickEpisodeId(row.episodeId)}>
                <span className="mvp-hubGlyph" aria-hidden>
                  {row.emoji}
                </span>
                <span className="mvp-hubPickMain">
                  <span className="mvp-hubPickTitle mvp-hubLineTitle">{withPreferredLineBreaks(row.title)}</span>
                  <span className="mvp-hubPickBlurb mvp-hubLineBlurb">{withPreferredLineBreaks(row.blurb)}</span>
                  <span className="mvp-hubPickFoot">
                    <span className="mvp-hubPill">살펴보기</span>
                    <span className="mvp-hubPickChevron" aria-hidden>
                      ›
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ) : (
            <li key="report-invite">
              <button
                type="button"
                className="mvp-hubPickCard mvp-hubPickCard--report"
                onClick={() => setReportModalOpen(true)}
              >
                <span className="mvp-hubGlyph mvp-hubGlyph--report" aria-hidden>
                  {row.emoji}
                </span>
                <span className="mvp-hubPickMain">
                  <span className="mvp-hubPickTitleRow mvp-hubPickTitleRow--report">
                    <span className="mvp-hubPickTitle mvp-hubLineTitle">{withPreferredLineBreaks(row.title)}</span>
                    <span className="mvp-hubRecruitBadge">{row.recruitingBadge}</span>
                  </span>
                  <span className="mvp-hubPickBlurb mvp-hubLineBlurb">{withPreferredLineBreaks(row.blurb)}</span>
                  <span className="mvp-hubPickFoot">
                    <span className="mvp-hubPill mvp-hubPill--report">{row.ctaLabel}</span>
                    <span className="mvp-hubPickChevron" aria-hidden>
                      ›
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ),
        )}
      </ul>

      <FoxReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onNavigateOtherCases={handleNavigateOtherReports}
      />
    </main>
  );
}
