import type { Express, Request, Response } from "express";

import { isAllowedCategory } from "../constants/categories.js";
import { adminReportsGate } from "../middleware/adminReportsGate.js";
import { Report } from "../models/reportModel.js";

const MAX_MASKED_TEXT = 12000;

function sanitizePostBody(raw: unknown): { category?: string; maskedText?: string } {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Partial<{ category: unknown; maskedText: unknown }>;
  return {
    category: typeof o.category === "string" ? o.category : undefined,
    maskedText: typeof o.maskedText === "string" ? o.maskedText : undefined,
  };
}

export function registerReportRoutes(app: Express): void {
  app.post("/api/reports", async (req: Request, res: Response) => {
    try {
      const { category: catIn, maskedText: maskedIn } = sanitizePostBody(req.body);
      const category = typeof catIn === "string" ? catIn.trim() : "";
      const maskedText = typeof maskedIn === "string" ? maskedIn.trim() : "";

      if (!isAllowedCategory(category) || maskedText.length === 0 || maskedText.length > MAX_MASKED_TEXT) {
        res.status(400).json({ ok: false });
        return;
      }

      await Report.create({
        category,
        maskedText,
        createdAt: new Date(),
      });

      res.status(200).json({ ok: true });
    } catch {
      res.status(500).json({ ok: false });
    }
  });

  app.get("/api/reports", adminReportsGate, async (_req: Request, res: Response) => {
    try {
      const docs = await Report.find({}).sort({ createdAt: -1 }).limit(200).lean();

      type LeanRow = { category?: string; maskedText?: string; createdAt?: Date };

      const rows = (docs as LeanRow[]).map(({ category = "", maskedText = "", createdAt }) => ({
        category: String(category),
        maskedText: String(maskedText),
        createdAt: createdAt instanceof Date ? createdAt.toISOString() : new Date(String(createdAt)).toISOString(),
      }));

      res.json(rows);
    } catch {
      res.status(500).json([]);
    }
  });
}
