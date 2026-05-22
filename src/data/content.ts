export type CategoryId =
  | "marketplace"
  | "ticket"
  | "smsLink"
  | "family"
  | "job"
  | "fourCut";

export type CategoryMeta = {
  id: CategoryId;
  title: string;
};

/** 기본 카테고리 다섯 가지 순서입니다. 특별 만화 네 컷은 `FOUR_CUT_TOC_META`로 별도 표시합니다. */
export const CATEGORY_LIST: CategoryMeta[] = [
  { id: "marketplace", title: "중고거래" },
  { id: "ticket", title: "티켓거래" },
  { id: "smsLink", title: "문자 링크" },
  { id: "family", title: "가족 사칭" },
  { id: "job", title: "알바 제안" },
];

/** 목차 줄: 일기 번호와 짧은 설명 (네 타이틀은 title + "편") */
export const DIARY_TOC_ENTRIES: readonly {
  id: Exclude<CategoryId, "fourCut">;
  diaryNo: number;
  blurb: string;
}[] = [
  {
    id: "marketplace",
    diaryNo: 1,
    blurb: "입금 재촉, 직거래 회피 같은 작은 신호를 살펴봐요.",
  },
  {
    id: "ticket",
    diaryNo: 2,
    blurb: "원가보다 싼 티켓, 급한 양도에는 이유가 있을지도 몰라요.",
  },
  {
    id: "smsLink",
    diaryNo: 3,
    blurb: "택배, 인증, 이벤트처럼 보이는 문자를 한 번 더 봐요.",
  },
  {
    id: "family",
    diaryNo: 4,
    blurb: "가족이 보낸 것 같은 메시지도 잠깐 멈춰 확인해봐요.",
  },
  {
    id: "job",
    diaryNo: 5,
    blurb: "쉬운 수익을 먼저 말하는 제안, 조금만 더 들여다봐요.",
  },
];

/** 목차 하단 특별 일기 (만화 네 컷 플레이스홀더) */
export const FOUR_CUT_TOC_META = {
  id: "fourCut" as const,
  kicker: "특별 일기",
  title: "여우의 4컷 일기",
  blurb: "보이스피싱과 수상한 거래 이야기를 짧은 만화로 살펴봐요.",
};

export type StoryContent = {
  panels: readonly [string, string, string, string];
  checklist: readonly string[];
};

export const STORIES: Record<CategoryId, StoryContent> = {
  marketplace: {
    panels: [
      "\"당일 픽업이라면 깎아드릴게요\" 하는 첫 카톡",
      "\"입금부터 해주실 수 있죠?\" 빠른 송금을 재촉해요",
      "내 연락처를 묻거나 픽업 시간은 아직 모른대요",
      "여우도 갸우뚱… 이건 조금 빠르지 않을까?",
    ],
    checklist: [
      "입금을 너무 빨리 재촉하고 있나요?",
      "\"당일 픽업\"이라는 말만으로 마음을 홀리고 있진 않나요?",
      "계좌 이름이 판매자와 다른데도 괜찮다고 하나요?",
    ],
  },
  ticket: {
    panels: [
      "\"원가에 드려요\" 갑작스레 나타난 티켓 제안",
      "\"링크 들어가서 간편결제 해주세요\" 안내 문자",
      "공식 페이지가 아닌 짧은 URL로만 안내해요",
      "여우가 귀만 쓰담… 어라, 이 페이지 익숙하지 않네?",
    ],
    checklist: [
      "티켓을 공식 앱 없이 문자 링크로만 받으라고 하나요?",
      "환불·정보보다 \"지금 바로 결제\"만 계속 언급하나요?",
      "판매 증명(예약내역 등) 없이 신뢰만 강조하나요?",
    ],
  },
  smsLink: {
    panels: [
      "\"택배가 대기중이에요\" 모르는 배송 문자",
      "짧은 링크 하나와 \"바로 확인\" 버튼 느낌의 안내",
      "로그인·결제처럼 정보를 빨리 받으려 해요",
      "여우 꼬리 살짝 세워… 문자인데 급한 척 너무 심해요",
    ],
    checklist: [
      "공식 앱 밖 링크로 이동하라고 급하게 재촉하나요?",
      "\"확인\"만 했을 뿐인데 결제·개인정보를 요구하나요?",
      "발신 번호나 링크가 평소 보던 곳과 전혀 다르지 않나요?",
    ],
  },
  family: {
    panels: [
      "\"나야, 새 번호 썼어\" 온 카톡 한 통",
      "말투가 비슷한데 디테일은 조금 헷갈려요",
      "\"급하게 송금만 부탁\" 스토리만 반복해요",
      "여우가 귀 세우고 주위를 둘러봐요… 진짜 가족 맞아?",
    ],
    checklist: [
      "얼굴·목소리 없이 문자만으로 상황이 심각하대요?",
      "계좌가 평소 쓰던 것과 다른데 급하게 맞춰주라 하나요?",
      "\"비밀로 해줘\"라며 다른 가족과 확인을 막지 않나요?",
    ],
  },
  job: {
    panels: [
      "\"하루 30분, 스마트폰만 있으면\" 달달한 알바 카톡",
      "\"선입금 회비\"나 \"등록비\"부터 내라고 해요",
      "일의 내용은 흐릿하게, 돈부터 확실하게",
      "여우가 책 덮으며… 귀여운 표정이지만 뭔가 수상해요",
    ],
    checklist: [
      "일 시작 전 돈부터 보내라고 우선 순위를 두나요?",
      "회사 이름·근무처·계약 내용 없이 신뢰만 이야기하나요?",
      "단톡·개인 카톡만으로 업무 진행을 강조하나요?",
    ],
  },
  fourCut: {
    panels: [
      "여우의 4컷 일기 장이 열렸어요.",
      "보이스피싱·수상한 거래 만화 업데이트를 준비 중이에요.",
      "곧 코믹 브금과 함께 짧은 네 컷으로 만나 보실 거예요.",
      "조금만 기다려 주세요!",
    ],
    checklist: [
      "만화로 본 순간 다시 차분히 상황을 정리할 수 있을까요?",
      "처음부터 끝까지 한 번 더 훑어 보면 어떨까요?",
      "무서워도 혼자 끙끙이지 않고 주변과 나눌 수 있을까요?",
    ],
  },
};
