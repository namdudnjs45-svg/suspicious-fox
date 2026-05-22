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

/** 결과 카드 「내가 고른 순간」 — 컷 0~3 각각 최대 3줄, `\n` 구분 */
export type DiaryResultPickMoments = readonly [string, string, string, string];

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
  /** 결과 카드 — 컷별 짧은 멘트(2~3문장 `\n`) */
  resultPickMomentByCut: DiaryResultPickMoments;
  /** 결과 카드 「왜 멈춰야」 — 최대 3줄 `\n` */
  resultWhyStopBrief: string;
  checklist: readonly string[];
  /** 하단 1줄 — 화면에 한 번만 */
  closingMessage: string;
  comicImages?: readonly [string, string, string, string];
  chatExample: readonly DiaryChatTurn[];
  /** 기본 전체 노출 · 모두 짧게 유지 */
  chatVisibleTurns?: number;
  /** 「가까운 사람에게…」 짧은 인용(줄바꿈 `\n` 가능) */
  peerTalkPrompt: string;
};

export const MVP_CLOSING_LINE =
  "한 박자 쉬어도,\n늦지 않아요.";

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
    resultPickMomentByCut: [
      "등기 얘기 문자로,\n연락이 먼저 왔어요.\n숨 고를 순간이에요.",
      "링크로 확인하라는,\n말이 바로 나왔어요.\n‘지금’에 손이 갔어요.",
      "번호 뒷자리까지,\n링크에서 넣게 했어요.\n문자만으로는 의심스러워요.",
      "오늘 안에라며,\n과태료를 말했어요.\n재촉이 한꺼번에 왔어요.",
    ],
    resultWhyStopBrief:
      "진짜 기관도 문자 링크만으로,\n개인정보를 요구하진 않아요.\n압박이 세면 공식번호를 찾아요.",
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      { speaker: "stranger", text: "OO법원 안내 문자\n링크 확인 부탁" },
      { speaker: "fox", text: "공식 사이트에서도\n조회 가능한가요?" },
      { speaker: "stranger", text: "지금 접속이 필요합니다" },
      { speaker: "fox", text: "제가 번호 찾아서\n직접 전화할게요" },
    ],
    peerTalkPrompt:
      "법원이라는 문자가 왔는데,\n링크부터 보래.\n진짠지 같이 봐 줄래?",
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
    resultPickMomentByCut: [
      "싼 매물에 마음이 가서,\n연락이 빨라졌어요.\n여기서 숨 고를 수 있어요.",
      "한 번 입금까진,\n했다는 줄이에요.\n이상한 문자가 이어질 수 있어요.",
      "이미 보냈는데도,\n같은 금을 또 보내래요.\n두 번째 요구가 핵심이에요.",
      "답이 없고 차단이면,\n추가 입금은 피했어요.\n더 키우지 않는 거예요.",
    ],
    resultWhyStopBrief:
      "진짜 거래는,\n같은 돈을 두 번,\n먼저 보내라 하진 않아요.\n돌려받음은 절차로 알려줘요.",
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      { speaker: "stranger", text: "송금자명이\n불일치래요" },
      { speaker: "fox", text: "이름 맞게\n넣었는데요?" },
      { speaker: "stranger", text: "같은 금 재입금\n첫 건은 후처리예요" },
      { speaker: "fox", text: "먼저 보낸 돈부터\n돌려줘요" },
    ],
    peerTalkPrompt:
      "티켓인데 이름 틀렸대요.\n두 번 더 보내래요.\n이거 같이 봐줄래요?",
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
    resultPickMomentByCut: [
      "싼 가격에 마음 가서,\n문의부터 빠졌어요.\n처음 줄에서도 숨 고를 만해요.",
      "직거래는 안 된다던데,\n택배만 말했어요.\n만나 보는 게 먼저예요.",
      "다른 분 있다며,\n오늘 입금 재촉했어요.\n보내기 전이 제일 소중해요.",
      "입금 뒤 읽음만 뜨고,\n연락이 끊겼어요.\n더 보냈는지부터가 차이예요.",
    ],
    resultWhyStopBrief:
      "사람과 물건,\n직접 못 보면 의심해도 돼요.\n선금만 재촉하면 패턴과 겹쳐요.",
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      { speaker: "stranger", text: "택배만 돼요\n선입금 후 출고예요" },
      { speaker: "fox", text: "한번 보면\n안 될까요?" },
      { speaker: "stranger", text: "다른 분 대기\n오늘 입금 필요" },
      { speaker: "fox", text: "못 봤는데\n먼저 못 보내요" },
    ],
    peerTalkPrompt:
      "중고 샀는데 만나 보기 전에,\n선금부터 재촉해요.\n이상한 거 같아?",
  },
] as const;
