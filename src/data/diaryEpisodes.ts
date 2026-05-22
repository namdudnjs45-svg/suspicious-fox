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

/** 결과 카드 「내가 고른 순간」 — 컷별 2~4문장, 의미 단위 문단은 `\n\n`으로만 구분 */
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
  /** 결과 카드 컷별 본문(2~4문장 기준으로 작성, `\n\n`으로 문단만 구분) */
  resultPickMomentByCut: DiaryResultPickMoments;
  /** 「왜 멈춰야」 — 같은 규칙 */
  resultWhyStopBrief: string;
  checklist: readonly string[];
  /** 하단 문구 */
  closingMessage: string;
  comicImages?: readonly [string, string, string, string];
  chatExample: readonly DiaryChatTurn[];
  /** 가까운 사람에게 말해보기 예시 문장 */
  peerTalkPrompt: string;
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
      "첫 연락은 기관 이름만 맞춰 말했고 등기 때문에 확인이 필요하다고만 했어요. 구체적인 사건번호나 어디에서 확인할 수 있는지는 말하지 않아 들으면서도 자꾸 찜찜했습니다.\n\n그래서 여기서 속도부터 느리게 가려고 이 컷부터 멈춰보고 싶다는 생각으로 골랐어요.",
      "일정을 물어본 다음 곧바로 링크로 확인하라고 몰아가는 흐름이었어요. 자세히 설명해 주기보다 ‘지금’ 접속이 반복되는 느낌이라 손가락부터 가게 하는 대화처럼 느껴졌습니다.\n\n그래서 접속 버튼을 누르기 전에 멈춰도 된다고 느낀 장면이라 이 컷을 골랐어요.",
      "링크 안에서 주민등록번호처럼 민감한 정보까지 넣으라는 단계가 나오면 불안함이 크게 된다고 느꼈습니다. 문자나 채팅 한두 줄만 보고 즉석에서 적어 내라는 말이라면 거르고 싶었다는 선택이 들었습니다.\n\n실제 업무처럼 들려도 이 컷이라면 순서부터 바꾸려고 했습니다.",
      "마감이나 불이익 말까지 겹쳐지면 속도부터 몰이 되는 순간이라고 보였습니다. 시간을 줄이려는 분위기가 강하게 느껴져서 그 압박만으로도 접속 순서를 미루고 싶었다는 선택이 들었습니다.\n\n기한 말 때문이라도 문자 말고 직접 찾아본 연락처로 같은 내용부터 확인하고 싶다는 생각도 같이 들었어요.",
    ],
    resultWhyStopBrief:
      "설령 실제 업무처럼 들리더라도 문자만 보고 접속부터 하게 몰이거나 접속처를 명확히 적어 주지 않는 대화에서는 잠깐 멈춰도 되는 순간이라는 생각부터 가져도 괜찮습니다.\n\n말이 급하게 이어진다면 ‘그 자리 접속 압박’에서 거리를 두려는 반응이 자연스럽거든요. 그래서 링크 저장해 두거나 직접 검색해서 공식 사이트·전화번호를 찾아 한두 마디만 같은 내용인지 확인한 뒤 움직이는 편이 마음 편했습니다.",
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      {
        speaker: "stranger",
        text:
          "OO서울중앙지방법원입니다. 등기 관련 확인이 필요해 연락드린 거예요. 지금 바로 확인 안 하시면 처리에 차질이 생길 수 있어 급하게 안내 문자도 같이 준비돼 있습니다.",
      },
      {
        speaker: "fox",
        text:
          "잠깐만요, 등기가 왜 제 건인지랑 무슨 문건인지 먼저 말씀해 주실 수 있을까요? 문자 내용만 보면 헷갈려서 확인하고 싶은 게 있어서요.",
      },
      {
        speaker: "stranger",
        text:
          "자세한 건 문자로 간단히 보낼 링크에서 확인하실 수 있습니다. 업무 접수 단계에서는 링크로 들어와서 순서 진행해야 해요, 여기까지가 저희가 문자로 더 설명해 드릴 범위입니다.",
      },
      {
        speaker: "fox",
        text:
          "네, 그럼 혹시 같은 내용이 법원 홈페이지에서도 같은 문구로 조회되는 형태일까요? 전화번호가 저한테 온 문자에 그대로 있어야 하는 거 맞아요?",
      },
      {
        speaker: "stranger",
        text:
          "지금 링크로 접속해야 접수 시간 안에 들어간 걸로 잡히는 구조예요. 나중에 또 재안내 문자가 나갈 수도 있거든요. 지금 바로 들어와서 확인 버튼 눌러 주시면 절차 훨씬 빨라집니다. 안 이러면 일정 때문에 다음 단계로 못 넘길 때도 있습니다.",
      },
      {
        speaker: "fox",
        text:
          "네… 일단 저는 문자 안에 있는 링크는 바로 안 누를게요. 제가 검색해서 법원 전화번호를 찾아서 직통으로 같은 내용인지부터 확인하고 끝나면 다시 연락드려도 되죠?",
      },
      {
        speaker: "stranger",
        text:
          "접수 시스템상 링크로만 접수된다고 문자에 들어 있습니다. 직통으로 문의 들어오면 같은 건 업무 접수 처리가 불가 처리될 수 있어 시간만 더 새요. 문자 링크로 들어오지 않으면 제가 책임지기 어렵다는 내용 문자에도 따라붙었습니다.",
      },
      {
        speaker: "fox",
        text:
          "공식 사이트에서도 조회 가능한 건가요, 아니면 이 링크로만 되는 업무처럼 말씀하시는 건지 확인하고 싶어요. 잠깐만요, 제가 번호 찾아서 직접 전화해볼게요. 전화번호나 주민번호 뒷자리를 여기 문자로 보내 달라고 하면 그때부터는 더 조심하려고요.",
      },
      {
        speaker: "stranger",
        text:
          "오늘 중으로 접속만이라도 들어와 주세요. 시간 지나면 지연 과태료 쪽 문자가 또 나간다 안내문에 적혀 있어요. 링크에서 안내 순서 따라만 주시면 복잡한 건 아닙니다.",
      },
    ],
    peerTalkPrompt:
      "나 법원에서 왔다는 문자 같은 거 받았는데, 링크부터 누르래. 너 같은 연락 받아본 적 있어? 오늘이라거나 재발송 말부터 겹치면 속이 많이 헷갈려서 문자 그대로 두고 검색이랑 전화 순서부터 같이 봐 줄 수 있어?",
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
      "가격차가 너무 커서 금방 손이 갈 수 있는 구간이었어요. 그래도 채팅 속도부터 줄이고 싶었다는 뜻으로 저는 이 컷에서 멈춰보려고 골랐어요.\n\n짧게라도 본인 거래인지 조건을 짚어보고 넘어가도 늦지 않다고 느꼈습니다.",
      "한 번 입금하면 끝난 것처럼 느껴질 수 있는데, 그다음 알림이 어떻게 이어지는지 보는 게 중요했어요. 문자 톤만 달라져도 다시 마음을 다잡을 수 있다는 생각으로 이 컷을 골라봤습니다.",
      "저는 이미 분명히 이름 맞춰 보냈는데 같은 금액을 또 보내라고 하면 순간 당황이 클 것 같았어요. 그런데 돌려받는 순서가 말로 명확히 안 잡히면 흔히 말하는 패턴이랑 거리가 없어 보였습니다.\n\n그래서 이 자리에서는 추가 송금이나 안내 링크 따라가기부터 멈추고 싶다는 선택이라고 말할 수 있었어요.",
      "답이 끊기고 차단처럼 보일 때는 속이 많이 무거울 수 있어요. 그래도 같은 말을 믿고 한 번 더 따라가지 않았다면 줄일 수 있는 범위가 있다는 점을 크게 느꼈습니다.\n\n여기서 같은 송금 요구를 받은 적이 있다면 문자를 그대로 두고 주변에부터 말해보려 했어요.",
    ],
    resultWhyStopBrief:
      "이미 돈을 한 번 보냈는데 같은 금액을 다시 보내라고만 몰아칠 때가 있어요. 먼저 보낸 돈은 언제·어떻게 돌려준다는 안내가 문자에 남지 않고 말만 재촉이면 마음이 많이 불안해집니다.\n\n현실적인 처리라면 단계가 말이나 문자로라도 남는 경우가 많거든요. 그래서 같은 말만 반복된다면 주변에 확인하거나 해당 분야 도움 채널에 문의 템플릿이라도 물어보고 움직여도 늦지 않습니다.",
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      {
        speaker: "stranger",
        text:
          "안녕하세요, 말씀하신 티켓 입금 들어왔습니다. 순차 발송이라 조금 시간 걸릴 수는 있어요.",
      },
      {
        speaker: "fox",
        text:
          "네 확인 감사합니다. 입금 문자랑 계좌 캡처 같이 보내드린 건 보셨을까요? 대략 발송 예정이 며칠쯤 나올까요, 혹시 문자로라도 날짜 같은 거 남길 수 있는지 궁금해요.",
      },
      {
        speaker: "stranger",
        text:
          "네 봤습니다. 시스템 쪽 로그에 송금자명 불일치로 들어가 있어 동일 금액으로 한 번 더 입금해 주셔야 처리돼요. 이전 거는 재입금 이후 함께 정리된다고 안내 문구에 들어가 있습니다. 지금 순서대로라도 안 해주시면 대기열 밀린다고도 안내 돼 있어요.",
      },
      {
        speaker: "fox",
        text:
          "잠깐만요, 이름은 제가 맞춰서 보냈는데요. 캡처에도 그대로 적혀 있는데 불일치가 뜰 수가 있나요? 그리고 먼저 보낸 금액은 언제쯤 어떻게 돌려준다는 문자가 언제까지 오는 건지부터 알려 주실 수 있어요?",
      },
      {
        speaker: "stranger",
        text:
          "시스템이 그렇게 잡히면 재입금 방법밖에 안 뜹니다. 시간 지나면 순서 또 밀린다고 문자에도 들어가 있으니까 빨리 같은 금액만 더 부탁할게요.",
      },
      {
        speaker: "fox",
        text:
          "요… 솔직히 많이 불안해요. 같은 금액을 다시 보내면 확정 문자라도 남나요, 아니면 거래처 전화로 확인할 방법이 따로 있나요? 말로만 재촉 받는 느낌이라 제가 이해를 못 하는 것 같아서요.",
      },
      {
        speaker: "stranger",
        text:
          "전화번호 문자로 따로 못 드리는 구조라고 돼 있어요. 같은 금액만 더 들어오면 로그가 맞춰지면서 처리되는 구조라 문자로도 그렇게 적혀 있습니다. 지금 안 들어오면 앞 순서 다시 잡는 거라 저희도 책임 못 진다는 문구 문자에 붙어 있어요.",
      },
      {
        speaker: "fox",
        text:
          "그럼 같은 금 재송금은 바로는 못 할 것 같아요. 먼저 입금한 건 환불이 문서상으로 어떻게 되는지, 혹시 담당 이름이나 문자로 남길 번호가 따로 있는지 알려 주실 수 있나요? 없으면 저 그냥 해당 서비스 고객 안내 쪽이랑 신고 양식이라도 찾아보려고요.",
      },
      {
        speaker: "stranger",
        text:
          "규칙이 그쪽만 허용이에요. 지금이라도 들어오면 오늘 중으로라도 순서 안 밀린다고만 생각하시면 되고, 안 그러면 순서에서 빠져서 다시 잡을 때도 저희가 책임 못 진다는 문자 나갈 거예요.",
      },
      {
        speaker: "fox",
        text:
          "네 시간 압박 말은 이해했어요. 근데 시간보다 잘못 보내는 게 더 무서워서 두 번째 입금은 안 할게요. 문자는 다 저장해 두고 우리 집사람이나 친구한테 그대로 보여주고 판단 받으려고요.",
      },
      {
        speaker: "stranger",
        text:
          "그럼 처리 창 닫히는 쪽으로 가는 거예요. 나중에 순서 다시 잡으실 때도 문자로만 안내 간다고 문자에 적혀 있으니 시간만 놓치지 마세요.",
      },
      {
        speaker: "fox",
        text:
          "네, 문자는 그대로 두고 교환한 기록이랑 계좌 스샷만이라도 정리해 둘게요. 혹시 피해 접수하는 쪽 이름 알면 그것도 문자로 남겨 주실 수 있는지요?",
      },
    ],
    peerTalkPrompt:
      "티켓 받기도 전인데 송금자명 불일치래, 같은 돈 또 넣으래. 이름 맞춰 보냈다고 말했는데 같은 말만 반복돼서 무서웠어. 문자 그대로 들고 갈 테니 주말에 같이 읽어주고 이상한 줄만 표시해 줄 수 있어?",
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
      "싼 매물 때문에 문의 속도부터 나갔을 수 있는 컷이라 잠깐 멈춰보고 싶었어요. 판매자가 사람과 물건을 어떻게 보여 줄지 짚어보려는 선택이라고 표현했습니다.\n\n채팅 몇 줄로만 넘기지 말까 하는 생각 들 때가 있었거든요.",
      "직거래는 된다던데 피했고 택배 선입금만 말했다면 사람을 보거나 물건을 확인할 길을 줄이는 말처럼 들렸어요. 그래서 만나거나 안전하게 결제할 방법이 있는지 먼저 묻고 싶다는 뜻으로 이 컷을 골랐습니다.",
      "다른 구매자가 있다며 오늘 입금을 계속 말하면 조건이 무서워지는 순간이라고 느꼈어요. 보내기 전이라면 주변 의견부터 듣고 싶다는 반응이 자연스럽다고 생각했습니다.\n\n그래서 이 컷에서 멈춰도 충분하다는 선택이었습니다.",
      "입금 뒤 읽음만 뜨고 답이 없으면 피해감이 크게 올 수 있어요. 그래도 같은 말에 또 따라가지 않았다면 덜 키울 수 있는 범위가 있다는 점을 강하게 느꼈습니다.\n\n문자 기록을 그대로 두고 도움받을 사람부터 찾고 싶다는 생각도 들었어요.",
    ],
    resultWhyStopBrief:
      "만나서 물건을 보거나 플랫폼 안전 결제처럼 확인할 방법이 있는 경우가 많은데, 채팅만으로 선입금부터 재촉한다면 조건이 불안하게 느껴질 수 있어요.\n\n‘지금 안 보내면 끝’ 같은 말이 반복되면 급한 마음이 커지기 쉬운데, 그때 잠깐 멈춰도 된다는 생각부터 가져도 괜찮습니다. 문자를 그대로 두고 주변 사람이나 비슷한 거래를 해 본 사람에게 보여주면 말 순서부터 정리되기도 하거든요.",
    checklist: [],
    closingMessage: MVP_CLOSING_LINE,
    chatExample: [
      {
        speaker: "stranger",
        text:
          "안녕하세요 노트북 문의 주셔서 연락드려요. 직거래는 개인 사정으로 어렵고 택배만 가능해서 선입금 주시면 당일 출고 잡아둔 상태예요.",
      },
      {
        speaker: "fox",
        text:
          "아 네, 그런데 가능하면 근처에서 한번 상태만 같이 보고 싶었는데요. 사진 더 있거나 만나서 볼 수 있는 주말·저녁 시간도 있으실까요?",
      },
      {
        speaker: "stranger",
        text:
          "직거래는 시스템상 안 된다고 안내 문자에 적혀 있어요. 선금 들어오신 순서부터 출고 순서 나가거든 다른 분도 계속 문의 들어옵니다. 지금도 대기 줄 있어 빨라요.",
      },
      {
        speaker: "fox",
        text:
          "네… 무슨 말인지는 알았는데, 사람이 안 보인 채로 계좌만 바로 받으려 하면 많이 무섭네요. 혹시 플랫폼에서 안전 결제처럼 잡는 방법이라도 가능한 건 없을까요?",
      },
      {
        speaker: "stranger",
        text:
          "다른 분 예약도 있어서 지금 순서 놓치면 시간대 안 맞춰 드린다 문자로도 적어 드린 거예요. 오늘 중으로 들어오시면 순서 안 밀린다고 문자에 같이 들어 있습니다.",
      },
      {
        speaker: "fox",
        text:
          "솔직히 ‘지금’ 말만 자꾸 나와서 따라가야 할 것 같아서 무섭거든요… 혹시라도 상태 설명이라도 사람 목소리로 들을 만한 방법이 하나만 있으면 그걸로 먼저 안심시키고 결정하고 싶은데 가능할까요?",
      },
      {
        speaker: "stranger",
        text:
          "전화번호는 거래 과정상 개인 공유 불가라고 문자에 적혀 있어요. 입금 순서가 들어오고 나야 다음 단계가 열린다고 안내 문자에도 나가 있는데, 문자로만 소통한다고만 반복돼서 더 불안했어요.",
      },
      {
        speaker: "fox",
        text:
          "그럼 전 선입금은 못 할 것 같아요. 만나서 보거나 안전 채널 이름이라도 문자로 명확히 남길 방법이 하나만 더 있어야 선택할 자신 있을 것 같아요. 없으면 이번 건 여기까지 하려구요.",
      },
      {
        speaker: "stranger",
        text:
          "그건 문자 허용 범위가 아니라고만 적혀 있었구요. 순서 줄어있으니 시간만 놓치지 마시라고 문자에 따라붙였어요, 다른 분이 들어오시면 순서 빠져요 같은 문자도 따라붙어 있었고, 지금이라도 들어오시면 순서 안 밀린다 문자에도 따라붙어 있습니다.",
      },
      {
        speaker: "fox",
        text:
          "네 알겠어요 순서 때문에 서두르는 말 많이 무서워요. 문자는 저장해 두고 우리 신랑 보여주면서 같이 읽어볼게요. 그쪽에서라도 문자로 한 번 더 온 게 있나 지켜보다가 다음 말부터 정리하고 싶어요.",
      },
      {
        speaker: "stranger",
        text:
          "안 들어오시면 순서에서 빠진다는 안내 문자가 나간다고 적혀 있어요. 다른 분이 들어오면 제가 책임 못 진다는 문구도 문자에 같이 붙어 있습니다. 시간만 놓치지 마세요.",
      },
      {
        speaker: "fox",
        text:
          "네, 일단 문자 흐름도 사진 저장해 놓게요. 해당 앱 도움말에 제보 양식 같은 것도 찾아보려고요.",
      },
    ],
    peerTalkPrompt:
      "중고로 샀는데 직거래는 무조건 안 된대요 선입금만 재촉해요. 문자에 ‘지금 다른 분’ 말만 반복돼서 속이 너무 조급해지거든요. 시간 없다는 말에만 말리고 싶어서 문자는 저장만 해뒀어요. 시간 날 때 같이 순서부터 짚어 줄 수 있어?",
  },
] as const;
