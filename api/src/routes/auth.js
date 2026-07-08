import { Router } from "express";
import {
  clearSessionCookie,
  createSession,
  destroySession,
  enableTotp,
  findUserByUsername,
  generateTotpSecret,
  readSession,
  setSessionTotpVerified,
  totpKeyUri,
  verifyPassword,
  verifyTotpCode,
} from "../auth.js";
import { db } from "../db.js";
import { requirePartialSession } from "../middleware.js";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (!username || !password) {
    res.status(400).json({ error: "Identifiant et mot de passe requis." });
    return;
  }

  const user = findUserByUsername(username);
  if (!user || !verifyPassword(user, password)) {
    res.status(401).json({ error: "Identifiant ou mot de passe incorrect." });
    return;
  }

  const existing = readSession(req);
  if (existing?.sid) destroySession(existing.sid);

  createSession(res, user.id, { totpVerified: false });

  if (!user.totp_enabled) {
    const secret = generateTotpSecret();
    db.prepare("UPDATE admin_users SET totp_secret = ? WHERE id = ?").run(secret, user.id);
    res.json({
      step: "totp-setup",
      otpauthUrl: totpKeyUri(user.username, secret),
      message: "Configurez l’authentification à deux facteurs (application type Google Authenticator).",
    });
    return;
  }

  res.json({ step: "totp", message: "Saisissez le code à 6 chiffres de votre application 2FA." });
});

authRouter.post("/totp/verify", requirePartialSession, (req, res) => {
  const code = String(req.body?.code ?? "").trim();
  const session = req.admin;

  const user = db.prepare("SELECT * FROM admin_users WHERE id = ?").get(session.userId);
  if (!user?.totp_secret) {
    res.status(400).json({ error: "2FA non configurée." });
    return;
  }

  if (!verifyTotpCode(user.totp_secret, code)) {
    res.status(401).json({ error: "Code 2FA invalide." });
    return;
  }

  if (!user.totp_enabled) {
    enableTotp(user.id, user.totp_secret);
  }

  setSessionTotpVerified(session.sid);
  res.json({ ok: true, step: "ready" });
});

authRouter.get("/totp/setup", requirePartialSession, (req, res) => {
  const user = db.prepare("SELECT * FROM admin_users WHERE id = ?").get(req.admin.userId);
  if (!user?.totp_secret) {
    res.status(400).json({ error: "Secret 2FA introuvable. Reconnectez-vous." });
    return;
  }
  res.json({
    otpauthUrl: totpKeyUri(user.username, user.totp_secret),
    totpEnabled: user.totp_enabled === 1,
  });
});

authRouter.post("/logout", (req, res) => {
  const session = readSession(req);
  if (session?.sid) destroySession(session.sid);
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", (req, res) => {
  try {
    const session = readSession(req);
    if (!session) {
      res.status(401).json({ error: "Non authentifié." });
      return;
    }
    res.json({
      id: session.userId,
      username: session.username,
      totpVerified: session.totpVerified,
      totpEnabled: session.totpEnabled,
    });
  } catch {
    res.status(503).json({ error: "Configuration serveur incomplète." });
  }
});
