import { useEffect, useId, useState } from "react";

import {
  cutIndexToFeedbackKey,
  type ConversationMessage,
  type ScamEpisode,
  resolvePublicAssetUrl,
  withPreferredLineBreaks,
} from "../data/diaryEpisodes";
import { EpisodeFeedbackMiniCard } from "./EpisodeFeedbackMiniCard";

const DEFAULT_QUIZ_HINT = "흐름을 읽고, 마음에 걸리는 컷을 하나 골라 보세요.";
const CARD_LOOK_TITLE = "내가 살펴본 순간";
const CARD_WHY_TITLE = "왜 문제인가";
const CARD_CHAT_TITLE = "실제 대화 예시";
const CARD_SIGNALS_TITLE = "여기서 멈춰야 할 신호";
const CARD_PEER_TITLE = "가까운 사람에게 말해보기";

const EDU_MSG_CAP = 5;

function messengerTurnTime(ix: number): string {
  const baseMin = 14 * 60 + 28;
  const m = baseMin + ix * 4;
  const h24 = Math.floor(m / 60) % 24;
  const min = m % 60;
  const pm = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${pm ? "오후" : "오전"} ${h12}:${String(min).padStart(2, "0")}`;
}

function speakerIsFox(s: ConversationMessage["speaker"]): boolean {
  return s === "fox";
}

function ConversationExampleThread({
  episodeId,
  messages,
}: {
  episodeId: string;
  messages: readonly ConversationMessage[];
}) {
  const shown = messages.slice(0, EDU_MSG_CAP);

  return (
    <section className="edu-msgSection" aria-label="메신저 대화 예시">
      <div className="edu-msgPhone" role="list">
        {shown.map((turn, i) => {
          const isFox = speakerIsFox(turn.speaker);
          const time = messengerTurnTime(i);
          return (
            <div
              key={`${episodeId}-conv-${i}`}
              className={`edu-msgRow${isFox ? " edu-msgRow--me" : " edu-msgRow--them"}`}
              role="listitem"
              data-speaker={turn.speaker}
            >
              <div className={`edu-msgAvatar${isFox ? " edu-msgAvatar--me" : " edu-msgAvatar--them"}`} aria-hidden>
                {isFox ? "🦊" : "?"}
              </div>
              <div className="edu-msgPayload">
                <div className={`edu-msgBubble${isFox ? " edu-msgBubble--me" : " edu-msgBubble--them"}`}>
                  {turn.text}
                </div>
                <span className={`edu-msgTime${isFox ? " edu-msgTime--me" : ""}`}>{time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ComicPanelFigure({
  src,
  caption,
  panelIx,
  episodeId,
  revealed,
  isUsersPick,
  eager,
}: {
  src: string;
  caption: string;
  panelIx: number;
  episodeId: string;
  revealed: boolean;
  isUsersPick: boolean;
  eager: boolean;
}) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  const url = resolvePublicAssetUrl(src);

  return (
    <div
      className={`dq-comicCard${revealed && isUsersPick ? " dq-comicCard--chosen" : ""}`}
      key={`${episodeId}-cell-${panelIx}`}
    >
      <span className="dq-comicCutTag" aria-hidden>
        {panelIx + 1}컷
      </span>
      <div className={`comic-panel-image-wrap${broken ? " comic-panel-image-wrap--placeholder" : ""}`}>
        {!broken ? (
          <img
            className="comic-panel-image"
            src={url}
            alt={caption}
            decoding="async"
            loading={eager ? "eager" : "lazy"}
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="comic-panel-imageGhost" aria-hidden>
            ⚠️
          </span>
        )}
      </div>
      <p className="dq-comicOneLiner dq-comicOneLiner--panelCaption">{withPreferredLineBreaks(caption)}</p>
      {revealed && isUsersPick ? (
        <p className="dq-comicPickNote">
          <span aria-hidden>🟠</span> 살펴봄
        </p>
      ) : null}
    </div>
  );
}

type DiaryComicQuizProps = {
  episode: ScamEpisode;
  onBack: () => void;
};

export function DiaryComicQuiz({ episode, onBack }: DiaryComicQuizProps) {
  const baseId = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handlePick(ix: number) {
    if (revealed) return;
    setChoice(ix);
    setRevealed(true);
  }

  const fieldsetId = `${baseId}-choices`;
  const cutKey = choice !== null ? cutIndexToFeedbackKey(choice) : undefined;

  let feedbackForPick = "";
  if (cutKey !== undefined) feedbackForPick = episode.selectedCutFeedback[cutKey];

  const strongest = episode.strongestWarningCut;
  const pickedCutNum = choice !== null ? choice + 1 : null;
  const showStrongContrast =
    strongest !== null &&
    pickedCutNum !== null &&
    pickedCutNum !== strongest &&
    strongest >= 1 &&
    strongest <= 4;

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
        <legend className="dq-visuallyHidden">{episode.quizPrompt ?? "컷 선택"}</legend>

        <article className="dq-comicGrid comic-panel-grid" aria-label="4컷 만화">
          {episode.panels.map((panel, i) => (
            <ComicPanelFigure
              key={`${episode.id}-panel-${panel.id}`}
              episodeId={episode.id}
              panelIx={i}
              src={panel.imageSrc}
              caption={panel.caption}
              revealed={revealed}
              isUsersPick={choice === i}
              eager={i < 2}
            />
          ))}
        </article>

        <p className="dq-stripPrompt dq-stripPrompt--quiz" id={`${baseId}-prompt`}>
          {episode.quizPrompt ?? "걸리는 순간 하나를 골라 보세요."}
        </p>

        <div className="dq-cutPickWrap">
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
        </div>

        {!revealed ? (
          <p className="dq-stripHint dq-stripHint--quiz" id={`${baseId}-hint`}>
            {episode.quizHint ?? DEFAULT_QUIZ_HINT}
          </p>
        ) : null}
      </fieldset>

      {revealed && choice !== null ? (
        <div
          className="dq-resultCard dq-resultCard--mvp dq-resultCard--shortCard"
          aria-live="polite"
          role="region"
          aria-labelledby={`${baseId}-result`}
        >
          <h4 id={`${baseId}-result`} className="dq-visuallyHidden">
            사기 예방 결과 카드
          </h4>

          <section className="rc-block" aria-labelledby={`${baseId}-seen`}>
            <h4 id={`${baseId}-seen`} className="rc-blockTitle">
              {CARD_LOOK_TITLE}
            </h4>
            <p className="rc-keyLine">{withPreferredLineBreaks(episode.panels[choice].caption)}</p>
          </section>

          <section className="rc-block" aria-labelledby={`${baseId}-why`}>
            <h4 id={`${baseId}-why`} className="rc-blockTitle">
              {CARD_WHY_TITLE}
            </h4>
            <p className="rc-softNote">이 장면에서도 멈춰볼 수 있어요.</p>
            <p className="rc-subText">{withPreferredLineBreaks(feedbackForPick)}</p>
            {showStrongContrast ? (
              <p className="rc-strongHint">
                이 흐름에서는 특히 강한 경고 신호에 가까운 곳은 {strongest}컷이에요.
              </p>
            ) : null}
            <p className="rc-strongLead">가장 강한 경고 신호 안내</p>
            <p className="rc-subText">{withPreferredLineBreaks(episode.strongestWarningReason)}</p>
          </section>

          <section className="rc-block" aria-labelledby={`${baseId}-chat`}>
            <h4 id={`${baseId}-chat`} className="rc-blockTitle">
              {CARD_CHAT_TITLE}
            </h4>
            <ConversationExampleThread episodeId={episode.id} messages={episode.conversationExample} />
          </section>

          <section className="rc-block" aria-labelledby={`${baseId}-sig`}>
            <h4 id={`${baseId}-sig`} className="rc-blockTitle">
              {CARD_SIGNALS_TITLE}
            </h4>
            <ul className="rc-signalList">
              {episode.warningSignals.map((signal) => (
                <li key={signal} className="rc-signalPill">
                  {signal}
                </li>
              ))}
            </ul>
          </section>

          <section className="rc-block" aria-labelledby={`${baseId}-peer`}>
            <h4 id={`${baseId}-peer`} className="rc-blockTitle">
              {CARD_PEER_TITLE}
            </h4>
            <div className="rc-peerQuote">
              <p className="rc-subText">{withPreferredLineBreaks(episode.talkToTrustedPerson)}</p>
            </div>
          </section>

          <p className="rc-finalPause dq-unifiedClosingFooter">{withPreferredLineBreaks(episode.finalPauseMessage)}</p>

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
    </section>
  );
}
