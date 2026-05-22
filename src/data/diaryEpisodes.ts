/**
 * 4컷 만화 교육용 스캠 에피소드 데이터.
 * 결과 화면 문구는 이 파일에 저장된 문자열만 사용합니다(임의 생성 없음).
 */

export type ConversationSpeaker = "seller" | "scammer" | "fox" | "system";

export type ConversationMessage = {
  speaker: ConversationSpeaker;
  text: string;
};

export type ScamPanel = {
  id: number;
  label: string;
  imageSrc: string;
  caption: string;
};

export type CutKey = 1 | 2 | 3 | 4;

export type ScamEpisode = {
  /** 고유 id — 허브의 episodeId와 동일해야 합니다. */
  id: string;
  title: string;
  subtitle: string;
  quizPrompt?: string;
  quizHint?: string;
  panels: readonly [ScamPanel, ScamPanel, ScamPanel, ScamPanel];
  selectedCutFeedback: Record<CutKey, string>;
  strongestWarningCut: number | null;
  strongestWarningReason: string;
  conversationExample: readonly ConversationMessage[];
  warningSignals: readonly string[];
  talkToTrustedPerson: string;
  /** 모든 사례 공통 가능; 화면 하단 한 번만 표시합니다. */
  finalPauseMessage: string;
};

export const SHARED_FINAL_PAUSE_MESSAGE = "잠시 멈춰보세요. 차분히 생각해도 늦지 않습니다.";

