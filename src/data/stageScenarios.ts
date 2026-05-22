import type { CategoryId } from "./content";

/** 말풍선 정렬·역할 (카카오톡 디자인이 아닌 앱 말풍선 스타일로만 해석) */
export type StageMsgRole =
  | "buyerRight"
  | "sellerLeft"
  | "systemLeft"
  | "proposalLeft"
  | "userRight"
  | "sceneLeft"
  | "foxCenter";

export interface StageIntroLine {
  delayS: number;
  text: string;
}

/** 패턴 라이브러리 항목(스테이지별·신호별) */
export interface StageSignalPattern {
  signalId: string;
  label: string;
  patternType: string;
  whyItMatters: string;
  checkQuestion: string;
}

export interface StageScenarioMessage {
  speaker: string;
  role: StageMsgRole;
  text: string;
  /** `signals` 항목의 id와 일치 */
  signalId?: string;
}

export interface StageScenario {
  categoryId: CategoryId;
  ariaStoryLabel: string;
  stageBadge: string;
  stageTitleSuffix: string;
  diaryLabel: string;
  chatHeading: string;
  chatSub: string;
  hintLine: string;
  introLines: readonly StageIntroLine[];
  paragraphBreakBeforeLineIndex: number | null;
  messages: readonly StageScenarioMessage[];
  /** 정확히 3개 */
  signals: readonly [StageSignalPattern, StageSignalPattern, StageSignalPattern];
  clearDescription: string;
}

export const STAGE_SIGNAL_TOTAL = 3;

export function countStageSignals(found: readonly string[], patterns: readonly StageSignalPattern[]): number {
  return patterns.reduce((n, p) => n + (found.includes(p.signalId) ? 1 : 0), 0);
}

export function signalIdsList(patterns: readonly StageSignalPattern[]): string[] {
  return patterns.map((p) => p.signalId);
}

function P(
  signalId: string,
  label: string,
  patternType: string,
  whyItMatters: string,
  checkQuestion: string,
): StageSignalPattern {
  return { signalId, label, patternType, whyItMatters, checkQuestion };
}

/** 교육·정리용 사기 패턴 유형 레퍼런스 (18종) — 패턴 문자열 교육 범위 */
export const EDUCATIONAL_FRAUD_PATTERN_TYPES_18 = [
  "선입금·예약금 압박형",
  "직거래·연락처 회피형",
  "안전결제 위장형",
  "실물·증빙 지연형",
  "빠른 결정 압박형",
  "추가입금·환불 루프형",
  "외부 링크 입력 유도형",
  "시간 제한·불이익 압박형",
  "개인정보·금융정보 입력 요구형",
  "기관 사칭형",
  "가족·지인 사칭형",
  "통화 확인 회피형",
  "대출빙자형",
  "원격조종·앱 설치 유도형",
  "계좌 대여·입출금 알바형",
  "쉬운 고수익 유혹형",
  "신분증·인증샷 악용형",
  "신고·차단 협박형",
] as const satisfies readonly string[];

