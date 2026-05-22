import {
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import {
  backupFoxReportAfterServerFailure,
  type FoxReportAttachmentSummary,
} from "../data/reportsStorage";
import { maskReportText } from "../utils/maskReportText";
import { apiUrl } from "../utils/apiUrl";

export const FOX_REPORT_CATEGORY_OPTIONS = [
  "보이스피싱",
  "중고거래",
  "티켓거래",
  "가족·지인 사칭",
  "문자 링크",
  "기타",
] as const;

const STORY_PLACEHOLDER = "예시. “법원이라고 전화가 와서 링크를 누르라고 했어요.”";

const EMPTY_PREVIEW_NOTE = "민감정보가 들어가도 여우가 먼저 가려드릴게요.";

const PRIVACY_FOOTNOTE =
  "제보 내용은 사기 예방 사례를 정리하는 데만 사용됩니다. 이름, 전화번호, 계좌번호 같은 개인정보는 입력하지 않는 것이 좋아요.";

const REF_IMAGE_SECTION_TITLE = "참고 사진 첨부하기";
const REF_IMAGE_EMPTY_HINT = "문자나 채팅 캡처가 있다면 함께 올려주세요.";
const REF_IMAGE_PRIVACY = "이름, 전화번호, 계좌번호 등 개인정보는 가리고 올려주세요.";
const MAX_ATTACHMENT_COUNT = 3;
const REF_IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";

const ATTACH_ERR_TYPE =
  "PNG, JPG, JPEG, WEBP 이미지 파일만 첨부할 수 있어요.";
const ATTACH_ERR_MAX = `참고 사진은 최대 ${MAX_ATTACHMENT_COUNT}장까지 첨부할 수 있어요.`;

type AttachedImageRow = {
  id: string;
  file: File;
  previewUrl: string;
};

function isAllowedReferenceImage(file: File): boolean {
  const n = file.name.toLowerCase();
  const extOk =
    n.endsWith(".png") || n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".webp");
  const t = file.type.toLowerCase();
  if (t === "image/png" || t === "image/jpeg" || t === "image/webp") return true;
  if (!t || t === "application/octet-stream") return extOk;
  return false;
}

function toAttachmentSummaries(rows: AttachedImageRow[]): FoxReportAttachmentSummary[] {
  return rows.map((r) => ({
    fileName: r.file.name,
    mimeType: inferReferenceImageMimeType(r.file),
    byteSize: r.file.size,
  }));
}