/** Vite 배포 시 `public/scenarios/` → URL `/scenarios/파일명.png` */
export function scenarioComicImg(fileName: string): string {
  const name = fileName.replace(/^\/+/, "").replace(/^scenarios\//, "");
  return `/scenarios/${name}`;
}

export function resolvePublicAssetUrl(path: string): string {
  const rel = path.replace(/^\/+/, "");
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return `${base}${rel}`.replace(/\/{2,}/g, "/");
}

/** 쉼표·마침표 뒤에 우선 줄바꿈이 일어나도록 ZWSP 를 넣습니다. */
export function withPreferredLineBreaks(text: string): string {
  return text.replace(/([,，.。])\s*/g, "$1\u200b");
}

export function findScamEpisodeById(id: string): ScamEpisode | undefined {
  return SCAM_EPISODES.find((e) => e.id === id);
}

/** 컷 선택 index(0–3) → selectedCutFeedback 키(1–4) */
export function cutIndexToFeedbackKey(ix: number): CutKey | undefined {
  if (ix >= 0 && ix <= 3) return (ix + 1) as CutKey;
  return undefined;
}

export const SCAM_EPISODES = [
  {
    id: "court-call",
    title: "법원 전화를 받은 여우",
    subtitle: "어떻게 멈춰야 할까요?",
    quizPrompt: "걸리는 순간 하나를 골라 보세요.",
    quizHint: "어느 컷에서든 멈춰볼 수 있어요. 맞히기 식 문제는 아니에요.",
    panels: [
      {
        id: 1,
        label: "1컷",
        imageSrc: scenarioComicImg("court-v2-01.png"),
        caption: "법원에서 등기를 보낸다고 해요.",
      },
      {
        id: 2,
        label: "2컷",
        imageSrc: scenarioComicImg("court-v2-02.png"),
        caption: "집에 있는 시간을 물어봐요.",
      },
      {
        id: 3,
        label: "3컷",
        imageSrc: scenarioComicImg("court-v2-03.png"),
        caption: "온라인 수령 링크를 보내요.",
      },
      {
        id: 4,
        label: "4컷",
        imageSrc: scenarioComicImg("court-v2-04.png"),
        caption: "개인정보 입력을 유도해요.",
      },
    ],
    selectedCutFeedback: {
      1: "기관 이름을 들은 순간부터 확인이 필요해요. 진짜 법원 연락처럼 들려도, 전화만 믿고 따라가면 안 돼요.",
      2: "상대가 내 일정과 상황을 확인하며 대화를 끌고 가기 시작했어요. 이때부터 잠시 멈추고 공식 번호로 다시 확인하는 게 좋아요.",
      3: "낯선 링크로 이동하라고 하는 순간은 강한 경고 신호예요. 공식 홈페이지나 대표번호를 직접 검색해서 확인해야 해요.",
      4: "개인정보 입력 단계까지 가면 매우 위험해요. 이름, 주민등록번호, 전화번호, 주소는 낯선 링크에 입력하지 않아야 해요.",
    },
    strongestWarningCut: 3,
    strongestWarningReason:
      "법원이나 기관처럼 말하더라도, 문자 링크로 접속하라고 하거나 개인정보 입력을 요구하면 즉시 멈춰야 해요.",
    conversationExample: [
      { speaker: "scammer", text: "OO법원입니다. 등기 확인 때문에 연락드렸습니다." },
      { speaker: "fox", text: "제가 그 시간에 집에 없을 수도 있어요." },
      { speaker: "scammer", text: "그럼 온라인으로 수령하시면 됩니다. 아래 링크로 접속해주세요." },
      { speaker: "fox", text: "공식 홈페이지에서도 확인할 수 있나요?" },
      {
        speaker: "scammer",
        text: "지금은 이 링크로만 처리 가능합니다. 오늘 안에 확인하지 않으면 불이익이 있을 수 있습니다.",
      },
    ],
    warningSignals: [
      "낯선 전화가 기관을 사칭해요.",
      "내 일정과 상황을 묻고 대화를 끌고 가요.",
      "문자 링크로 이동하라고 해요.",
      "개인정보 입력을 요구해요.",
    ],
    talkToTrustedPerson:
      "법원이라고 전화가 왔는데, 링크로 확인하라고 해. 이거 진짜 맞는지 같이 봐줄 수 있어?",
    finalPauseMessage: SHARED_FINAL_PAUSE_MESSAGE,
  },
  {
    id: "ticket-scam",
    title: "저렴한 티켓을 찾은 여우",
    subtitle: "어떻게 멈춰야 할까요?",
    quizPrompt: "걸리는 순간 하나를 골라 보세요.",
    quizHint: "이 흐름에서는 재송금을 요구하는 구간부터 특히 각별히 보세요.",
    panels: [
      {
        id: 1,
        label: "1컷",
        imageSrc: scenarioComicImg("ticket-01.png"),
        caption: "좋은 자리와 저렴한 티켓을 발견했어요.",
      },
      {
        id: 2,
        label: "2컷",
        imageSrc: scenarioComicImg("ticket-02.png"),
        caption: "판매자에게 돈을 송금했어요.",
      },
      {
        id: 3,
        label: "3컷",
        imageSrc: scenarioComicImg("ticket-03.png"),
        caption: "송금자명이 틀렸다며 다시 보내라고 해요.",
      },
      {
        id: 4,
        label: "4컷",
        imageSrc: scenarioComicImg("ticket-04.png"),
        caption: "결국 돈을 잃고 티켓도 받지 못했어요.",
      },
    ],
    selectedCutFeedback: {
      1: "가격이 너무 좋고 조건이 급하게 느껴진다면 한 번 멈춰볼 수 있어요. 하지만 이 단계만으로 사기라고 단정하기는 어려워요.",
      2: "송금한 뒤 상대가 이상한 이유를 붙이며 추가 행동을 요구하기 시작하면 조심해야 해요. 이 사례에서는 여기서부터 강한 경고 신호가 나타나요.",
      3: "이미 돈을 보냈는데 송금자명 오류나 재처리를 이유로 같은 금액을 다시 보내라고 하면 매우 위험해요. 이 단계에서는 절대 추가 송금하지 않아야 해요.",
      4: "연락이 늦어지거나 티켓을 받지 못했다면 이미 피해가 커진 뒤일 수 있어요. 바로 거래 내역을 캡처하고 신고 방법을 확인해야 해요.",
    },
    strongestWarningCut: 2,
    strongestWarningReason:
      "티켓 사기에서는 이미 송금한 뒤 \"송금자명 오류\", \"재처리\", \"같은 금액 다시 보내기\"를 요구하는 순간이 가장 강한 사기 신호예요. 돈을 또 보내라고 하면 즉시 멈춰야 해요.",
    conversationExample: [
      { speaker: "seller", text: "입금 확인했어요. 그런데 송금자명이 잘못 들어갔어요." },
      { speaker: "fox", text: "제가 보낸 돈은 어떻게 되나요?" },
      { speaker: "seller", text: "같은 금액을 다시 보내주시면 기존 금액이랑 같이 처리돼요." },
      { speaker: "fox", text: "먼저 보낸 돈은 환불되는 거죠?" },
      {
        speaker: "seller",
        text: "네, 재입금 확인되면 같이 정리됩니다. 지금 바로 보내주세요.",
      },
    ],
    warningSignals: [
      "이미 송금했는데 다시 보내라고 해요.",
      "송금자명 오류, 재처리 같은 이유를 대요.",
      "같은 금액을 또 보내면 해결된다고 말해요.",
      "빨리 보내라고 압박해요.",
    ],
    talkToTrustedPerson:
      "티켓 샀는데 송금자명이 틀렸다고 같은 돈을 다시 보내래. 이거 이상하지 않아?",
    finalPauseMessage: SHARED_FINAL_PAUSE_MESSAGE,
  },
  {
    id: "used-trade-scam",
    title: "싸게 올린 물건에 혹한 여우",
    subtitle: "어떻게 멈춰야 할까요?",
    quizPrompt: "걸리는 순간 하나를 골라 보세요.",
    quizHint: "선입금 재촉이 나오면 속도 줄이고 확인해 보세요.",
    panels: [
      {
        id: 1,
        label: "1컷",
        imageSrc: scenarioComicImg("item-01.png"),
        caption: "저렴한 가격의 물건이 눈에 들어왔어요.",
      },
      {
        id: 2,
        label: "2컷",
        imageSrc: scenarioComicImg("item-02.png"),
        caption: "직거래는 어렵다고 회피해요.",
      },
      {
        id: 3,
        label: "3컷",
        imageSrc: scenarioComicImg("item-03.png"),
        caption: "선입금을 재촉해요.",
      },
      {
        id: 4,
        label: "4컷",
        imageSrc: scenarioComicImg("item-04.png"),
        caption: "입금 후 연락이 뜸해졌어요.",
      },
    ],
    selectedCutFeedback: {
      1: "시세보다 많이 저렴한 물건은 먼저 의심해볼 수 있어요. 좋은 가격일수록 판매자 정보와 거래 방식을 천천히 확인해야 해요.",
      2: "직거래를 피하고 택배만 가능하다고 하면 주의해야 해요. 중고거래에서는 직접 확인할 수 없는 상태에서 선입금만 요구하는 흐름이 위험할 수 있어요.",
      3: "예약자가 많다며 선입금을 재촉하는 순간은 강한 경고 신호예요. 만나 보거나 안전한 결제 방식 없이 돈부터 보내면 위험해요.",
      4: "입금 후 답장이 늦어지거나 판매자가 사라지면 피해가 발생했을 수 있어요. 대화 내용과 송금 내역을 캡처해두고 신고 방법을 확인해야 해요.",
    },
    strongestWarningCut: 3,
    strongestWarningReason:
      "중고거래에서는 직거래를 피한 상태에서 예약자나 선점 압박을 이유로 선입금을 요구할 때 특히 조심해야 해요.",
    conversationExample: [
      { speaker: "seller", text: "아직 거래 가능해요. 그런데 문의가 많아서요." },
      { speaker: "fox", text: "직거래로 볼 수 있을까요?" },
      { speaker: "seller", text: "직거래는 어렵고 택배만 가능해요." },
      { speaker: "fox", text: "그럼 물건 확인은 어떻게 하나요?" },
      {
        speaker: "seller",
        text: "예약하려면 먼저 입금해주세요. 입금 확인되면 바로 보내드릴게요.",
      },
    ],
    warningSignals: [
      "시세보다 지나치게 저렴해요.",
      "직거래를 피하고 택배만 가능하다고 해요.",
      "예약자가 많다며 서두르게 해요.",
      "선입금을 먼저 요구해요.",
    ],
    talkToTrustedPerson:
      "중고거래 물건이 너무 싼데, 직거래는 안 되고 선입금부터 하래. 이거 괜찮아 보여?",
    finalPauseMessage: SHARED_FINAL_PAUSE_MESSAGE,
  },
] satisfies readonly ScamEpisode[];
