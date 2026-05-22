import mongoose from "mongoose";

/** 참고 사진은 MVP에서 메타데이터만 보관합니다(파일 본문은 저장하지 않습니다). */
const attachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    byteSize: { type: Number, required: true },
  },
  { _id: false },
);

/** MongoDB reports 컬렉션 — category, maskedText, createdAt, 선택적 첨부 메타 */
const reportSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    maskedText: { type: String, required: true },
    createdAt: { type: Date, required: true },
    attachments: { type: [attachmentSchema], required: false },
  },
  { strict: true, strictQuery: false, collection: "reports", versionKey: false },
);

export const Report = mongoose.models.Report ?? mongoose.model("Report", reportSchema);
