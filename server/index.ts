import path from "node:path";

import cors from "cors";
import express from "express";

import { connectMongo } from "./db/connectMongo.js";
import { registerReportRoutes } from "./routes/reportRoutes.js";

const app = express();
const PORT = Number(process.env.PORT) || 8787;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

app.use(cors());

app.use(express.json({ limit: "48kb" }));

registerReportRoutes(app);

const distPath = path.resolve(process.cwd(), "dist");
const indexHtml = path.join(distPath, "index.html");

async function bootstrap(): Promise<void> {
  await connectMongo();

  if (IS_PRODUCTION && process.env.DISABLE_STATIC !== "1") {
    app.use(express.static(distPath));
    app.get(/^(?!\/api(?:\/|$)).*$/u, (_req, res, next) => {
      void res.sendFile(indexHtml, (err) => (err !== null && err !== undefined ? next(err) : undefined));
    });
  }

  app.listen(PORT, () => {
    console.warn(`[sf-server] listening on ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
