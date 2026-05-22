import { useEffect, useId, useState } from "react";
import {
  type DiaryChatTurn,
  type DiaryComicSceneType,
  type DiaryEpisode,
  resolveDiaryComicPanelSrc,
  resolvePublicAssetUrl,
  withPreferredLineBreaks,
} from "../data/diaryEpisodes";
import { EpisodeFeedbackMiniCard } from "./EpisodeFeedbackMiniCard";

const DEFAULT_EMPATHY_LINE = "내가 고른 순간도 이상하게 느껴질 수 있어요.";

const DEFAULT_QUIZ_STRIP_HINT =
  "만화 흐름을 읽으며, 마음이 먼저 걸리는 컷을 골라도 괜찮아요.";

const SECTION_SUSPICIOUS = "이 대화가 수상한 이유";
const SECTION_CHAT = "실제로 오갈 법한 짧은 대화 예시";
const SECTION_STOP = "여기서 멈춰야 할 신호";
const SECTION_PEER = "가까운 사람에게 이렇게 말해보기";
const SECTION_STRONG = "특히 강한 경고 신호";
const FLOW_AGAIN_SUMMARY = "흐름 다시 보기";

const FLOW_FALLBACK_CALL = "통화처럼 시작";
const FLOW_FALLBACK_SMS = "문자·채팅";
const FLOW_FALLBACK_PSYCH = "마음이 끌릴 때";

