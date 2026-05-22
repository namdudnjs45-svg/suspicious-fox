import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { CategoryId } from "./data/content";
import {
  type StageScenario,
  type StageMsgRole,
  STAGE_SIGNAL_TOTAL,
  countStageSignals,
} from "./data/stageScenarios";
import { StoryFoxDecoImg } from "./StoryFoxDecoImg";

const FOX_LINE_INITIAL = "대화 속에서 갸웃한 신호 3개를 찾아보세요.";
const FOX_AFTER_ONE = "좋아요. 첫 번째 갸웃 신호를 찾았어요.";
const FOX_AFTER_TWO = "조금 더 보이면 흐름이 더 분명해져요. 하나만 더 찾아볼까요?";
const FOX_AFTER_THREE = "좋아요. 이 흐름은 거래나 입력 전에 한 번 더 확인해볼 필요가 있어요.";

const MARKET_WRONG_BUBBLE_COPY =
  "이 말은 아직 결정적인 신호는 아니에요. 다른 문장을 더 살펴볼까요?";

/** 말풍선 표시만 — 원본 시나리오 문자열은 그대로 두고, 줄바꿈 문자는 공백으로만 정리 */
function displayChatBubbleText(raw: string): string {
  return raw.replace(/\r?\n+/g, " ").replace(/\s{2,}/g, " ").trim();
}

function diaryLineParaClass(linesLen: number, breakIdx: number | null, i: number): string {
  if (breakIdx == null || i !== breakIdx) return "";
  if (breakIdx <= 0 || breakIdx >= linesLen) return "";
  return " story-diaryIntro__line--paraBreak";
}

function foxHeadline(signalsFound: number): string {
  if (signalsFound >= STAGE_SIGNAL_TOTAL) return FOX_AFTER_THREE;
  if (signalsFound === 2) return FOX_AFTER_TWO;
  if (signalsFound === 1) return FOX_AFTER_ONE;
  return FOX_LINE_INITIAL;
}

function rowModifierClass(role: StageMsgRole): string {
  switch (role) {
    case "buyerRight":
    case "userRight":
      return "story-chatRow--me";
    case "foxCenter":
      return "story-chatRow--fox";
    default:
      return "story-chatRow--seller";
  }
}

/** 행 패턴 선택용 클래스(정렬 보조용) — 채팅 로직 분기 없음 */
function storyChatMessageRowAccentClass(role: StageMsgRole): string {
  switch (role) {
    case "buyerRight":
      return "story-chatMessageRow--buyer story-chatMessageRow--me";
    case "userRight":
      return "story-chatMessageRow--user story-chatMessageRow--me";
    case "foxCenter":
      return "story-chatMessageRow--fox";
    default:
      return "story-chatMessageRow--seller story-chatMessageRow--other story-chatMessageRow--text";
  }
}

function chatBubbleShortClass(shown: string): string {
  return shown.length <= 16 ? " story-chatBubble--short" : "";
}

function neutralBubbleInnerClass(role: StageMsgRole): string {
  if (role === "buyerRight")
    return "story-chatBubble story-chatBubble--me story-chatBubble--buyer";
  if (role === "userRight") return "story-chatBubble story-chatBubble--me story-chatBubble--user";
  if (role === "sceneLeft")
    return "story-chatBubble story-chatBubble--seller story-chatBubble--other story-chatBubble--scene";
  return "story-chatBubble story-chatBubble--seller story-chatBubble--other";
}

export type StageStoryFlowProps = {
  categoryKey: CategoryId;
  scenario: StageScenario;
};

