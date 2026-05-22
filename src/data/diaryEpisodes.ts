/**
 * MVP 4컷 만화 에피소드(상황 3종) — 퀴즈 정답이 아니라 ‘멈출 수 있는 지점’ 학습형.
 */

export type DiaryComicSceneType =
  | "phone"
  | "link"
  | "privateInfo"
  | "pressure"
  | "transfer"
  | "noReply"
  | "warning";

export type DiaryComicPanel = {
  imageKey: string;
  sceneType: DiaryComicSceneType;
  /** 사진형 4컷: 컷별 PNG(public 기준 슬래시 경로). 없으면 `episode.comicImages` 순서 사용 */
  imageSrc?: string;
  /** 컷 카드 안 긴 안내(폴백 만화 패널) */
  caption: string;
  /** 상세 그리드 각 컷 하단 한 줄 요약 */
  stripSummary: string;
  foxLine: string;
  messageText: string;
  signalHint: string;
};

/** 「흐름 다시 보기」 펼침용 짧은 불릿 묶음 */
export type DiaryConversationFlowBundle = {
  titles?: Partial<Record<"call" | "sms" | "psych", string>>;
  callLikeBullets: readonly string[];
  smsBullets: readonly string[];
  psychBullets: readonly string[];
};

/** 채팅 예시 말풍선(상대 / 여우). */
export type DiaryChatTurn = {
  speaker: "stranger" | "fox";
  text: string;
};

export type DiaryEpisode = {
  id: string;
  shortIntro: string;
  categoryLabel: string;
  title: string;
  subtitle: string;
  panels: readonly [DiaryComicPanel, DiaryComicPanel, DiaryComicPanel, DiaryComicPanel];
  /** 컷 고르기 질문 — 정답 톤 피함 */
  question: string;
  /** 컷 읽기 힌트(선택·기본값은 컴포넌트) */
  quizStripHint?: string;
  /** 단일 정답 모드 비활성화(항상 학습형) */
  noSingleCorrectAnswer: true;
  /** 0~3 · 만화 중 ‘특히 강한 경고’에 해당하는 컷. null 가능 */
  strongestWarningCut: number | null;
  /** 「특히 강한 경고 신호」 블록 (짧게) */
  strongestWarningReason: string;
  /** 고른 컷(0~3)별 피드백 */
  selectedCutFeedback: readonly [string, string, string, string];
  /** 상단 요약 본문 (문단은 \n\n 구분; 공감 첫 줄은 화면에서 공통 제공) */
  explainSummary: string;
  /** 「이 대화가 수상한 이유」 */
  suspiciousWhy: string;
  /** 「여기서 멈춰야 할 신호」 — 굵게·짧게 */
  stopSignalsHighlight: string;
  checklist: readonly string[];
  /** 하단 1줄 — 화면에 한 번만 */
  closingMessage: string;
  comicImages?: readonly [string, string, string, string];
  chatExample: readonly DiaryChatTurn[];
  /** 기본 전체 노출 · 모두 짧게 유지 */
  chatVisibleTurns?: number;
  /** 「가까운 사람에게…」 에 넣을 짧은 인용 예시 한 덩어리 */
  peerTalkPrompt: string;
  conversationFlowInsight: DiaryConversationFlowBundle;
};

export const MVP_CLOSING_LINE =
  "잠시 멈춰보세요. 차분히 생각해도 늦지 않습니다.";

export const DIARY_COMIC_IMAGE_MAP: Readonly<Record<string, string>> = {};

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

/** 쉼표·마침표 뒤에 우선 줄바꿈이 일어나도록 ZWSP 를 넣습니다(한국어 단어 한가운데 잘림 완화). */
export function withPreferredLineBreaks(text: string): string {
  return text.replace(/([,，.。])\s*/g, "$1\u200b");
}

export function resolveDiaryComicPanelSrc(imageKey: string): string | null {
  const path = DIARY_COMIC_IMAGE_MAP[imageKey];
  if (!path) return null;
  return resolvePublicAssetUrl(path);
}