function paragraphsFromText(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitChatTurns(
  turns: readonly DiaryChatTurn[],
  visibleMax?: number,
): { head: readonly DiaryChatTurn[]; tail: readonly DiaryChatTurn[] } {
  const n = turns.length;
  const cap = visibleMax === undefined ? n : Math.min(Math.max(visibleMax, 0), n);
  return { head: turns.slice(0, cap), tail: turns.slice(cap) };
}

function episodeHasComicImages(ep: DiaryEpisode): ep is DiaryEpisode & { comicImages: readonly [string, string, string, string] } {
  const u = ep.comicImages;
  return Array.isArray(u) && u.length === 4 && u.every((s) => typeof s === "string" && s.length > 0);
}

const SCENE_WATERMARK: Record<DiaryComicSceneType, string> = {
  phone: "📱",
  link: "🔗",
  privateInfo: "📝",
  pressure: "⏳",
  transfer: "💸",
  noReply: "✉️",
  warning: "⚠️",
};

function ComicPanelImage({
  src,
  alt,
  sceneType,
  loading,
}: {
  src: string;
  alt: string;
  sceneType: DiaryComicSceneType;
  loading: "eager" | "lazy";
}) {
  const [broken, setBroken] = useState(false);
  const wm = SCENE_WATERMARK[sceneType];

  useEffect(() => {
    setBroken(false);
  }, [src]);

  return (
    <div className={`comic-panel-image-wrap${broken ? " comic-panel-image-wrap--placeholder" : ""}`}>
      {!broken ? (
        <img
          key={src}
          src={src}
          alt={alt}
          className="comic-panel-image"
          decoding="async"
          loading={loading}
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="comic-panel-imageGhost" aria-hidden>
          {wm}
        </span>
      )}
    </div>
  );
}

function ComicStripFoxPose({ poseIndex }: { poseIndex: 0 | 1 | 2 | 3 }) {
  switch (poseIndex) {
    case 0:
      return (
        <svg className="dq-stripFoxSvg" viewBox="0 0 120 118" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <ellipse cx="60" cy="82" rx="30" ry="24" fill="#FFEDD5" stroke="#FB923C" strokeWidth="1.8" />
          <ellipse cx="60" cy="50" rx="24" ry="21" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.7" />
          <path d="M32 40l12 15 8-13" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M88 40l-12 15-8-13" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.5" strokeLinejoin="round" />
          <ellipse cx="51" cy="48" rx="3.6" ry="4.6" fill="#292524" />
          <ellipse cx="69" cy="48" rx="3.6" ry="4.6" fill="#292524" />
          <path d="M48 58q10 10 26 12" stroke="#EA580C" strokeWidth="1.35" fill="none" strokeLinecap="round" />
          <path d="M36 56l-5 10M40 54l-8 14" stroke="#FB923C" strokeWidth="1.5" opacity="0.8" strokeLinecap="round" />
          <rect
            x="78"
            y="58"
            width="34"
            height="52"
            rx="7"
            fill="#fafafa"
            stroke="#64748b"
            strokeWidth="2.2"
            transform="rotate(10 95 82)"
          />
          <path
            d="M86 72h26M86 86h26M86 98h22"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 1:
      return (
        <svg className="dq-stripFoxSvg" viewBox="0 0 120 118" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <ellipse cx="52" cy="82" rx="30" ry="24" fill="#FFEDD5" stroke="#FB923C" strokeWidth="1.8" />
          <ellipse cx="46" cy="50" rx="24" ry="21" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.7" />
          <path d="M20 41l13 14 8-13" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M71 41l-12 14-8-13" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.5" strokeLinejoin="round" />
          <ellipse cx="38" cy="48" rx="3.5" ry="4.6" fill="#292524" />
          <ellipse cx="53" cy="48" rx="3.5" ry="4.6" fill="#292524" />
          <path d="M34 61q40 48 120 154" stroke="#EA580C" strokeWidth="1" fill="none" opacity="0.18" />
          <ellipse cx="40" cy="58" rx="7" ry="4.2" fill="none" stroke="#92400e" strokeWidth="1.2" opacity="0.5" />
          <ellipse cx="56" cy="58" rx="7" ry="4.2" fill="none" stroke="#92400e" strokeWidth="1.2" opacity="0.5" />
          <circle cx="108" cy="44" r="26" fill="rgba(251,146,60,0.15)" stroke="#F97316" strokeWidth="1.85" />
          <ellipse cx="100" cy="44" rx="14" ry="10" fill="none" stroke="#EA580C" strokeWidth="2.2" />
          <path d="M93 52h34" stroke="#EA580C" strokeWidth="2.3" strokeLinecap="round" />
        </svg>
      );
    case 2:
      return (
        <svg className="dq-stripFoxSvg" viewBox="0 0 120 118" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <ellipse cx="64" cy="84" rx="30" ry="24" fill="#FFEDD5" stroke="#FB923C" strokeWidth="1.8" />
          <ellipse cx="64" cy="50" rx="24" ry="21" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.7" />
          <path d="M36 41l13 14 8-13" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M92 41l-13 14-8-13" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.5" strokeLinejoin="round" />
          <ellipse cx="56" cy="46" rx="3.6" ry="4.6" fill="#292524" />
          <ellipse cx="71" cy="46" rx="3.6" ry="4.6" fill="#292524" />
          <path d="M50 62h30" stroke="#EA580C" strokeWidth="1.85" opacity="0.55" strokeLinecap="round" />
          <path d="M28 94l14-26" stroke="#F97316" strokeWidth="3.8" strokeLinecap="round" />
          <path d="M100 93l-14-26" stroke="#F97316" strokeWidth="3.8" strokeLinecap="round" />
          <rect
            x="38"
            y="66"
            width="62"
            height="42"
            rx="6"
            fill="rgba(255,251,246,0.98)"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="7 9"
          />
          <path
            d="M48 76h54M48 88h42M48 100h52"
            stroke="#cbd5e1"
            strokeWidth="1.35"
            strokeLinecap="round"
            opacity="0.82"
          />
        </svg>
      );
    default:
      return (
        <svg className="dq-stripFoxSvg" viewBox="0 0 120 118" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M12 112h118" stroke="#d6cfc6" strokeWidth="6" opacity="0.45" strokeLinecap="round" />
          <rect x="14" y="22" rx="6" width="20" height="68" fill="#44403c" opacity="0.28" stroke="#57534e" strokeWidth="1.35" />
          <circle cx="24" cy="38" r="8" fill="#44403c" opacity="0.35" stroke="#71717a" strokeWidth="1.35" />
          <circle cx="24" cy="58" r="9.5" fill="#fb923c" stroke="#ea580c" strokeWidth="1.85" />
          <circle cx="24" cy="78" r="8" fill="#44403c" opacity="0.35" stroke="#71717a" strokeWidth="1.35" />
          <path d="M98 74l12 34H86z" fill="#fef9c3" stroke="#eab308" strokeWidth="1.8" strokeLinejoin="round" opacity="0.95" />
          <path d="M92 100h12" stroke="#713f12" strokeWidth="2" strokeLinecap="round" />
          <circle cx="98" cy="92" r="2.2" fill="#713f12" />
          <ellipse cx="74" cy="88" rx="30" ry="24" fill="#FFEDD5" stroke="#FB923C" strokeWidth="1.8" />
          <ellipse cx="74" cy="52" rx="24" ry="21" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.7" />
          <path d="M46 44l13 14 8-13" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M102 44l-13 14-8-13" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.5" strokeLinejoin="round" />
          <ellipse cx="66" cy="48" rx="3.6" ry="4.6" fill="#292524" />
          <ellipse cx="82" cy="48" rx="3.6" ry="4.6" fill="#292524" />
          <path d="M66 114h18" stroke="#FB923C" strokeWidth="4" opacity="0.55" strokeLinecap="round" />
          <path d="M70 114h10" stroke="#ea580c" strokeWidth="2.5" opacity="0.58" strokeLinecap="round" />
        </svg>
      );
  }
}

type DiaryComicQuizProps = {
  episode: DiaryEpisode;
  onBack: () => void;
};

function ComicStripPanel({
  cutNum,
  sceneType,
  caption,
  foxLine,
  messageText,
  imgSrc,
  revealed,
  isUsersPick,
  poseIndex,
}: {
  cutNum: number;
  sceneType: DiaryComicSceneType;
  caption: string;
  foxLine: string;
  messageText: string;
  imgSrc: string | null | undefined;
  revealed: boolean;
  isUsersPick: boolean;
  poseIndex: 0 | 1 | 2 | 3;
}) {
  const wm = SCENE_WATERMARK[sceneType];

  return (
    <div
      className={`dq-stripSlide${revealed ? " dq-stripSlide--revealed" : ""}${
        isUsersPick && revealed ? " dq-stripSlide--lanternMarked" : ""
      }`}
    >
      {imgSrc ? (
        <div className="dq-stripPhotoRibbon">
          <img className="dq-stripPhotoRibbonImg" src={imgSrc} alt="" decoding="async" loading="lazy" />
        </div>
      ) : (
        <div className="dq-stripWash" aria-hidden>
          <span className="dq-stripWashGhost">{wm}</span>
        </div>
      )}

      <div className={`dq-stripPoseRow dq-stripPoseRow--cut${cutNum}`}>
        <div className="dq-stripFoxArena">
          <ComicStripFoxPose poseIndex={poseIndex} />
        </div>
        <div className="dq-stripTalkCol">
          <div className="dq-stripBubble">
            <p className="dq-stripBubbleText">{foxLine}</p>
          </div>
          <div className="dq-stripSms">
            <p className="dq-stripSmsText">{messageText}</p>
          </div>
        </div>
      </div>

      <p className="dq-stripNarr">{caption}</p>

      {revealed && isUsersPick ? (
        <div className="dq-stripLanternBadge" aria-label="살펴본 순간 표시">
          <span aria-hidden className="dq-stripLanternIcon">
            🟠
          </span>
          <span>살펴봄</span>
        </div>
      ) : null}
    </div>
  );
}

export function DiaryComicQuiz({ episode, onBack }: DiaryComicQuizProps) {
  const baseId = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handlePick(ix: number) {
    if (revealed) return;
    setChoice(ix);
    setRevealed(true);
  }

  const { head: chatHead, tail: chatTail } = splitChatTurns(episode.chatExample, episode.chatVisibleTurns);
  const fieldsetId = `${baseId}-choices`;
  const imageQuiz = episodeHasComicImages(episode);
  const flow = episode.conversationFlowInsight;
  const summaryParas = paragraphsFromText(episode.explainSummary);
  const strongParas = paragraphsFromText(episode.strongestWarningReason);

  function pickFourButtons() {
    return (
      <div
        className="dq-cutPickCluster"
        role="group"
        aria-label="네 컷 중 살펴볼 순간 선택"
        aria-describedby={`${baseId}-prompt`}
      >
        {([0, 1, 2, 3] as const).map((ix) => {
          const pressed = revealed && choice === ix;
          return (
            <button
              key={`${episode.id}-pick-${ix}`}
              type="button"
              className={`dq-cutPickBtn${pressed ? " dq-cutPickBtn--current" : ""}`}
              onClick={() => handlePick(ix)}
              aria-pressed={revealed ? choice === ix : undefined}
              disabled={revealed}
            >
              {ix + 1}컷
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <section className="dq-root dq-root--toon" aria-label={`만화 흐름 · ${episode.title}`}>
      <div className="dq-backRow">
        <button type="button" className="dq-backToListBtn" onClick={onBack}>
          ← 다른 상황 보기
        </button>
      </div>

      <header className="dq-head dq-head--toon dq-head--mvp">
        <p className="dq-kicker">{episode.subtitle}</p>
        <h3 className="dq-title">{episode.title}</h3>
      </header>

      <fieldset className="dq-toonFieldset" id={fieldsetId}>
        <legend className="dq-visuallyHidden">{episode.question}</legend>

        {imageQuiz ? (
          <article className="dq-comicGrid comic-panel-grid" aria-label="4컷 만화">
            {episode.panels.map((panel, i) => {
              const isUsersPick = choice === i && revealed;
              const fromPanel = typeof panel.imageSrc === "string" && panel.imageSrc.trim().length > 0 ? panel.imageSrc : null;
              const rel = fromPanel ?? episode.comicImages[i];
              const url = resolvePublicAssetUrl(rel);
              return (
                <div
                  key={`${episode.id}-comic-cell-${i}`}
                  className={`dq-comicCard${revealed && isUsersPick ? " dq-comicCard--chosen" : ""}`}
                >
                  <span className="dq-comicCutTag" aria-hidden>
                    {i + 1}컷
                  </span>
                  <ComicPanelImage
                    src={url}
                    alt={panel.stripSummary}
                    sceneType={panel.sceneType}
                    loading={i < 2 ? "eager" : "lazy"}
                  />
                  <p className="dq-comicOneLiner dq-comicOneLiner--panelCaption">
                    {withPreferredLineBreaks(panel.stripSummary)}
                  </p>
                  {revealed && isUsersPick ? (
                    <p className="dq-comicPickNote">
                      <span aria-hidden>🟠</span> 살펴본 순간
                    </p>
                  ) : null}
                </div>
              );
            })}
          </article>
        ) : (
          <article className="dq-comicGrid dq-comicGrid--assembled" aria-label="4컷 만화">
            {episode.panels.map((panel, i) => {
              const imgSrc = resolveDiaryComicPanelSrc(panel.imageKey);
              const isUsersPick = choice === i && revealed;
              const poseIndex = i as 0 | 1 | 2 | 3;
              return (
                <div
                  key={`${episode.id}-asm-cell-${panel.imageKey}-${i}`}
                  className={`dq-comicCard dq-comicCard--assembled${revealed && isUsersPick ? " dq-comicCard--chosen" : ""}`}
                >
                  <span className="dq-comicCutTag" aria-hidden>
                    {i + 1}컷
                  </span>
                  <div className="dq-comicAsmInset">
                    <div className={`dq-stripViewer${revealed ? " dq-stripViewer--done" : ""}`}>
                      <ComicStripPanel
                        cutNum={i + 1}
                        sceneType={panel.sceneType}
                        caption={panel.caption}
                        foxLine={panel.foxLine}
                        messageText={panel.messageText}
                        imgSrc={imgSrc}
                        revealed={revealed}
                        isUsersPick={!!isUsersPick}
                        poseIndex={poseIndex}
                      />
                    </div>
                  </div>
                  <p className="dq-comicOneLiner">{withPreferredLineBreaks(panel.stripSummary)}</p>
                </div>
              );
            })}
          </article>
        )}

        <p className="dq-stripPrompt dq-stripPrompt--quiz" id={`${baseId}-prompt`}>
          {episode.question}
        </p>

        <div className="dq-cutPickWrap">{pickFourButtons()}</div>

        {!revealed ? (
          <p className="dq-stripHint dq-stripHint--quiz" id={`${baseId}-hint`}>
            {episode.quizStripHint ?? DEFAULT_QUIZ_STRIP_HINT}
          </p>
        ) : null}

      </fieldset>

      {revealed && choice !== null ? (
        <div
          className="dq-resultCard dq-resultCard--mvp dq-resultCard--unifiedExplain"
          aria-live="polite"
          role="region"
          aria-labelledby={`${baseId}-result`}
        >
          <h4 id={`${baseId}-result`} className="dq-visuallyHidden">
            사기 흐름 해설
          </h4>

          <div className="dq-unifiedLead" aria-live="polite">
            <p className="dq-unifiedEmpathy">{DEFAULT_EMPATHY_LINE}</p>
            {summaryParas.map((p, ix) => (
              <p key={`${episode.id}-sum-${ix}`} className="dq-unifiedSummaryLine">
                {p}
              </p>
            ))}
            <p className="dq-unifiedPickFeedback">
              <span className="dq-unifiedPickLabel">
                내가 살펴본 순간: <strong>{choice + 1}컷</strong>
              </span>
              <span className="dq-unifiedPickNote"> {episode.selectedCutFeedback[choice]}</span>
            </p>
          </div>

          <section className="dq-unifiedSection" aria-labelledby={`${baseId}-strong`}>
            <h4 id={`${baseId}-strong`} className="dq-unifiedSectionTitle">
              {SECTION_STRONG}
            </h4>
            {strongParas.map((p, ix) => (
              <p key={`${episode.id}-str-${ix}`} className="dq-unifiedSectionBody">
                {p}
              </p>
            ))}
            {episode.strongestWarningCut !== null ? (
              <p className="dq-unifiedStrongRef">
                먼저 의심해볼 장면: <strong>{episode.strongestWarningCut + 1}컷</strong> 근처
              </p>
            ) : null}
          </section>

          <section className="dq-unifiedSection" aria-labelledby={`${baseId}-why`}>
            <h4 id={`${baseId}-why`} className="dq-unifiedSectionTitle">
              {SECTION_SUSPICIOUS}
            </h4>
            {paragraphsFromText(episode.suspiciousWhy).map((p, ix) => (
              <p key={`${episode.id}-why-${ix}`} className="dq-unifiedSectionBody">
                {p}
              </p>
            ))}
          </section>

          <section className="dq-unifiedSection dq-unifiedSection--chat" aria-labelledby={`${baseId}-chat`}>
            <h4 id={`${baseId}-chat`} className="dq-unifiedSectionTitle dq-unifiedSectionTitle--chat">
              {SECTION_CHAT}
            </h4>
            <div className="dq-chatThread dq-chatThread--tight dq-chatThread--unified" role="list">
              {chatHead.map((turn, i) => (
                <div
                  key={`${episode.id}-ch-${i}`}
                  role="listitem"
                  className={`dq-chatRow${turn.speaker === "fox" ? " dq-chatRow--fox" : " dq-chatRow--other"}`}
                >
                  <span className="dq-chatBubble">{turn.text}</span>
                </div>
              ))}
            </div>
            {chatTail.length > 0 ? (
              <details className="dq-detailsMore dq-detailsMore--muted dq-detailsMore--tight dq-chatMoreWrap">
                <summary>조금 더 보기</summary>
                <div className="dq-chatThread dq-chatThread--tight dq-chatThread--more" role="list">
                  {chatTail.map((turn, i) => (
                    <div
                      key={`${episode.id}-ch-more-${i}`}
                      role="listitem"
                      className={`dq-chatRow${turn.speaker === "fox" ? " dq-chatRow--fox" : " dq-chatRow--other"}`}
                    >
                      <span className="dq-chatBubble">{turn.text}</span>
                    </div>
                  ))}
                </div>
              </details>
            ) : null}
          </section>

          <section className="dq-unifiedSection dq-unifiedSection--stop" aria-labelledby={`${baseId}-stop`}>
            <h4 id={`${baseId}-stop`} className="dq-unifiedSectionTitle">
              {SECTION_STOP}
            </h4>
            <p className="dq-unifiedStopHighlight">{episode.stopSignalsHighlight}</p>
          </section>

          <section className="dq-unifiedSection" aria-labelledby={`${baseId}-peer`}>
            <h4 id={`${baseId}-peer`} className="dq-unifiedSectionTitle">
              {SECTION_PEER}
            </h4>
            <p className="dq-unifiedPeerQuote">{episode.peerTalkPrompt}</p>
          </section>

          <details className="dq-detailsMore dq-detailsFlowAgain dq-detailsMore--muted dq-detailsMore--tight">
            <summary>{FLOW_AGAIN_SUMMARY}</summary>
            <div className="dq-flowPanelStack dq-flowPanelStack--embedded" role="region">
              <section className="dq-flowInsightCard dq-flowInsightCard--compact" aria-labelledby={`${baseId}-ef-call`}>
                <h4 id={`${baseId}-ef-call`} className="dq-flowInsightTitle">
                  {flow.titles?.call ?? FLOW_FALLBACK_CALL}
                </h4>
                <ul className="dq-flowInsightList">
                  {flow.callLikeBullets.map((line, ix) => (
                    <li key={`${episode.id}-efc-${ix}`}>{line}</li>
                  ))}
                </ul>
              </section>
              <section className="dq-flowInsightCard dq-flowInsightCard--compact" aria-labelledby={`${baseId}-ef-sms`}>
                <h4 id={`${baseId}-ef-sms`} className="dq-flowInsightTitle">
                  {flow.titles?.sms ?? FLOW_FALLBACK_SMS}
                </h4>
                <ul className="dq-flowInsightList">
                  {flow.smsBullets.map((line, ix) => (
                    <li key={`${episode.id}-efs-${ix}`}>{line}</li>
                  ))}
                </ul>
              </section>
              <section className="dq-flowInsightCard dq-flowInsightCard--compact" aria-labelledby={`${baseId}-ef-psych`}>
                <h4 id={`${baseId}-ef-psych`} className="dq-flowInsightTitle">
                  {flow.titles?.psych ?? FLOW_FALLBACK_PSYCH}
                </h4>
                <ul className="dq-flowInsightList">
                  {flow.psychBullets.map((line, ix) => (
                    <li key={`${episode.id}-efp-${ix}`}>{line}</li>
                  ))}
                </ul>
              </section>
            </div>
          </details>

          <p className="dq-unifiedClosingFooter">{episode.closingMessage}</p>

          <EpisodeFeedbackMiniCard episodeId={episode.id} />

          <div className="dq-actions dq-actions--split dq-actions--resultFooter">
            <button
              type="button"
              className="dq-secondary"
              onClick={() => {
                setChoice(null);
                setRevealed(false);
              }}
            >
              다시 고르기
            </button>
            <button type="button" className="dq-primary" onClick={onBack}>
              처음 화면
            </button>
          </div>
        </div>
      ) : null}

      {!(revealed && choice !== null) ? (
        <aside className="dq-safeTailBanner" role="note">
          <p className="dq-safeTailText">{episode.closingMessage}</p>
        </aside>
      ) : null}
    </section>
  );
}