export function StageStoryFlow({ categoryKey, scenario }: StageStoryFlowProps) {
  const checklist = scenario.signals.map((s) => s.checkQuestion);
  const [foundSignalIds, setFoundSignalIds] = useState<string[]>([]);
  const [wrongLine, setWrongLine] = useState<string | null>(null);
  const [wrongBump, setWrongBump] = useState(0);
  const checklistAnchorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setFoundSignalIds([]);
    setWrongLine(null);
    setWrongBump(0);
  }, [categoryKey]);

  useEffect(() => {
    if (!wrongLine) return;
    const t = window.setTimeout(() => setWrongLine(null), 2800);
    return () => window.clearTimeout(t);
  }, [wrongLine, wrongBump]);

  const signalsFoundCount = countStageSignals(foundSignalIds, scenario.signals);
  const progressPct = Math.min(100, (signalsFoundCount / STAGE_SIGNAL_TOTAL) * 100);
  const isStageCleared = signalsFoundCount >= STAGE_SIGNAL_TOTAL;
  const foxLine = foxHeadline(signalsFoundCount);

  function handleSignalClick(signalId: string) {
    if (!scenario.signals.some((s) => s.signalId === signalId)) return;
    setFoundSignalIds((prev) => (prev.includes(signalId) ? prev : [...prev, signalId]));
    setWrongLine(null);
  }

  function handleBenignBubbleTap() {
    if (isStageCleared) return;
    setWrongLine(MARKET_WRONG_BUBBLE_COPY);
    setWrongBump((b) => b + 1);
  }

  function scrollToChecklist() {
    checklistAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const chatHeadingDomId = `story-chat-heading-${categoryKey}`;
  const checkHeadingId = `story-check-heading-${categoryKey}`;
  const checklistAnchorId = `story-check-anchor-${categoryKey}`;

  return (
    <>
      <div className="story-diaryIntro">
        <span className="story-diaryIntro__label">{scenario.diaryLabel}</span>
        <div className="story-diaryIntro__text">
          {scenario.introLines.map(({ delayS, text }, i) => (
            <p
              key={`stage-intro-${categoryKey}-${i}`}
              className={`story-diaryIntro__line${diaryLineParaClass(scenario.introLines.length, scenario.paragraphBreakBeforeLineIndex, i)}`}
              style={{ animationDelay: `${delayS}s` } as CSSProperties}
            >
              {text}
            </p>
          ))}
        </div>
      </div>

      <div className="story-stageHeader">
        <StoryFoxDecoImg filename="fox-logo.png" className="story-stageHeader__fox" width={32} height={32} />
        <div className="story-stageHeader__copy">
          <p className="story-stageHeader__label">
            {scenario.stageBadge}
            <span className="story-stageHeader__middot">·</span>
            {scenario.stageTitleSuffix}
          </p>
          <p className="story-stageHeader__title">수상한 신호 3개를 찾아보세요.</p>
        </div>
        <div className="story-stageProgress">
          <p className="story-stageProgress__label">
            진행도<span className="story-stageProgress__dot">:</span>
            찾은 신호 {signalsFoundCount}/{STAGE_SIGNAL_TOTAL}
          </p>
          <div className="story-stageProgress__bar" role="presentation" aria-hidden>
            <div className="story-stageProgress__fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <section className="story-chatSim" aria-labelledby={chatHeadingDomId}>
        <div className="story-chatSim__header">
          <span id={chatHeadingDomId}>{scenario.chatHeading}</span>
          <small className="story-chatSim__sub">{scenario.chatSub}</small>
        </div>
        <p className="story-chatSim__hint">{scenario.hintLine}</p>

        <div className="story-chatSim__body">
          <div className="story-chatSim__rail">
            {scenario.messages.map((msg, i) => {
              return (
                <div
                  key={`stage-msg-${categoryKey}-${msg.speaker}-${i}`}
                  className={`story-chatMessageRow story-chatRow ${rowModifierClass(msg.role)} ${storyChatMessageRowAccentClass(msg.role)}`}
                  style={{ "--story-chat-msg-i": i } as CSSProperties}
                >
                  {msg.role === "foxCenter" ? (
                    <div className="story-chatFoxRow">
                      <StoryFoxDecoImg filename="fox-message.png" className="story-chatFoxRow__pic" width={28} height={28} />
                      <div
                        className={`story-chatBubble story-chatBubble--fox story-chatFoxRow__bubble${chatBubbleShortClass(displayChatBubbleText(msg.text))}`}
                      >
                        <span className="story-chatBubble__foxLabel">{msg.speaker}</span>
                        <p className="story-chatBubbleText story-chatBubble__text">{displayChatBubbleText(msg.text)}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="story-chatSpeaker">{msg.speaker}</span>
                      {msg.signalId ? (
                        <StageSignalBubble
                          text={msg.text}
                          label={
                            scenario.signals.find((s) => s.signalId === msg.signalId)?.label ?? "갸웃 신호"
                          }
                          found={foundSignalIds.includes(msg.signalId)}
                          onFind={() => handleSignalClick(msg.signalId!)}
                          sceneStyle={msg.role === "sceneLeft"}
                        />
                      ) : (
                        <button
                          type="button"
                          className="story-chatTap story-chatTap--neutral"
                          aria-label={`${msg.speaker}: ${displayChatBubbleText(msg.text)}. 더 살펴보려면 선택할 수 있어요.`}
                          disabled={isStageCleared}
                          onClick={handleBenignBubbleTap}
                        >
                          <div
                            className={`${neutralBubbleInnerClass(msg.role)}${chatBubbleShortClass(displayChatBubbleText(msg.text))}`}
                          >
                            <p className="story-chatBubbleText story-chatBubble__text">{displayChatBubbleText(msg.text)}</p>
                          </div>
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`story-foxHint${isStageCleared ? " story-foxHint--cleared" : ""}`} aria-live="polite">
            <StoryFoxDecoImg filename={isStageCleared ? "fox-check.png" : "fox-curious.png"} className="story-foxHint__pic" width={34} height={34} />
            <div className="story-foxHint__bubble">
              <span className="story-foxHint__speaker">여우</span>
              <p className="story-foxHint__text">{foxLine}</p>
              {wrongLine && !isStageCleared ? <p className="story-foxHint__aside">{wrongLine}</p> : null}
            </div>
          </div>

          {isStageCleared ? (
            <div className="story-stageClearCard">
              <p className="story-stageClearCard__badge">Stage Clear.</p>
              <h3 className="story-stageClearCard__title">갸웃 신호를 모두 찾았어요.</h3>
              <p className="story-stageClearCard__desc">{scenario.clearDescription}</p>
              <button type="button" className="story-stageClearCard__cta" onClick={scrollToChecklist}>
                체크리스트 확인하기
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section
        ref={(el) => {
          checklistAnchorRef.current = el;
        }}
        className={`sf-checkSection sf-checkSection--story${isStageCleared ? " is-unlocked" : ""}`}
        aria-labelledby={checkHeadingId}
        id={checklistAnchorId}
      >
        <div className="sf-checkSection__lead">
          <StoryFoxDecoImg filename="fox-check.png" className="sf-checkSection__foxImg" width={36} height={36} />
          <h3 id={checkHeadingId} className="sf-checkTitle">
            찾아낸 신호를 다시 확인해볼까요?
          </h3>
        </div>
        <ul className="sf-checkList">
          {checklist.map((q, qi) => (
            <li key={`${categoryKey}-chk-${qi}`}>{q}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

type StageSignalBubbleProps = {
  text: string;
  label: string;
  found: boolean;
  onFind: () => void;
  sceneStyle: boolean;
};

function StageSignalBubble({ text, label, found, onFind, sceneStyle }: StageSignalBubbleProps) {
  const shown = displayChatBubbleText(text);
  const bubble = [
    "story-chatBubble",
    "story-chatBubble--seller",
    "story-chatBubble--other",
    sceneStyle ? "story-chatBubble--scene" : "",
    found ? "is-found has-signal-tag" : "",
    !found && shown.length <= 16 ? "story-chatBubble--short" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={`story-chatTap story-chatTap--signalReveal${found ? " story-chatTap--signalReveal--found" : ""}`}
      aria-pressed={found}
      aria-label={found ? `확인한 갸웃 신호. ${label}` : `메시지를 살펴보려면 누르세요. ${shown}`}
      disabled={found}
      onClick={onFind}
    >
      <div className={bubble}>
        <p className="story-chatBubbleText story-chatBubble__text">{shown}</p>
        {found ? <span className="story-signalTag story-signalTag--revealed">{label}</span> : null}
      </div>
    </button>
  );
}