/** 목차 카테고리별 시뮬레이션 · 스테이지 체크리스트는 각 signal의 checkQuestion 에서 표시됨 */
export const STAGE_SCENARIOS: Record<CategoryId, StageScenario> = {
  marketplace: {
    categoryId: "marketplace",
    ariaStoryLabel: "중고거래 이야기",
    stageBadge: "Stage 01",
    stageTitleSuffix: "중고거래편",
    diaryLabel: "중고거래편",
    chatHeading: "판매자와의 대화",
    chatSub: "중고거래편",
    hintLine: "말풍선 속 흐름을 살펴보며, 갸웃하는 부분만 골라 눌러보세요.",
    paragraphBreakBeforeLineIndex: 3,
    introLines: [
      { delayS: 0.1, text: "오랜만에 중고거래를 하기로 했다." },
      { delayS: 0.25, text: "마침 괜찮은 물건을 찾았고," },
      { delayS: 0.4, text: "판매자와 대화를 시작했다." },
      { delayS: 0.52, text: "처음에는 평범한 거래처럼 보였다." },
      { delayS: 0.64, text: "그런데 대화가 이어질수록," },
      { delayS: 0.76, text: "여우는 조금씩 갸웃하기 시작했다." },
    ],
    messages: [
      { speaker: "구매자", role: "buyerRight", text: "안녕하세요. 아직 거래 가능할까요?" },
      { speaker: "판매자", role: "sellerLeft", text: "네 가능해요. 당일 픽업이면 조금 깎아드릴게요." },
      { speaker: "구매자", role: "buyerRight", text: "직접 보고 결정해도 될까요?" },
      {
        speaker: "판매자",
        role: "sellerLeft",
        text: "지금 문의가 많아서요. 예약금 먼저 주시면 잡아둘게요.",
        signalId: "reservationPressure",
      },
      {
        speaker: "구매자",
        role: "buyerRight",
        text: "연락처나 정확한 픽업 장소를 알 수 있을까요?",
      },
      {
        speaker: "판매자",
        role: "sellerLeft",
        text: "그건 입금 확인되면 알려드릴게요.",
        signalId: "infoAfterPayment",
      },
      {
        speaker: "판매자",
        role: "sellerLeft",
        text: "안전결제 링크 보내드릴게요. 여기서 결제하시면 돼요.",
        signalId: "fakeSafePayment",
      },
    ],
    signals: [
      P(
        "reservationPressure",
        "갸웃 신호, 예약금 압박",
        "선입금·예약금 압박형",
        "거래 조건 확인보다 입금을 먼저 요구하는 흐름이에요.",
        "예약금이나 선입금을 먼저 요구하고 있나요?",
      ),
      P(
        "infoAfterPayment",
        "갸웃 신호, 정보 확인을 입금 뒤로 미룸",
        "직거래·연락처 회피형",
        "연락처와 장소 확인을 입금 뒤로 미루면 확인 경로가 줄어들 수 있어요.",
        "연락처나 장소 확인을 입금 뒤로 미루고 있나요?",
      ),
      P(
        "fakeSafePayment",
        "갸웃 신호, 안전결제 링크 유도",
        "안전결제 위장형",
        "공식 앱이 아닌 링크를 결제창처럼 보이게 만들 수 있어요.",
        "공식 앱이 아닌 링크에서 결제를 요구하고 있나요?",
      ),
    ],
    clearDescription:
      "예약금 압박, 정보 확인 지연, 외부 결제 링크가 함께 보이면 거래를 잠깐 멈추고 확인하는 게 좋아요.",
  },

  ticket: {
    categoryId: "ticket",
    ariaStoryLabel: "티켓거래 이야기",
    stageBadge: "Stage 02",
    stageTitleSuffix: "티켓거래편",
    diaryLabel: "티켓거래편",
    chatHeading: "판매자와의 대화",
    chatSub: "티켓거래편",
    hintLine: "티켓 양도 과정 속에서 패턴처럼 붙는 말풍선을 하나씩 확인해보세요.",
    paragraphBreakBeforeLineIndex: 2,
    introLines: [
      { delayS: 0.1, text: "가고 싶었던 공연 티켓을 찾았다." },
      { delayS: 0.25, text: "원가보다 조금 싸게 올라온 글이라 마음이 흔들렸다." },
      { delayS: 0.4, text: "판매자는 빠르게 양도할 수 있다고 했다." },
      { delayS: 0.52, text: "하지만 대화가 이어질수록, 여우는 조금 이상함을 느꼈다." },
    ],
    messages: [
      { speaker: "구매자", role: "buyerRight", text: "아직 티켓 양도 가능할까요?" },
      { speaker: "판매자", role: "sellerLeft", text: "네. 지금 바로 넘겨드릴 수 있어요." },
      { speaker: "구매자", role: "buyerRight", text: "예매 내역이나 좌석 확인 가능할까요?" },
      {
        speaker: "판매자",
        role: "sellerLeft",
        text: "캡처는 나중에 보내드릴게요. 먼저 입금해주시면 바로 넘겨드려요.",
        signalId: "proofDelay",
      },
      {
        speaker: "구매자",
        role: "buyerRight",
        text: "안전거래나 현장 확인도 가능할까요?",
      },
      {
        speaker: "판매자",
        role: "sellerLeft",
        text: "문의가 많아서 입금순으로 처리하고 있어요.",
        signalId: "pressureQueue",
      },
      {
        speaker: "판매자",
        role: "sellerLeft",
        text: "수수료가 빠져서 시스템이 인식을 못 했대요. 같은 금액 한 번 더 보내주시면 이전 금액은 자동 환불돼요.",
        signalId: "repeatPayment",
      },
    ],
    signals: [
      P(
        "proofDelay",
        "갸웃 신호, 예매 증빙 확인 지연",
        "실물·증빙 지연형",
        "예매 내역 확인보다 입금을 먼저 요구하는 흐름이에요.",
        "예매 내역이나 좌석 확인을 입금 뒤로 미루고 있나요?",
      ),
      P(
        "pressureQueue",
        "갸웃 신호, 빠른 결정 압박",
        "빠른 결정 압박형",
        "문의가 많다는 말로 판단 시간을 줄일 수 있어요.",
        "입금순, 선착순, 오늘 안에 같은 말로 압박하고 있나요?",
      ),
      P(
        "repeatPayment",
        "갸웃 신호, 추가 입금 요구",
        "추가입금·환불 루프형",
        "시스템 오류나 환불을 이유로 반복 입금을 요구하는 흐름이에요.",
        "환불을 이유로 같은 금액이나 추가 금액을 다시 요구하나요?",
      ),
    ],
    clearDescription:
      "증빙 지연과 결정 재촉, 추가 입금 요구까지 겹치면 한 번 거래 속도를 늦추고 다른 경로로 확인하는 게 좋아요.",
  },

  smsLink: {
    categoryId: "smsLink",
    ariaStoryLabel: "문자 링크편 이야기",
    stageBadge: "Stage 03",
    stageTitleSuffix: "문자 링크편",
    diaryLabel: "문자 링크편",
    chatHeading: "오늘 온 문자",
    chatSub: "문자 링크편",
    hintLine: "문자 줄마다 차이가 있어도, 갸웃하는 메시지만 골라 눌러보세요.",
    paragraphBreakBeforeLineIndex: 3,
    introLines: [
      { delayS: 0.1, text: "택배가 온다는 문자를 받았다." },
      { delayS: 0.22, text: "문자에는 배송 확인 링크가 들어 있었다." },
      { delayS: 0.34, text: "처음에는 평범한 안내처럼 보였다." },
      { delayS: 0.52, text: "하지만 링크를 누르기 전, 여우는 한 번 더 살펴보기로 했다." },
    ],
    messages: [
      {
        speaker: "문자",
        role: "systemLeft",
        text: "고객님의 택배 주소가 정확하지 않아 배송이 보류되었습니다.",
      },
      {
        speaker: "문자",
        role: "systemLeft",
        text: "아래 링크에서 주소를 다시 입력해주세요.",
        signalId: "unknownLink",
      },
      { speaker: "사용자", role: "userRight", text: "택배를 시킨 게 있었나?" },
      {
        speaker: "문자",
        role: "systemLeft",
        text: "오늘 안에 확인하지 않으면 반송될 수 있습니다.",
        signalId: "timePressure",
      },
      {
        speaker: "문자",
        role: "systemLeft",
        text: "본인확인을 위해 이름, 생년월일, 카드 정보를 입력해주세요.",
        signalId: "personalInfoInput",
      },
      {
        speaker: "여우",
        role: "foxCenter",
        text: "링크를 누르기 전에 공식 앱에서 따로 확인해볼까요?",
      },
    ],
    signals: [
      P(
        "unknownLink",
        "갸웃 신호, 외부 링크 입력 유도",
        "외부 링크 입력 유도형",
        "문자 속 링크가 피싱 페이지나 악성 앱 설치로 이어질 수 있어요.",
        "문자 속 링크에서 정보를 입력하라고 하나요?",
      ),
      P(
        "timePressure",
        "갸웃 신호, 시간 압박",
        "시간 제한·불이익 압박형",
        "급하게 만들면 공식 경로 확인을 건너뛰기 쉬워요.",
        "오늘 안에 처리하지 않으면 불이익이 있다고 하나요?",
      ),
      P(
        "personalInfoInput",
        "갸웃 신호, 민감정보 입력 요구",
        "개인정보·금융정보 입력 요구형",
        "이름, 생년월일, 카드정보는 추가 피해로 이어질 수 있어요.",
        "본인확인을 이유로 개인정보나 카드정보를 요구하나요?",
      ),
    ],
    clearDescription:
      "링크 확인, 시간 압박, 민감 정보 입력까지 겹치면 공식 고객센터·앱 등 따로 거쳐 확인하는 게 좋아요.",
  },

  family: {
    categoryId: "family",
    ariaStoryLabel: "가족 사칭 이야기",
    stageBadge: "Stage 04",
    stageTitleSuffix: "가족 사칭편",
    diaryLabel: "가족 사칭편",
    chatHeading: "카톡으로 온 메시지",
    chatSub: "가족 사칭편",
    hintLine: "익숙한 말투 속에서도 줄 단위를 다시 살펴보고 눌러보세요.",
    paragraphBreakBeforeLineIndex: null,
    introLines: [
      { delayS: 0.1, text: "가족에게서 급한 메시지가 왔다." },
      { delayS: 0.22, text: "휴대폰이 고장 났고, 잠깐 돈이 필요하다는 내용이었다." },
      { delayS: 0.34, text: "말투는 익숙한 듯했지만, 어딘가 급했다." },
      { delayS: 0.46, text: "여우는 바로 보내기 전에 한 번 더 확인해보기로 했다." },
    ],
    messages: [
      {
        speaker: "가족",
        role: "sellerLeft",
        text: "나 휴대폰 고장 나서 이 번호로 연락해.",
        signalId: "newNumber",
      },
      { speaker: "사용자", role: "buyerRight", text: "무슨 일이야?" },
      {
        speaker: "가족",
        role: "sellerLeft",
        text: "지금 급하게 결제해야 하는데 대신 송금 좀 해줄 수 있어?",
      },
      {
        speaker: "사용자",
        role: "buyerRight",
        text: "전화해볼까?",
      },
      {
        speaker: "가족",
        role: "sellerLeft",
        text: "지금 통화는 안 돼. 그냥 빨리 보내줘.",
        signalId: "callAvoidance",
      },
      { speaker: "사용자", role: "buyerRight", text: "어디로 보내면 돼?" },
      {
        speaker: "가족",
        role: "sellerLeft",
        text: "내가 알려주는 계좌로 바로 보내줘.",
        signalId: "urgentTransfer",
      },
    ],
    signals: [
      P(
        "newNumber",
        "갸웃 신호, 새 번호로 접근",
        "가족·지인 사칭형",
        "기존 연락처가 아닌 새 번호로 급한 요청을 보내는 흐름이에요.",
        "가족이나 지인이 갑자기 새 번호로 연락했나요?",
      ),
      P(
        "callAvoidance",
        "갸웃 신호, 통화 확인 회피",
        "통화 확인 회피형",
        "직접 통화 확인을 피하면 실제 가족인지 확인하기 어려워요.",
        "통화 확인을 피하고 메시지만 요구하나요?",
      ),
      P(
        "urgentTransfer",
        "갸웃 신호, 급한 송금 요청",
        "긴급 송금 압박형",
        "급한 결제라는 말로 확인 시간을 줄이는 흐름이에요.",
        "이유를 충분히 설명하지 않고 빨리 송금하라고 하나요?",
      ),
    ],
    clearDescription:
      "새 번호, 통화 회피, 급한 송금 요청이 차례로 붙으면 다른 연락 방법으로 진짜인지 확인하는 게 좋아요.",
  },

  job: {
    categoryId: "job",
    ariaStoryLabel: "알바 제안 이야기",
    stageBadge: "Stage 05",
    stageTitleSuffix: "알바 제안편",
    diaryLabel: "알바 제안편",
    chatHeading: "제안 채널에서 나눈 이야기",
    chatSub: "알바 제안편",
    hintLine: "‘쉽다’, ‘금방’처럼 말풍순 속에 숨어 있는 줄을 하나씩 눌러보세요.",
    paragraphBreakBeforeLineIndex: 2,
    introLines: [
      { delayS: 0.1, text: "쉽게 돈을 벌 수 있다는 알바 제안을 받았다." },
      { delayS: 0.22, text: "업무는 간단하고, 수익은 생각보다 컸다." },
      { delayS: 0.34, text: "처음에는 좋은 기회처럼 보였다." },
      { delayS: 0.46, text: "하지만 조건을 자세히 볼수록, 여우는 조금 갸웃했다." },
    ],
    messages: [
      {
        speaker: "제안자",
        role: "proposalLeft",
        text: "하루 30분만 해도 수익이 나요.",
        signalId: "easyMoney",
      },
      { speaker: "사용자", role: "buyerRight", text: "어떤 일을 하는 건가요?" },
      { speaker: "제안자", role: "proposalLeft", text: "간단한 입출금 확인 업무예요." },
      { speaker: "사용자", role: "buyerRight", text: "제 계좌를 써야 하나요?" },
      {
        speaker: "제안자",
        role: "proposalLeft",
        text: "네. 잠깐만 빌려주시면 수당을 바로 드려요.",
        signalId: "accountUse",
      },
      { speaker: "사용자", role: "buyerRight", text: "계약서나 회사 정보는 볼 수 있나요?" },
      {
        speaker: "제안자",
        role: "proposalLeft",
        text: "그런 건 나중에 안내드릴게요. 먼저 계좌 등록부터 해주세요.",
        signalId: "companyInfoDelay",
      },
    ],
    signals: [
      P(
        "easyMoney",
        "갸웃 신호, 쉬운 고수익 강조",
        "쉬운 고수익 유혹형",
        "업무보다 수익을 먼저 강조해 판단을 흐리게 할 수 있어요.",
        "간단한 일에 비해 수익이 지나치게 크다고 하나요?",
      ),
      P(
        "accountUse",
        "갸웃 신호, 계좌 사용 요구",
        "계좌 대여·입출금 알바형",
        "계좌 제공은 범죄 자금 이동에 악용될 수 있어요.",
        "내 계좌로 입출금하거나 계좌를 빌려달라고 하나요?",
      ),
      P(
        "companyInfoDelay",
        "갸웃 신호, 회사 정보 확인 지연",
        "회사 정보 확인 지연형",
        "회사 정보와 계약 확인을 뒤로 미루면 실제 업체인지 확인하기 어려워요.",
        "회사 정보나 계약서 확인을 뒤로 미루고 있나요?",
      ),
    ],
    clearDescription:
      "쉬운 수익 강조, 계좌 사용, 회사 정보 지연이 세 줄기로 묶이면 제안 속도부터 늦추고 확인하는 게 좋아요.",
  },

  fourCut: {
    categoryId: "fourCut",
    ariaStoryLabel: "특별 일기 장면",
    stageBadge: "Stage Special",
    stageTitleSuffix: "여우의 4컷 일기",
    diaryLabel: "특별 일기",
    chatHeading: "기관 문자처럼 이어진 대화",
    chatSub: "여우의 4컷 일기",
    hintLine: "기관이라는 말투 속에서 패턴 줄만 차례로 눌러보세요.",
    paragraphBreakBeforeLineIndex: null,
    introLines: [
      { delayS: 0.1, text: "여우가 모아 둔 짧은 수상한 순간들을 살펴보는 특별 일기예요." },
      { delayS: 0.3, text: "짧은 장면 속에서 갸웃한 포인트를 찾아보세요." },
    ],
    messages: [
      {
        speaker: "기관",
        role: "sellerLeft",
        text: "법원 등기 관련 안내입니다. 확인이 필요합니다.",
        signalId: "authorityClaim",
      },
      { speaker: "사용자", role: "buyerRight", text: "등기가 온다고요?" },
      {
        speaker: "기관",
        role: "sellerLeft",
        text: "아래 링크에서 온라인 수령을 선택해주세요.",
        signalId: "linkConfirm",
      },
      { speaker: "사용자", role: "buyerRight", text: "링크로 들어가면 되나요?" },
      {
        speaker: "기관",
        role: "sellerLeft",
        text: "본인 확인을 위해 개인정보를 입력해주세요.",
      },
      {
        speaker: "기관",
        role: "sellerLeft",
        text: "오늘 처리하지 않으면 불이익이 생길 수 있습니다.",
        signalId: "penaltyPressure",
      },
    ],
    signals: [
      P(
        "authorityClaim",
        "갸웃 신호, 기관 사칭 분위기",
        "기관 사칭형",
        "공식기관처럼 보이는 말투로 신뢰를 만들 수 있어요.",
        "기관 이름을 앞세워 긴장하게 만들고 있나요?",
      ),
      P(
        "linkConfirm",
        "갸웃 신호, 링크 확인 유도",
        "링크 확인 유도형",
        "링크를 통해 가짜 확인 페이지로 이동시킬 수 있어요.",
        "공식 앱이 아닌 링크로 확인하라고 하나요?",
      ),
      P(
        "penaltyPressure",
        "갸웃 신호, 불이익 압박",
        "공포·불이익 압박형",
        "불이익을 강조하면 급하게 입력하거나 송금하게 될 수 있어요.",
        "지금 처리하지 않으면 문제가 생긴다고 압박하나요?",
      ),
    ],
    clearDescription:
      "기관 안내처럼 보여도 링크·불이익 말까지 겹치면 공식 채널 한 번 더 거쳐 확인하는 게 좋아요.",
  },
};
