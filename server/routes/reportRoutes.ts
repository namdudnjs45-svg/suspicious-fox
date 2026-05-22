import type { Express, Request, Response } from "express";

import { isAllowedCategory } from "../constants/categories.js";
import { adminReportsGate } from "../middleware/adminReportsGate.js";
import { Report } from "../models/reportModel.js";

const MAX_MASKED_TEXT = 12000;
const MAX_ATTACHMENTS = 3;
const MAX_FILE_NAME_LEN = 240;
/** 본문은 저장하지 않지만 비정상적으로 큰 값은 거절합니다 */
const MAX_ATTACHMENT_BYTE_SIZE = 25 * 1024 * 1024;

const ALLOWED_IMAGE_MIMES = new Set(["image/png", "image/jpeg", "image/webp"]);

export type ReportAttachmentMeta = {
  fileName: string;
  mimeType: string;
  byteSize: number;
};

function readCategoryAndMaskedText(raw: unknown): { category?: string; maskedText?: string } {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Partial<{ category: unknown; maskedText: unknown }>;
  return {
    category: typeof o.category === "string" ? o.category : undefined,
    maskedText: typeof o.maskedText === "string" ? o.maskedText : undefined,
  };
}

function parseAttachmentMetas(raw: unknown): ReportAttachmentMeta[] | null | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw)) return null;
  if (raw.length > MAX_ATTACHMENTS) return null;

  const out: ReportAttachmentMeta[] = [];
  for (const el of raw) {
    if (typeof el !== "object" || el === null || Array.isArray(el)) return null;
    const o = el as Record<string, unknown>;
    const fileName = typeof o.fileName === "string" ? o.fileName.trim() : "";
    const mimeType = typeof o.mimeType === "string" ? o.mimeType.trim().toLowerCase() : "";
    const byteSize = typeof o.byteSize === "number" && Number.isFinite(o.byteSize) ? o.byteSize : NaN;

    if (
      fileName.length === 0 ||
      fileName.length > MAX_FILE_NAME_LEN ||
      !ALLOWED_IMAGE_MIMES.has(mimeType) ||
      !Number.isInteger(byteSize) ||
      byteSize < 0 ||
      byteSize > MAX_ATTACHMENT_BYTE_SIZE
    ) {
      return null;
    }

    out.push({ fileName, mimeType, byteSize });
  }
  return out;
}

export function registerReportRoutes(app: Express): void {
  app.post("/api/reports", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const attachmentsRaw =
        body !== null && typeof body === "object" && !Array.isArray(body)
          ? (body as { attachments?: unknown }).attachments
          : undefined;
      const attachmentsParsed = parseAttachmentMetas(attachmentsRaw);
      if (attachmentsParsed === null) {
        res.status(400).json({ ok: false });
        return;
      }

      const { category: catIn, maskedText: maskedIn } = readCategoryAndMaskedText(body);
      const category = typeof catIn === "string" ? catIn.trim() : "";
      const maskedText = typeof maskedIn === "string" ? maskedIn.trim() : "";
      const attachments =
        attachmentsParsed !== undefined && attachmentsParsed.length > 0 ? attachmentsParsed : undefined;

      if (!isAllowedCategory(category) || maskedText.length === 0 || maskedText.length > MAX_MASKED_TEXT) {
        res.status(400).json({ ok: false });
        return;
      }

      await Report.create({
        category,
        maskedText,
        createdAt: new Date(),
        ...(attachments && attachments.length > 0 ? { attachments } : {}),
      });

      res.status(200).json({ ok: true });
    } catch {
      res.status(500).json({ ok: false });
    }
  });

  app.get("/api/reports", adminReportsGate, async (_req: Request, res: Response) => {
    try {
      const docs = await Report.find({}).sort({ createdAt: -1 }).limit(200).lean();

      type LeanAttachment = { fileName?: string; mimeType?: string; byteSize?: number };
      type LeanRow = {
        category?: string;
        maskedText?: string;
        createdAt?: Date;
        attachments?: LeanAttachment[];
      };

      const rows = (docs as LeanRow[]).map(({ category = "", maskedText = "", createdAt, attachments }) => ({
        category: String(category),
        maskedText: String(maskedText),
        createdAt: createdAt instanceof Date ? createdAt.toISOString() : new Date(String(createdAt)).toISOString(),
        attachments: Array.isArray(attachments)
          ? attachments
              .filter(
                (a): a is Required<LeanAttachment> =>
                  typeof a === "object" &&
                  a !== null &&
                  typeof a.fileName === "string" &&
                  typeof a.mimeType === "string" &&
                  typeof a.byteSize === "number",
              )
              .map((a) => ({
                fileName: a.fileName,
                mimeType: a.mimeType,
                byteSize: a.byteSize,
              }))
          : undefined,
      }));

      res.json(rows);
    } catch {
      res.status(500).json([]);
    }
  });
}
