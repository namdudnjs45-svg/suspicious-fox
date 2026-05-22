import mongoose from "mongoose";

/** MongoDB reports 컬렉션 — category, maskedText, createdAt 만 저장합니다 */
const reportSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    maskedText: { type: String, required: true },
    createdAt: { type: Date, required: true },
  },
  { strict: true, strictQuery: false, collection: "reports", versionKey: false },
);

export const Report = mongoose.models.Report ?? mongoose.model("Report", reportSchema);
