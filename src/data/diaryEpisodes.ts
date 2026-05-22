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

/** 채팅 예시 말풍선(상대 / 여우). */
export type DiaryChatTurn = {
  speaker: "stranger" | "fox";
  text: string;
};

/** 결과 카드 「내가 고른 순간」 — 컷별 한 줄 */
export type DiaryResultMomentByCut = readonly [string, string, string, string];

/** 결과 카드 「왜 문제인가」 — 1~2문장만 */
export type DiaryWhyProblem = readonly [string] | readonly [string, string];

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
  resultMomentOneLineByCut: DiaryResultMomentByCut;
  whyProblem: DiaryWhyProblem;
  checklist: readonly string[];
  /** 하단 문구 */
  closingMessage: string;
  comicImages?: readonly [string, string, string, string];
  chatExample: readonly DiaryChatTurn[];
  peerTalkLine: string;
};

export const MVP_CLOSING_LINE = "한 박자 쉬어도 늦지 않아요.";

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
    shortIntro: "등기 문자, 진짜 법원일까요?",
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
    question: "먼저 멈추고 싶은 컷을 골라 보세요.",
    quizStripHint: "흐름 읽으며, 걸리는 컷부터 골라요.",
    noSingleCorrectAnswer: true,
    resultMomentOneLineByCut: [
      "법원 등기 안내처럼 문자로 첫 연락하고 안내 페이지 열라 했어요.",
      "집 시간을 묻고 곧바로 보안 프로그램 설치와 링크로 ‘지금’ 접속만 요구했어요.",
      "링크 안에서 주민등록번호 뒷자리를 입력하라 했어요.",
      "오늘 안 접속하면 지연 비용 안내 문자가 나간다 했어요.",
    ],
    whyProblem: [
      "공공기관은 문자 링크로 주민번호 같은 개인정보를 요구하지 않아요.",
      "이럴 땐 멈추고, 홈페이지나 대표번호로 직접 확인해야 해요.",
    ],
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      {
        speaker: "stranger",
        text: "등기 때문에 문자에 있는 페이지부터 열어 확인해 주세요. 오늘이 중요해요.",
      },
      { speaker: "fox", text: "문자 링크는 안 누를게요. 검색해서 법원 대표번호로 먼저 물어볼게요." },
      {
        speaker: "stranger",
        text: "지금 안 보면 처리 밀리고 지연 안내 나갈 수 있다 문자에도 있어요.",
      },
      { speaker: "fox", text: "그래도 문자 말만 보고 링크 따라가진 않을게요." },
    ],
    peerTalkLine: "법원 문자에 링크가 있는데, 같이 검색해서 대표번호 맞는지 봐줄래?",
  },
  {
    id: "cheap-ticket-deal",
    shortIntro: "싼 티켓, 안전하게 올까요?",
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
    question: "먼저 멈추고 싶은 컷을 골라 보세요.",
    quizStripHint: "흐름 읽으며, 걸리는 컷부터 골라요.",
    noSingleCorrectAnswer: true,
    resultMomentOneLineByCut: [
      "정가보다 훨씬 싼 티켓 양도를 채팅으로 제안했어요.",
      "입금 후 발송 과정만 문자로 알려 줄 거라 했어요.",
      "이미 받은 금 다음에 이름 불일치라며 같은 금액 재입금을 요구했어요.",
      "메시지에 답 없고 연락이 끊겼어요.",
    ],
    whyProblem: [
      "이미 보냈는데 같은 금액이나 추가 금액을 또 보내라 하면 사기 가능성이 매우 높아요.",
      "환불·처리 명목 재송금이면 입금하면 안 되고 문자·내역부터 보관하세요.",
    ],
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      { speaker: "stranger", text: "입금 확인했어요. 순서대로 발송 문자 드릴게요." },
      { speaker: "fox", text: "발송 일자 문자로 한 줄만 적어 줄 수 있어요?" },
      { speaker: "stranger", text: "로그 불일치라 같은 금 한 번 더 넣어야 처리돼요. 지금만 가능해요." },
      {
        speaker: "fox",
        text: "첫 입금 처리 설명 없이 같은 금만 요구해서 재입금 안 할게요. 기록 저장해 두었어요.",
      },
    ],
    peerTalkLine: "티켓 돈 넣었는데 같은 금 또 보내래. 문자 같이 봐 줄래?",
  },
  {
    id: "family-message-trap",
    shortIntro: "싼 가격 뒤, 선입금 루트를 볼까요?",
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
    question: "먼저 멈추고 싶은 컷을 골라 보세요.",
    quizStripHint: "흐름 읽으며, 걸리는 컷부터 골라요.",
    noSingleCorrectAnswer: true,
    resultMomentOneLineByCut: [
      "시세보다 훨씬 싼 중고 물건을 채팅으로 판매한다 했어요.",
      "직거래는 안 되고 택배 선입금만 된다 했어요.",
      "다른 구매 예약 때문에 지금 선입금하라 재촉했어요.",
      "선입금 뒤 읽음만 뜨고 답 없어요.",
    ],
    whyProblem: [
      "만나 보거나 안전 결제로 확인할 방법 없이 채팅 선입금만 반복하면 보통의 중고 거래 절차와 맞지 않아요.",
      "‘지금’만 반복될 때는 선입금을 멈추고 문자를 캡처해 신고 방법을 확인하세요.",
    ],
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      {
        speaker: "stranger",
        text: "선입금만 받아요. 오늘 넣어 주셔야 자리 유지 문자에 두었습니다.",
      },
      { speaker: "fox", text: "직거래 없이 사람도 못 보는데 선입금은 못 내요." },
      { speaker: "stranger", text: "지금 순서 놓치면 다른 분 줄 섭니다." },
      { speaker: "fox", text: "그럼 안 할게요. 채팅 캡처만 남길게요." },
    ],
    peerTalkLine: "직거래는 안 된대고 선입금만 재촉해. 문자 같이 좀 볼래?",
  },
] as const;
