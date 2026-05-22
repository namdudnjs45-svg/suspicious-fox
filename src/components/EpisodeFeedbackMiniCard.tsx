import { useEffect, useId, useState } from "react";
import type { EpisodeFeedbackType } from "../lib/episodeFeedbackStorage";
import { getLatestEpisodeFeedback, saveEpisodeFeedback } from "../lib/episodeFeedbackStorage";

const THANK_YOU_LINE = "고마워요. 여우가 더 좋은 사례를 모을 수 있게 되었어요.";

type EpisodeFeedbackMiniCardProps = {
  episodeId: string;
};

export function EpisodeFeedbackMiniCard({ episodeId }: EpisodeFeedbackMiniCardProps) {
  const groupId = useId();
  const [selected, setSelected] = useState<EpisodeFeedbackType | null>(null);

  useEffect(() => {
    setSelected(getLatestEpisodeFeedback(episodeId)?.feedbackType ?? null);
  }, [episodeId]);

  function handlePick(type: EpisodeFeedbackType) {
    saveEpisodeFeedback({ episodeId, feedbackType: type });
    setSelected(type);
  }

  const options: { type: EpisodeFeedbackType; label: string }[] = [
    { type: "similar", label: "내 상황과 비슷했어요" },
    { type: "helpful", label: "도움이 되었어요" },
    { type: "unsure", label: "아직 잘 모르겠어요" },
  ];

  return (
    <aside className="dq-feedbackMini" aria-labelledby={`${groupId}-title`}>
      <p id={`${groupId}-title`} className="dq-feedbackMiniTitle">
        이 사례가 도움이 되었나요?
      </p>
      <p className="dq-feedbackMiniHint">
        비슷한 상황을 겪었거나, 한 번 더 멈춰볼 생각이 들었다면 알려주세요.
      </p>
      <div className="dq-feedbackMiniPills" role="group" aria-label="피드백 선택">
        {options.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            className={`dq-feedbackPill${selected === type ? " dq-feedbackPill--selected" : ""}`}
            aria-pressed={selected === type}
            onClick={() => handlePick(type)}
          >
            {label}
          </button>
        ))}
      </div>
      {selected ? (
        <p className="dq-feedbackMiniThanks" role="status">
          {THANK_YOU_LINE}
        </p>
      ) : null}
    </aside>
  );
}