function inferReferenceImageMimeType(file: File): string {
  const t = file.type.toLowerCase();
  if (t === "image/png" || t === "image/jpeg" || t === "image/webp") return t;
  const n = file.name.toLowerCase();
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

const SAVE_FAIL_PUBLIC =
  "제보를 저장하지 못했어요. 잠시 후 다시 시도해주세요.";

type FoxReportModalProps = {
  open: boolean;
  onClose: () => void;
  /** 카드 목록 등 허브 콘텐츠로 스크롤한 뒤 모달만 닫을 때 */
  onNavigateOtherCases: () => void;
};

export function FoxReportModal({ open, onClose, onNavigateOtherCases }: FoxReportModalProps) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const closeRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<string>("");
  const [storyRaw, setStoryRaw] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachedImages, setAttachedImages] = useState<AttachedImageRow[]>([]);
  const [attachmentFieldError, setAttachmentFieldError] = useState<string | null>(null);

  const maskedPreview = maskReportText(storyRaw);
  const canSubmit =
    FOX_REPORT_CATEGORY_OPTIONS.includes(category as (typeof FOX_REPORT_CATEGORY_OPTIONS)[number]) &&
    storyRaw.trim().length > 0;

  useEffect(() => {
    if (!open) {
      setCategory("");
      setStoryRaw("");
      setSubmitted(false);
      setSubmitting(false);
      setSubmitError(null);
      setAttachmentFieldError(null);
      setAttachedImages((prev) => {
        prev.forEach((row) => URL.revokeObjectURL(row.previewUrl));
        return [];
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  useEffect(() => {
    if (open && !submitted) {
      queueMicrotask(() => closeRef.current?.focus());
    }
  }, [open, submitted]);

  if (!open) return null;

  const attachmentSummaries = toAttachmentSummaries(attachedImages);

  const revokeAndRemoveAttached = (id: string) => {
    setAttachedImages((prev) => {
      const row = prev.find((r) => r.id === id);
      if (row) URL.revokeObjectURL(row.previewUrl);
      return prev.filter((r) => r.id !== id);
    });
    setAttachmentFieldError(null);
  };

  const addFilesFromInput = (list: FileList | null) => {
    if (!list?.length) return;
    setAttachmentFieldError(null);
    let hitTypeError = false;
    let hitMax = false;

    setAttachedImages((prev) => {
      let next = [...prev];
      for (let i = 0; i < list.length; i++) {
        if (next.length >= MAX_ATTACHMENT_COUNT) {
          hitMax = true;
          break;
        }
        const file = list[i];
        if (!isAllowedReferenceImage(file)) {
          hitTypeError = true;
          continue;
        }
        next.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
      return next;
    });

    if (hitMax) setAttachmentFieldError(ATTACH_ERR_MAX);
    else if (hitTypeError) setAttachmentFieldError(ATTACH_ERR_TYPE);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBackdropMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: {
        category: string;
        maskedText: string;
        attachments?: FoxReportAttachmentSummary[];
      } = {
        category,
        maskedText: maskedPreview,
      };
      if (attachmentSummaries.length > 0) payload.attachments = attachmentSummaries;

      const res = await fetch(apiUrl("/api/reports"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data: unknown = {};
      try {
        data = (await res.json()) as unknown;
      } catch {
        data = {};
      }
      const ok = typeof data === "object" && data !== null && (data as { ok?: unknown }).ok === true;
      if (res.ok && ok) {
        setSubmitted(true);
        return;
      }
      setSubmitError(SAVE_FAIL_PUBLIC);
      backupFoxReportAfterServerFailure({
        category,
        maskedText: maskedPreview,
        attachments: attachmentSummaries.length > 0 ? attachmentSummaries : undefined,
      });
    } catch {
      setSubmitError(SAVE_FAIL_PUBLIC);
      backupFoxReportAfterServerFailure({
        category,
        maskedText: maskedPreview,
        attachments: attachmentSummaries.length > 0 ? attachmentSummaries : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fox-reportOverlay" role="presentation" onMouseDown={handleBackdropMouseDown}>
      <div
        className="fox-reportSheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="fox-reportHeader">
          <h2 id={titleId} className="fox-reportTitle">
            여우에게 사례 제보하기
          </h2>
          <button ref={closeRef} type="button" className="fox-reportClose" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </header>

        {!submitted ? (
          <>
            <div className="fox-reportBody">
              <label className="fox-reportLabel" htmlFor={`${baseId}-category`}>
                사기 유형 선택
              </label>
              <select
                id={`${baseId}-category`}
                className="fox-reportSelect"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled hidden>
                  유형을 선택해 주세요
                </option>
                {FOX_REPORT_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <label className="fox-reportLabel" htmlFor={`${baseId}-story`}>
                사례 내용
              </label>
              <textarea
                id={`${baseId}-story`}
                className="fox-reportTextarea"
                placeholder={STORY_PLACEHOLDER}
                value={storyRaw}
                onChange={(e) => setStoryRaw(e.target.value)}
                rows={6}
              />

              <section className="fox-reportAttachSection" aria-labelledby={`${baseId}-attach-heading`}>
                <h3 id={`${baseId}-attach-heading`} className="fox-reportAttachTitle">
                  {REF_IMAGE_SECTION_TITLE}
                </h3>
                {attachedImages.length === 0 ? (
                  <p className="fox-reportAttachHint">{REF_IMAGE_EMPTY_HINT}</p>
                ) : null}
                <p className="fox-reportAttachPrivacy">{REF_IMAGE_PRIVACY}</p>

                <input
                  ref={fileInputRef}
                  id={`${baseId}-attach-input`}
                  type="file"
                  className="fox-reportAttachInput"
                  accept={REF_IMAGE_ACCEPT}
                  multiple
                  onChange={(e) => addFilesFromInput(e.target.files)}
                />

                <div className="fox-reportAttachToolbar">
                  <button
                    type="button"
                    className="fox-reportAttachPickBtn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={attachedImages.length >= MAX_ATTACHMENT_COUNT}
                  >
                    사진 선택
                  </button>
                  {attachedImages.length > 0 ? (
                    <span className="fox-reportAttachCount" aria-live="polite">
                      {attachedImages.length}/{MAX_ATTACHMENT_COUNT}장
                    </span>
                  ) : null}
                </div>

                {attachedImages.length > 0 ? (
                  <ul className="fox-reportAttachList">
                    {attachedImages.map((row) => (
                      <li key={row.id} className="fox-reportAttachItem">
                        <span className="fox-reportAttachThumbWrap">
                          <img
                            src={row.previewUrl}
                            alt=""
                            className="fox-reportAttachThumb"
                            width={56}
                            height={56}
                          />
                        </span>
                        <span className="fox-reportAttachName" title={row.file.name}>
                          {row.file.name}
                        </span>
                        <button
                          type="button"
                          className="fox-reportAttachRemove"
                          onClick={() => revokeAndRemoveAttached(row.id)}
                          aria-label={`${row.file.name} 첨부 삭제`}
                        >
                          삭제
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {attachmentFieldError ? (
                  <p className="fox-reportAttachError" role="alert">
                    {attachmentFieldError}
                  </p>
                ) : null}
              </section>

              <div className="fox-reportPreviewBlock">
                <p className="fox-reportPreviewTitle">마스킹된 제보 미리보기</p>
                <div className="fox-reportPreviewBox" aria-live="polite">
                  {maskedPreview.trim() ? (
                    <span className="fox-reportPreviewText">{maskedPreview}</span>
                  ) : (
                    <span className="fox-reportPreviewEmpty">{EMPTY_PREVIEW_NOTE}</span>
                  )}
                </div>
              </div>

              {submitError ? (
                <p className="fox-reportSubmitError" role="alert">
                  {submitError}
                </p>
              ) : null}

              <p className="fox-reportPrivacy">{PRIVACY_FOOTNOTE}</p>
            </div>

            <div className="fox-reportFooter">
              <button
                type="button"
                className="fox-reportSubmitBtn"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit || submitting}
              >
                {submitting ? "보내는 중…" : "마스킹된 내용으로 제보하기"}
              </button>
            </div>
          </>
        ) : (
          <div className="fox-reportSuccess">
            <p className="fox-reportSuccessLead">제보가 접수되었어요.</p>
            <p className="fox-reportSuccessFollow">
              여우가 비슷한 사례를 더 잘 알아볼 수 있도록 도와주셔서 고마워요.
            </p>
            <div className="fox-reportSuccessActions">
              <button type="button" className="fox-reportGhostBtn" onClick={onNavigateOtherCases}>
                다른 사례 보기
              </button>
              <button type="button" className="fox-reportPrimaryBtn" onClick={onClose}>
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
