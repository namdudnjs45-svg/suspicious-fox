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
          "1컷에서는 법원 등기 문자처럼 보이는 첫 안내와 ‘안내 페이지 열기’ 요청만 이어져 있어요.",
        subLines: [
          "사건명이나 접수번호, 공식 창구 설명 없이 문자 링크만 따라가도록 몰려가면 거기부터 멈춰 보려 선택할 수 있어요.",
        ],
      },
      {
        keyLine:
          "2컷에서는 집에 있는지 물은 뒤, 프로그램 설치·실행과 ‘지금’ 버튼을 곧바로 요구하는 흐름이 나와요.",
        subLines: [
          "설명보다 접속 순서부터 밀어붙이므로 링크·실행은 하지 않고 공식 채널을 떠올려 보려는 지점으로 짚어 볼 수 있어요.",
        ],
      },
      {
        keyLine:
          "3컷에서는 링크를 연 접수 페이지 안에서 주민등록번호 뒷자리 입력·발송을 요구해요.",
        subLines: [
          "안내 문자를 넘어 민감정보를 바로 채워 넣게 만드는 단계로 보면 됩니다.",
        ],
      },
      {
        keyLine:
          "4컷에서는 오늘 안 접속 시 지연 비용·재발송 문자 같은 시한·불이익 문구가 함께 붙어 있어요.",
        subLines: [
          "압박 문구 때문에 확인 절차를 건너뛰지 않도록 주의하는 구간으로 볼 수 있어요.",
        ],
      },
    ],
    resultWhyStopBrief: {
      keyLine:
        "공공기관은 문자 속 링크로 주민번호나 계좌정보를 입력받지 않고, 문자 한 통만으로 민감정보 제출을 끝내지 않습니다.",
      subLines: [
        "등기 안내처럼 보여도 문자에 적힌 번호·링크를 그대로 믿기보다 직접 검색한 법원·행정청 홈페이지의 대표번호로 같은 내용인지 확인하는 것이 좋아요.",
        "즉시 접속·프로그램 설치가 겹치면 링크는 열지 말고, 공식 창구에서 안내받을 수 있는지 먼저 확인하세요.",
      ],
    },
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      {
        speaker: "stranger",
        text:
          "서울중앙지방법원 쪽 등기 안내입니다. 문자에 들어 있는 페이지를 지금 열어 확인해 주세요. 오늘 안에 처리돼야 다음 단계로 넘어갑니다.",
      },
      {
        speaker: "fox",
        text:
          "문자 안의 링크는 누르지 않을게요. 제가 법원 대표번호로 직접 전화해서 같은 안내를 받을 수 있는지부터 확인하겠습니다.",
      },
      {
        speaker: "stranger",
        text:
          "세부 내용은 페이지에서만 안내되고, 문자로 더 설명해 드릴 순 없습니다. 시간이 지나면 처리 순서에서 밀릴 수 있습니다.",
      },
      {
        speaker: "fox",
        text:
          "그럴수록 문자 말만 따라가진 않겠습니다. 검색해서 찾은 공식 번호로 확인하고, 같은 절차가 있는지 들은 뒤 움직이겠습니다.",
      },
      {
        speaker: "stranger",
        text:
          "지금이라도 접속만 해 주세요. 지연 과태료·재발송 안내 문자에도 적혀 있습니다.",
      },
      {
        speaker: "fox",
        text:
          "과태료 문자 문구 여부와 관계없이 링크는 사용하지 않겠습니다. 화면 캡처는 보관해 두었습니다.",
      },
    ],
    peerTalkLines: [
      "법원이라는 문자에 링크가 있는데, 진짠지 검색해서 대표번호로 물어봐도 될까?",
      "‘지금’만 반복되는데 나는 링크 안 열고 확인부터 할 거거든 같이 한번 볼래?",
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
          "1컷에서는 정상가보다 훨씬 싼 고가석 티켓 거래 채팅이 시작되어 있어요.",
        subLines: [
          "가격 차이만 크고 증빙·거래처 확인이 채워지기 전이라면 속도부터 늦추고 조건을 점검하려 선택할 수 있어요.",
        ],
      },
      {
        keyLine:
          "2컷에서는 첫 입금 뒤 ‘순차 발송이라 문자만으로 진행 안내’가 이어져요.",
        subLines: [
          "발송 예정 시각·증빙·문의처가 없을 때 한 번 더 묻고 확인하려 고르기 좋습니다.",
        ],
      },
      {
        keyLine:
          "3컷에서는 이미 돈을 보낸 뒤 송금자명 불일치를 들어 같은 금액 재입금을 요구해요.",
        subLines: [
          "먼저 보낸 돈 처리 설명 없이 같은 금액만 재촉하는 전형적인 재송금 유도 패턴입니다.",
        ],
      },
      {
        keyLine:
          "4컷에서는 입금 후 답 없음·연락 두절·채널 차단처럼 이어져요.",
        subLines: [
          "두 번째 이체를 막은 경우 피해를 추가로 줄일 수 있으니 문자·송금증을 묶어 도움을 받는 순서가 맞습니다.",
        ],
      },
    ],
    resultWhyStopBrief: {
      keyLine:
        "이미 돈을 보냈는데 같은 금액이나 추가 금액을 다시 보내라고 하면 사기 가능성이 매우 높아요. 환불이나 처리 명목으로 재송금을 요구하는 경우에는 바로 멈춰야 해요.",
      subLines: [
        "정상적인 업무라면 환불·정정 절차와 시점이 문자나 안내 창구에서 분명하게 설명되는 경우가 많아요.",
        "의심되면 같은 금액 입금은 중단하고 채팅·계좌 캡처를 보관한 뒤, 플랫폼 고객센터·유관기관 안내에 따라 신고와 상담을 진행하세요.",
      ],
    },
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      {
        speaker: "stranger",
        text:
          "입금 들어왔습니다. 순차 발송이라 약간 기다려 주시면 상태만 문자로 올려 드릴게요.",
      },
      {
        speaker: "fox",
        text:
          "입금 문자랑 이름 맞춰 넣었다는 게 맞나요? 발송 예정일 줄만이라도 문자로 남겨 주실 수 있을까요?",
      },
      {
        speaker: "stranger",
        text:
          "로그상 송금자명 불일치로 잡혀서 같은 금액 재입금이 필요합니다. 지금 안 들어오면 순서 빠져요.",
      },
      {
        speaker: "fox",
        text:
          "첫 입금은 언제·어떤 방식으로 돌려준다 알려 주실 수 있나요? 그 설명 없이 같은 금액 재송금만 하긴 어렵습니다.",
      },
      {
        speaker: "stranger",
        text:
          "시스템상 재입금만 가능합니다. 지금 결정해야 출고 순서 안 밀린다 문자에 들어있습니다.",
      },
      {
        speaker: "fox",
        text:
          "그럼 두 번째 입금은 하지 않겠습니다. 대화 내용이랑 캡처는 저장했고 신고 채널부터 알아보겠습니다.",
      },
    ],
    peerTalkLines: [
      "티켓 돈 넣었는데 같은 금 또 보내래. 이름 맞췄다고 했더니 같은 말만 해. 이상하지 않아?",
      "문자 그대로 보여 줄 테니 같이 한번 읽어줄래?",
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
          "1컷에서는 시세보다 훨씬 싼 중고 노트북 매물 채팅이 열렸어요.",
        subLines: [
          "값만 크게 내려가 있는데 실물 확인·판매처 정보가 채워지기 전이라면 속도부터 늦추려는 단계로 볼 수 있어요.",
        ],
      },
      {
        keyLine:
          "2컷에서는 직거래는 불가하고 선입금 뒤 택배만 가능하다고 못 박히는 줄이 나와요.",
        subLines: [
          "만나 상태를 보거나 플랫폼 안전결제 같은 확인 경로 없이 현금부터 요구하면 검증이 빠져나가기 쉬워요.",
        ],
      },
      {
        keyLine:
          "3컷에서는 다른 예약 고객이 있다며 같은 날 안에 입금부터 재촉하는 말만 이어져요.",
        subLines: [
          "‘지금’만 반복될 때는 선입금을 멈추고 주변에 내용을 보여 주며 판단을 나누기 좋은 지점입니다.",
        ],
      },
      {
        keyLine:
          "4컷에서는 입금 후 읽음만 확인되고 답 없음·두절이 이어져요.",
        subLines: [
          "두 번째 송금을 하지 않은 경우 피해를 추가로 줄일 수 있습니다. 채팅과 송금 내역은 캡처해 두세요.",
        ],
      },
    ],
    resultWhyStopBrief: {
      keyLine:
        "중고거래에서는 만나 상태를 확인하거나 플랫폼이 제공하는 안전 결제처럼 절차가 남는 경우가 많아요.",
      subLines: [
        "직거래를 막으며 선입금만 빨리 하라 하면 사람·물건 확인을 건너뛰게 만든다고 보면 됩니다.",
        "‘지금 보내지 않으면 빠진다’는 말만 겹치면 문자를 종료하지 말고 캡처를 남긴 다음 고객센터 신고 안내 또는 경찰·소비자 상담 채널을 이용하세요.",
      ],
    },
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      {
        speaker: "stranger",
        text:
          "문의 주셔서 선입금만 받고 당일 택배 잡습니다. 다른 분도 줄 서 있어서 오늘 중으로만 넣어 주세요.",
      },
      {
        speaker: "fox",
        text:
          "근처에서 물건 상태만 함께 볼 순 없나요? 직거래 말고도 안전 결제처가 있으면 그걸로 맞춰 진행하고 싶어요.",
      },
      {
        speaker: "stranger",
        text:
          "직거래 불가 문자에 들어 있습니다. 순서 때문에 지금 선입금이 안 들어오면 자리부터 빠집니다.",
      },
      {
        speaker: "fox",
        text:
          "사람 확인 없이 계좌만 받는 건 곤란해요. 링크로라도 명확한 안전 채널을 제시하지 않으면 선입금은 하지 않겠습니다.",
      },
      {
        speaker: "stranger",
        text:
          "입금 순서 놓치면 시간만 손합니다. 문자에 다 적혀 있으니 빨리 보내 주세요.",
      },
      {
        speaker: "fox",
        text:
          "그럼 진행 안 하고 채팅은 캡처해 둘게요. 앱 신고 방법부터 알아본 뒤 정리할게요.",
      },
    ],
    peerTalkLines: [
      "이런 문자 왔는데 링크 눌러도 되는지 같이 한번 봐줄래?",
      "직거래는 안 된대고 선입금만 재촉해. 앱 신고 방법도 같이 찾아볼 사람 있어?",
    ],
  },
] as const;
