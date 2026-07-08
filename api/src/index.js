import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./emailSettings.js";
import { purgeExpiredSessions, requireSessionSecret } from "./auth.js";
import { authRouter } from "./routes/auth.js";
import { managementRouter } from "./routes/management.js";
import { suspectsRouter } from "./routes/suspects.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 3000;

const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const app = express();
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "256kb" }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS"));
    },
    credentials: true,
  }),
);

setInterval(() => purgeExpiredSessions(), 60 * 60 * 1000);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/v1/quiz-retention/events", (_req, res) => {
  res.status(204).end();
});

app.use(
  "/api/v1",
  rateLimit({
    windowMs: 60_000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  suspectsRouter,
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  "/api/v1/management/auth",
  loginLimiter,
  authRouter,
);

app.use("/api/v1/management", managementRouter);

const mgmtStatic = path.join(__dirname, "..", "public");
app.use("/management", express.static(mgmtStatic));
app.get(["/management", "/management/"], (_req, res) => {
  res.sendFile(path.join(mgmtStatic, "index.html"));
});

app.use((err, _req, res, _next) => {
  if (err?.message === "CORS") {
    res.status(403).json({ error: "Origine non autorisée." });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Erreur serveur." });
});

app.listen(port, () => {
  console.log(`API SaaS/IA sur :${port}`);
  try {
    requireSessionSecret();
  } catch (e) {
    console.warn(e.message);
  }
});
