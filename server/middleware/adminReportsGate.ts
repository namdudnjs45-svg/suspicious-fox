import type { IncomingHttpHeaders } from "node:http";
import type { NextFunction, Request, Response } from "express";

function getAdminSecret(headers: IncomingHttpHeaders): string | undefined {
  const direct = headers["x-admin-reports-key"];
  if (typeof direct === "string") return direct;
  const auth = headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  return undefined;
}

export function adminReportsGate(req: Request, res: Response, next: NextFunction): void {
  const expected = process.env.ADMIN_REPORTS_KEY?.trim();
  if (!expected) {
    res.status(503).json({ ok: false, error: "admin_unconfigured" });
    return;
  }
  const submitted = getAdminSecret(req.headers);
  if (!submitted || submitted !== expected) {
    res.status(403).json({ ok: false, error: "forbidden" });
    return;
  }
  next();
}
