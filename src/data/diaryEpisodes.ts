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

/** 결과 카드 본문: 핵심 한 줄과 보충 1~2문장으로 구성합니다. */
export type ResultEducationBlock = {
  keyLine: string;
  subLines: readonly string[];
};

/** 결과 카드 「내가 고른 순간」 — 컷별 블록 4개 */
export type DiaryResultPickMoments = readonly [
  ResultEducationBlock,
  ResultEducationBlock,
  ResultEducationBlock,
  ResultEducationBlock,
];

/** 「가까운 사람에게 말해보기」 예시 문장 한두 줄 */
export type PeerTalkLines = readonly [string] | readonly [string, string];

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
  resultPickMomentByCut: DiaryResultPickMoments;
  resultWhyStopBrief: ResultEducationBlock;
  checklist: readonly string[];
  /** 하단 문구 */
  closingMessage: string;
  comicImages?: readonly [string, string, string, string];
  chatExample: readonly DiaryChatTurn[];
  peerTalkLines: PeerTalkLines;
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
    resultPickMomentByCut: [
      {
        keyLine:
          "1컷을 골랐어요. 기관이라고만 밝히고 등기 때문에 확인해야 한다지만, 무슨 사건인지·어디에서 확인해야 하는지는 말하지 않아 찜찜했습니다.",
        subLines: ["문자 안내만 따라 접속 순서부터 잡기 전에 호흡을 늘리고 싶었어요."],
      },
      {
        keyLine:
          "2컷을 골랐어요. 일정을 묻더니 바로 프로그램 설치부터 말했고 ‘지금’이 반복돼 손가락부터 가게 하는 느낌이었습니다.",
        subLines: ["자세히 설명해 주기보다 링크·실행 순서부터 밀어붙일 때 속도 줄이려는 선택이 들었어요."],
      },
      {
        keyLine:
          "3컷을 골랐어요. 링크 안에서 주민번호 뒷자리처럼 민감한 정보까지 바로 받겠다는 말이 나와 무서웠습니다.",
        subLines: ["채팅 몇 줄로 즉석 입력을 재촉할 때는 순서부터 바꾸고 싶었어요."],
      },
      {
        keyLine:
          "4컷을 골랐어요. 마감·재발송·과태료 말까지 겹쳐 속도 몰이처럼 느껴졌습니다.",
        subLines: ["그래도 문자 안 링크 대신 검색해서 직접 찾아본 번호부터 같은 내용인지 확인하고 싶었어요."],
      },
    ],
    resultWhyStopBrief: {
      keyLine:
        "기관이라고 들려도 문자만 보고 접속 순서부터 몰이거나 접속처를 분명히 남기지 않을 때는 잠깐 멈춰도 됩니다.",
      subLines: [
        "말이 급하게만 이어지면 접속 압박에서 거리를 두는 게 자연스러워요.",
        "링크는 따로 두고 공식 번호부터 같은 내용인지 확인한 뒤 움직이면 마음이 덜 들뜹니다.",
      ],
    },
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      {
        speaker: "stranger",
        text:
          "서울중앙지방법원이라고 문자도 함께 보냈어요. 등기 쪽이라 확인 차 연락드린 거고, 안내 문자에 간단 페이지도 같이 넣어뒀습니다.",
      },
      {
        speaker: "fox",
        text:
          "잠깐만요, 어떤 등기예요? 제 접수 이름이 왜 문자에 찍혀 있는 건지랑 무슨 문건인지, 지금 목소리로 한 줄만이라도 더 말해 주실 수 있을까요? 헷갈려요.",
      },
      {
        speaker: "stranger",
        text:
          "자세한 건 페이지 들어가면 순서대로 나오고 오늘 안에 접속 안 하면 처리 시간이 밀린다 문자에도 들어 있어요. 지금이라도 들어오시는 게 빠릅니다.",
      },
      {
        speaker: "fox",
        text:
          "문자에 있는 링크는 안 누를래요. 제가 검색해서 법원 번호부터 찾고, 같은 안내 직통으로 들을 수 있는지부터 확인해볼게요.",
      },
      {
        speaker: "stranger",
        text:
          "접수 창구가 문자 링크로만 된다 문자에도 따라붙어 있거든요. 나중에는 지연 문자가 재발송될 수 있다도 적혀 있어요.",
      },
      {
        speaker: "fox",
        text:
          "과태료 말이 문자에 있다 해도 지금이라는 재촉만으로 따라가진 않을 것 같아요. 문자 스샷은 그대로 두고 공식 창구 확인부터 할게요.",
      },
    ],
    peerTalkLines: [
      "나 법원이라는 문자 받았거든… 링크부터 누르래. 지금이라는 말이 몇 번이나 따라붙었어?",
      "문자 내용 이대로 보여 줄 테니 검색해서 전화 순서부터 같이 짚어볼 시간 있어?",
    ],
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
      {
        keyLine:
          "1컷을 골랐어요. 값 차가 크게 나서 속도부터 나가기 쉽지만 채팅 한두 번으로 거래 확정까지 가긴 무섭다고 느꼈습니다.",
        subLines: ["저렴한 줄만 보고 따라가기 전 조건 짚어보려는 순간이라서요."],
      },
      {
        keyLine:
          "2컷을 골랐어요. 입금 한 번이면 될 것처럼 말했지만 문자 톤이 바뀔 여지도 있다고 생각했습니다.",
        subLines: ["발송이라는 말만으로 안전을 확인하기 어렵다고 느껴져 멈춰본 거예요."],
      },
      {
        keyLine:
          "3컷을 골랐어요. 이름 맞춰 보냈는데 같은 금액을 또 넣으라 했고, 첫 입금 환불 순서가 말로 안 잡혔습니다.",
        subLines: ["추가 이체를 말만 재촉하면 패턴처럼 느껴져 따라가긴 무서웠어요."],
      },
      {
        keyLine:
          "4컷을 골랐어요. 답이 안 오고 차단까지 됐다면 마음이 무겁지만 같은 말에 한 번 더 안 보냈다면 줄인 범위가 있다고 보였습니다.",
        subLines: ["문자를 그대로 두고 주변·접수 쪽부터 같이 받아보고 싶었어요."],
      },
    ],
    resultWhyStopBrief: {
      keyLine:
        "이미 한 번 보냈는데 같은 금액 재입금만 말하고, 먼저 보낸 돈 처리가 문자에 안 남으면 매우 불안한 신호예요.",
      subLines: [
        "실제 절차면 언제 어떻게 정리되는 말이 따라붙는 경우가 많아요.",
        "같은 문장만 되풀이면 주변 사람이나 피해 접수 창구에 그대로 물어봐도 늦지 않아요.",
      ],
    },
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      {
        speaker: "stranger",
        text:
          "입금 확인됐어요. 순차 발송이라 조금 기다려 주시면 진행해서 문자로 알려드릴게요.",
      },
      {
        speaker: "fox",
        text:
          "네 고마워요. 제가 이름도 맞춰 보냈고 캡처도 줬는데요, 대략 발송이 며칠쯤이라도 문자로 한 줄만 남겨 주실 수 있나요?",
      },
      {
        speaker: "stranger",
        text:
          "시스템 로그에 송금자명 불일치로 잡혔어요. 같은 금액 한 번만 더 넣어 주셔야 처리 시작되고, 문자에도 재입금 후 정리된다 적혀 있거든요. 순서 밀리면 문자로 고지 나간다까지 적혀 있습니다.",
      },
      {
        speaker: "fox",
        text:
          "저 이름 맞게 보냈거든요… 그럼 첫 입금은 언제·어떻게 돌려준다는 문자부터 남겨 주실 수 있나요? 그 부분이 안 보이면 많이 무서워서요.",
      },
      {
        speaker: "stranger",
        text:
          "재입금 말고는 창이 안 열린다구요. 지금 안 넣으면 순서에서 빠지고 저희도 책임 못 진다 문자에도 동의하셨다는 식으로 적혀 있어요.",
      },
      {
        speaker: "fox",
        text:
          "그럼 두 번째 입금은 못 하겠어요. 시간 말은 이해도 잘못 보내는 게 더 무서워서 문자랑 기록은 다 저장해 두고 집사람이랑 같이 보고 접수하는 쪽부터 알아볼게요.",
      },
    ],
    peerTalkLines: [
      "티켓도 아직인데 송금자명 불일치래, 같은 돈 또 넣으래. 이름 맞췄다고 말했는데 같은 말만 반복돼.",
      "문자 그대로 들고 갈 테니 주말에 같이 읽으면서 이상한 줄만 표시해 줄 수 있어?",
    ],
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
      {
        keyLine:
          "1컷을 골랐어요. 싼 가격에 손이 먼저 갈 수 있는 컷이라 채팅 속도부터 늦추고 싶었습니다.",
        subLines: ["판매자가 사람·물건을 어떻게 보여 줄지 짚기 전에 넘기긴 무섭다고 느꼈어요."],
      },
      {
        keyLine:
          "2컷을 골랐어요. 직거래는 어렵다며 택배 선입금만 말하면 만나 확인할 길을 줄이는 느낌이었습니다.",
        subLines: ["안전하게 결제할 방법이 있는지 먼저 묻고 싶은 순간이라서요."],
      },
      {
        keyLine:
          "3컷을 골랐어요. 다른 구매자가 있다며 지금 입금만 반복되면 조건이 무섭게 느껴졌습니다.",
        subLines: ["보내기 전 주변 의견부터 듣고 싶다는 선택이 자연스럽다고 느꼈어요."],
      },
      {
        keyLine:
          "4컷을 골랐어요. 입금 뒤 읽음만 뜨고 답이 없으면 마음이 무겁지만 같은 말에 또 보내진 않았다면 범위를 줄였다고 보였습니다.",
        subLines: ["기록을 그대로 두고 도움받을 사람부터 찾고 싶었어요."],
      },
    ],
    resultWhyStopBrief: {
      keyLine:
        "만나 보거나 플랫폼 안전 결제로 확인할 여지가 있는데 채팅만으로 선입금부터 몰면 불안해지기 쉽습니다.",
      subLines: [
        "‘지금 안 보내면 끝’ 말이 반복될수록 잠깐 멈춰도 된다고 생각해도 괜찮아요.",
        "문자를 그대로 두고 주변에 보여주면 말 순서부터 정리되기도 해요.",
      ],
    },
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      {
        speaker: "stranger",
        text:
          "노트북 문의 주셔서요. 저는 택배만 가능해서 선입금 들어오면 출고 순서부터 잡아둘 수 있거든요, 당일 출고 문자에도 간단히 적어뒀어요.",
      },
      {
        speaker: "fox",
        text:
          "네… 그런데 사진 외에도 근처에서 상태만 함께 볼 시간은 없으실까요? 집에서 보는 게 더 편해서요.",
      },
      {
        speaker: "stranger",
        text:
          "직거래는 저희 쪽에서는 안 된다 공지에 들어 있습니다. 같은 물건 문의가 계속 와서 지금 순서 놓치면 시간 맞춰 드리기 어렵다 문자에도 두었거든요, 오늘 선입금이면 순서부터 붙입니다.",
      },
      {
        speaker: "fox",
        text:
          "사람 안 보인 채 계좌만 바로 받는 건 솔직히 무서운데요, 플랫폼 안전 결제 같은 걸로 잡아볼 순 없나요?",
      },
      {
        speaker: "stranger",
        text:
          "전화번호는 공유가 안 되는 구조라 구두로는 더 못 드려요. 입금이 먼저 들어와야 다음 단계 열린다 문자에도 적혀 있으니 지금 결정을 부탁드려요.",
      },
      {
        speaker: "fox",
        text:
          "그럼 선입금은 못 하겠어요. 문자 흐름은 스샷 남겨 두고 우리 신랑이랑 같이 읽어보고, 앱 도움말이랑 제보 양식도 찾아보려고요.",
      },
    ],
    peerTalkLines: [
      "중고인데 직거래는 무조건 안 된대, 선입금만 재촉해. ‘지금 다른 분’ 말만 몇 번이나 따라붙었어.",
      "문자는 저장만 해뒀는데, 시간 날 때 같이 읽으면서 이상한 줄만 짚어 줄 수 있어?",
    ],
  },
] as const;