export function findDiaryEpisodeById(id: string): DiaryEpisode | undefined {
  return DIARY_EPISODES.find((e) => e.id === id);
}

export const DIARY_EPISODES: readonly DiaryEpisode[] = [
  {
    id: "court-registry-call",
    shortIntro: "등기가 온 것처럼 말했지만, 진짜 법원일까?",
    categoryLabel: "기관처럼 느껴진 전화·문자",
    title: "법원 전화를 받은 여우",
    subtitle: "어떻게 멈춰야 할까요?",
    comicImages: [
      scenarioComicImg("court-v2-01.png"),
      scenarioComicImg("court-v2-02.png"),
      scenarioComicImg("court-v2-03.png"),
      scenarioComicImg("court-v2-04.png"),
    ] as const,
    panels: [
      {
        imageKey: "court-panel-01",
        imageSrc: scenarioComicImg("court-v2-01.png"),
        sceneType: "phone",
        caption: "발신처를 기관이라고만 밝히며 붙잡는 첫 줄.",
        stripSummary: "법원에서 등기를 보낸다고 해요.",
        foxLine: "법원에서…? 문자로 접수 이름이 적혀 있었어.",
        messageText:
          "[서울중앙지방법원] 등기 접수 진행 필요. 아래 문자를 확인 후 안내 페이지를 열어 주세요.",
        signalHint: "갑자기 접수처럼 말하지만 검증 채널 설명 없이 안내 문자만 던진 흐름이에요.",
      },
      {
        imageKey: "court-panel-02",
        imageSrc: scenarioComicImg("court-v2-02.png"),
        sceneType: "link",
        caption: "공식이라는 말과 함께 인터넷 링크 접속부터 시키는 줄.",
        stripSummary: "집에 있는 시간을 물어봐요.",
        foxLine: "바로 접속이라고만 말해서 손가락만 가게 만드네.",
        messageText:
          '보안 프로그램을 설치·실행해야 조회 가능합니다. "지금" 버튼을 눌러 진행 부탁드립니다.',
        signalHint:
          "‘지금’ ‘즉시’만 반복되는 말과 함께 링크·프로그램부터 밀어붙이면 잠깐 멈춰도 좋아요.",
      },
      {
        imageKey: "court-panel-03",
        imageSrc: scenarioComicImg("court-v2-03.png"),
        sceneType: "privateInfo",
        caption: "본인 정보를 입력 또는 제출하게 만드는 단계.",
        stripSummary: "온라인 수령 링크를 보내요.",
        foxLine: "주민번호 뒷자리까지 문자로 받겠대.",
        messageText: '확인을 위해 접수 페이지에서 주민등록번호 뒷자리를 입력 후 "발송해 주세요."',
        signalHint: "기관이라도 문자·링크만으로 요구하는 정보는 신중히 보는 순간일 수 있어요.",
      },
      {
        imageKey: "court-panel-04",
        imageSrc: scenarioComicImg("court-v2-04.png"),
        sceneType: "pressure",
        caption: "시한과 불이익으로 속도부터 내게 만드는 줄.",
        stripSummary: "개인정보 입력을 유도해요.",
        foxLine: "오늘 중에 처리 아니면 지연 과태료라네…?",
        messageText:
          '오늘 18시 이전 접속이 필요합니다. 시간 경과 시 "지연 비용 발생" 문자가 재발송됩니다.',
        signalHint:
          "‘불이익’ ‘과태료’를 겹치며 오늘 안에 처리하도록 몰아가면 일단 속도 줄이고 공식 채널을 떠올려볼 순간일 수 있어요.",
      },
    ],
    question: "어느 장면부터 가장 먼저 멈춰보고 싶었나요?",
    quizStripHint:
      "만화 흐름을 읽으며, 마음이 먼저 걸리는 컷을 골라도 괜찮아요.",
    noSingleCorrectAnswer: true,
    strongestWarningCut: 1,
    strongestWarningReason:
      "기관을 사칭해도 ‘지금 링크만’ ‘오늘 안에만’으로 몰아가면 위험이 커질 수 있어요. 낯선 링크는 바로 열지 않고, 직접 찾은 공식 연락처로 한 번만 확인해 보는 편이 좋아요.",
    selectedCutFeedback: [
      "첫 연락만으로도 기관 이름이 맞는지 의심해 볼 수 있어요. 여기서도 멈출 수 있어요.",
      "일정을 묻고 곧바로 링크로 끌고 갈 때는 숨을 고르기 좋아요. 여기서도 멈출 수 있어요.",
      "민감한 정보를 링크·문자로 넘기라고 하면 한 박자 쉬어도 괜찮아요. 여기서도 멈출 수 있어요.",
      "시한·과태료로 압박할수록 공식 경로를 따로 찾아볼 여지가 생겨요. 여기서도 멈출 수 있어요.",
    ],
    explainSummary:
      "어느 컷에서든 ‘뭔가 이상한데’가 느껴질 수 있어요.\n\n이 흐름에서는 링크로 끌고 가고 ‘오늘 안에’를 겹칠수록 위험이 커지기 쉬워요.",
    suspiciousWhy:
      "진짜 기관 연락이라도 보통은 낯선 링크만으로 민감 정보를 요구하지 않아요. 전화·문자가 급하게 압박할수록 잠깐 끊고 직접 검색한 안내를 보는 편이 안전해요.",
    stopSignalsHighlight:
      "링크로만 확인하라고 하거나, 오늘 안 처리 시 불이익을 겹쳐 말하면 먼저 멈춰보세요.",
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      { speaker: "stranger", text: "OO법원입니다. 등기 확인 때문에 연락드렸습니다." },
      { speaker: "fox", text: "공식 사이트에서도 볼 수 있나요?" },
      {
        speaker: "stranger",
        text: "지금은 이 링크로만 확인 가능합니다. 오늘 안에 접속해 주세요.",
      },
      { speaker: "fox", text: "잠깐요. 번호랑 링크는 제가 찾은 공식 연락처로 다시 확인할게요." },
    ],
    peerTalkPrompt:
      "“법원에서 왔다는데 링크로만 확인하래. 이거 진짜인지 같이 봐줄 수 있어?”",
    conversationFlowInsight: {
      callLikeBullets: [
        "법원·등기처럼 이름을 맞춰 먼저 연락할 수 있어요.",
        "내 일정을 물으며 대화를 이어 갈 수 있어요.",
      ],
      smsBullets: ["링크·프로그램 안내 문자가 바로 붙을 수 있어요.", "‘오늘 안에’처럼 시간을 몰아세울 수 있어요."],
      psychBullets: [
        "기관 이름 때문에 잠깐 믿게 될 수 있어요.",
        "급하게 느껴질 때 한 박자 쉬면 흐름이 달라질 수 있어요.",
      ],
    },
  },
  {
    id: "cheap-ticket-deal",
    shortIntro: "저렴한 티켓이 과연 안전하게 넘어올까요?",
    categoryLabel: "티켓·당첨 류 문자",
    title: "티켓을 싸게 산 여우",
    subtitle: "어떻게 멈춰야 할까요?",
    comicImages: [
      scenarioComicImg("ticket-01.png"),
      scenarioComicImg("ticket-02.png"),
      scenarioComicImg("ticket-03.png"),
      scenarioComicImg("ticket-04.png"),
    ] as const,
    panels: [
      {
        imageKey: "gift-panel-01",
        sceneType: "phone",
        caption: "다른 채널에서 좋은 좌석 값에 매물을 발견한 장면.",
        stripSummary: "좋은 자리와 저렴한 티켓을 발견했어요.",
        foxLine: "정가보다 너무 싸긴 한데… 일단 채팅으로 물어볼까.",
        messageText:
          "[티켓양도] A구역 무지개석 잔여. 연락 주시면 계좌 안내 예정.",
        signalHint: "격차 큰 매물이라도 채팅 한두 번으로 속도부터 내게 되면 호흡을 늦춰 보기 좋아요.",
      },
      {
        imageKey: "gift-panel-02",
        sceneType: "transfer",
        caption: "판매자가 알려 준 계좌로 입금까지 마친 뒤.",
        stripSummary: "판매자에게 돈을 송금했어요.",
        foxLine: "계좌로 보냈어, 캡처도 넘겼고.",
        messageText:
          '[판매자] 입금 확인했어요. 순차 발송 중이라 문자로만 진행 상태 알려 드릴게요.',
        signalHint:
          "한 번 보냈다고 모든 절차가 안전하게 끝난 건 아닐 수 있어요.",
      },
      {
        imageKey: "gift-panel-03",
        sceneType: "pressure",
        caption: "가짜 규정처럼 이유를 붙여 추가 송금을 요구하는 줄.",
        stripSummary: "송금자명이 틀렸다며 다시 보내라고 해요.",
        foxLine: "내 이름 분명히 맞췄는데 또 보라고…?",
        messageText:
          '[판매자] 시스템상 송금자명 불일치입니다. 같은 금액 재입금 후 이전 금은 자동 취소됩니다.',
        signalHint:
          "두 번째 이체를 요구하는 순간이라면 접속부터 잠깐 멈춰 확인하면 좋아요.",
      },
      {
        imageKey: "gift-panel-04",
        sceneType: "warning",
        caption: "연결이 끊기거나 말이 계속 미뤄져 피해가 드러난 뒤.",
        stripSummary: "결국 돈을 잃고 티켓도 받지 못했어요.",
        foxLine: "답장이 안 오네… 채널 차단까지 됐어.",
        messageText: "(알림 없음)",
        signalHint:
          "이미 손해가 났다고 느껴도, 새 이체라도 막았다면 이후 회복 가능성만큼이라도 줄일 수 있어요.",
      },
    ],
    question: "어느 장면부터 가장 먼저 멈춰보고 싶었나요?",
    quizStripHint:
      "만화 흐름을 읽으며, 마음이 먼저 걸리는 컷을 골라도 괜찮아요.",
    noSingleCorrectAnswer: true,
    strongestWarningCut: 2,
    strongestWarningReason:
      "어느 컷에서든 이상함을 느낄 수 있어요. 다만 이 사례에서는 ‘돈을 다시 보내라고 하는 순간’이 가장 강한 사기 신호에 가깝습니다.\n\n특히 이미 송금한 뒤 같은 금액을 또 보내라고 하면, 거의 반드시 멈춰야 해요.",
    selectedCutFeedback: [
      "싼 값에 마음이 끌려도 속도부터 내기 전에 호흡을 늦출 수 있어요. 여기서도 멈출 수 있어요.",
      "한 번 보냈다고 안심하지 않아도 괜찮아요. 이상한 안내가 이어지면 바로 확인해요. 여기서도 멈출 수 있어요.",
      "이미 입금했는데 같은 금액을 또 보내라 하면 추가 송금은 하지 않는 편이 좋아요. 여기서도 멈출 수 있어요.",
      "연락이 끊긴 뒤에도 추가로 보내지 않았다면 피해를 더 키우지 않을 수 있어요. 여기서도 멈출 수 있어요.",
    ],
    explainSummary:
      "이 사례는 처음부터 조금씩 수상했지만, 이미 돈을 보낸 뒤 다시 송금을 요구하는 순간은 특히 강한 사기 신호예요.\n\n‘송금자명 오류’, ‘재처리’, ‘같은 금액 다시 보내기’는 자주 쓰이는 방식이에요. 돈을 또 보내라고 하면 그 자리에서 멈추는 것이 맞아요.",
    suspiciousWhy:
      "실제 거래에서는 잘못 이체했다고 해도 정상적인 절차로 돌려받도록 안내하는 경우가 많아요. ‘같은 금액을 한 번 더 보내라’는 식으로 막 몰아가면 가짜 플로우일 가능성이 큽니다.",
    stopSignalsHighlight: "이미 돈을 보냈는데 다시 보내라고 하면 바로 멈춰야 해요.",
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      { speaker: "stranger", text: "송금자명이 잘못 들어갔어요." },
      {
        speaker: "stranger",
        text: "같은 금액 다시 보내주시면 기존 금액과 함께 처리해드릴게요.",
      },
      { speaker: "fox", text: "먼저 보낸 돈은 어떻게 되나요?" },
      { speaker: "stranger", text: "재입금 확인 후 같이 처리됩니다." },
    ],
    peerTalkPrompt: "티켓 샀는데 송금 오류라면서 돈을 다시 보내래. 이거 이상하지 않아?",
    conversationFlowInsight: {
      callLikeBullets: [
        "남들은 못 산 좌석이라며 가격부터 말 걸 때가 많아요.",
        "평소 안 쓰는 채팅 채널로만 접선하는 경우도 있어요.",
      ],
      smsBullets: [
        "계좌·금액을 한 번에 보냅니다.",
        "‘송금자명 불일치’처럼 같은 금액을 다시 요구할 수 있어요.",
      ],
      psychBullets: [
        "이미 한 번 보냈다면 다음 지시를 따르기 쉬워요.",
        "돈 되돌려준다는 말만 있고 처리가 안 보이면 속도 줄이면 좋아요.",
      ],
    },
  },
  {
    id: "family-message-trap",
    shortIntro: "싼 가격 뒤에 숨은 중고거래 선입금 루트를 알아볼까요?",
    categoryLabel: "중고거래·선입금 류",
    title: "싸게 올린 물건에 혹한 여우",
    subtitle: "어떻게 멈춰야 할까요?",
    comicImages: [
      scenarioComicImg("item-01.png"),
      scenarioComicImg("item-02.png"),
      scenarioComicImg("item-03.png"),
      scenarioComicImg("item-04.png"),
    ] as const,
    panels: [
      {
        imageKey: "fam-panel-01",
        sceneType: "phone",
        caption: "시세보다 훌씬 싼 매물 게시글을 발견한 순간입니다.",
        stripSummary: "저렴한 가격과 물건이 눈에 들어왔어요.",
        foxLine: "이 정도 상태면 더 비싸도 이상하지 않은데… 뭐지?",
        messageText:
          "[중고 채팅] 노트북 · 사용 6개월 · 정가 반값 이하 · 문의 많아 선착순",
        signalHint: "저렴한 가격 하나만 보고 속도부터 내게 되면, 숨 고를 틈이 줄어요.",
      },
      {
        imageKey: "fam-panel-02",
        sceneType: "phone",
        caption: "만나 보자 했더니 직거래는 어렵다며 택배만 허용한다 말합니다.",
        stripSummary: "직거래는 어렵다고 회피해요.",
        foxLine: "직거래 안 된다니… 진짜만 보려던 건데, 일단 문자로만?",
        messageText:
          '[판매자] 직거래 어렵고 택배만 가능합니다. 선입금 후 당일 출고합니다.',
        signalHint: "만나 확인할 방법을 줄이며 돈만 먼저 달라고 세우면 불안 신호예요.",
      },
      {
        imageKey: "fam-panel-03",
        sceneType: "pressure",
        caption: "다른 구매자가 있다며 지금 바로 입금하라 재촉하는 핵심 구간입니다.",
        stripSummary: "선입금을 재촉해요.",
        foxLine: "지금 안 보내면 줄 선 사람한테 간대… 과장인가 싶지만 찝찝해.",
        messageText:
          '[판매자] 다른 분 예약돼 있습니다. 빨리 입금해 주시면 붙여드릴게요.',
        signalHint:
          "‘다른 사람이 있다’로 몰아갈 때, 보내기 전 확인하는 순간이 가장 필요해요.",
      },
      {
        imageKey: "fam-panel-04",
        sceneType: "warning",
        caption: "입금 후 읽음만 되고 연락이 끊기거나 채널이 막히는 순간입니다.",
        stripSummary: "연락 두절이에요.",
        foxLine: "보냈는데 안 읽씹이네… 차단까지 됐어!",
        messageText: "[플랫폼 채팅] 읽음 확인됨 · 답장 없음",
        signalHint: "먼저 보냈던 돌려받기는 어려워져도, 여기서 또 보냈다면 피해는 더 커질 수 있어요.",
      },
    ],
    question: "어느 장면부터 가장 먼저 멈춰보고 싶었나요?",
    quizStripHint:
      "만화 흐름을 읽으며, 마음이 먼저 걸리는 컷을 골라도 괜찮아요.",
    noSingleCorrectAnswer: true,
    strongestWarningCut: 2,
    strongestWarningReason:
      "어느 컷에서든 찜찜함을 느낄 수 있어요. 이 흐름에서는 ‘사람·물건을 확인하기 전에 선입금을 재촉하는 순간’에 위험이 특히 커지기 쉬워요.",
    selectedCutFeedback: [
      "싼 가격만 보고도 한 박자 쉬어도 괜찮아요. 여기서도 멈출 수 있어요.",
      "직거래를 피하고 돈만 먼저 달라고 하면 의심해 볼 수 있어요. 여기서도 멈출 수 있어요.",
      "다른 구매자가 있다며 지금 보내라고 몰아가면 보내기 전에 멈춰도 늦지 않아요. 여기서도 멈출 수 있어요.",
      "이미 보낸 뒤라면 추가 송금은 막는 것부터가 줄일 수 있는 범위예요. 여기서도 멈출 수 있어요.",
    ],
    explainSummary:
      "어느 컷에서든 ‘너무 빠르다’는 느낌을 받을 수 있어요.\n\n직거래를 줄인 뒤 ‘다른 예약자’로 선금을 재촉하면, 확인 없이 따라가면 위험이 커져요.",
    suspiciousWhy:
      "통상 중고 거래에서는 만나거나 안전결제처럼 확인할 방법을 두는 편이 많아요. 연락만으로 선입금을 재촉하면 사기 패턴과 겹치기 쉽습니다.",
    stopSignalsHighlight: "사람도 물건도 못 확인했는데 선입금만 재촉하면 먼저 멈춰보세요.",
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      { speaker: "stranger", text: "직거래는 어렵고 택배만 돼요. 선입금해 주세요." },
      { speaker: "fox", text: "한번 만나서 보면 안 될까요?" },
      { speaker: "stranger", text: "다른 분 예약 걸려 있어요. 오늘 중 입금해 주세요." },
      { speaker: "fox", text: "사람 못 봤는데 먼저 보내기 어렵겠어요." },
    ],
    peerTalkPrompt:
      "“중고로 샀는데 직거래 피하고 선금만 재촉하는데, 이런 거 흔해? 이상하지 않아?”",
    conversationFlowInsight: {
      titles: {
        call: "거래 시작",
        sms: "채팅·송금",
        psych: "마음이 끌릴 때",
      },
      callLikeBullets: [
        "시세보다 싼 가격으로 시선을 끌 때가 많아요.",
        "채팅만 반복하기도 해요.",
      ],
      smsBullets: [
        "직거래는 어렵다며 택배·선입금부터 말할 수 있어요.",
        "다른 예약자로 지금 입금하게 몰아갈 때가 많아요.",
      ],
      psychBullets: [
        "좋은 조건을 놓칠까 봐 속도부터 내기 쉬워요.",
        "재촉이 크면 한 번 숨 고르도록 해도 충분해요.",
      ],
    },
  },
] as const;
