import { readSession } from "./auth.js";

/** Session complète : mot de passe + 2FA validée. */
export function requireManagementAuth(req, res, next) {
  try {
    const session = readSession(req);
    if (!session) {
      res.status(401).json({ error: "Non authentifié." });
      return;
    }
    if (!session.totpVerified) {
      res.status(403).json({ error: "Validation 2FA requise.", step: "totp" });
      return;
    }
    req.admin = session;
    next();
  } catch (err) {
    console.error(err);
    res.status(503).json({
      error: "Back-office non configuré (SESSION_SECRET manquant sur le serveur).",
    });
  }
}

/** Session partielle après login mot de passe (pour config / vérif 2FA). */
export function requirePartialSession(req, res, next) {
  try {
    const session = readSession(req);
    if (!session) {
      res.status(401).json({ error: "Non authentifié." });
      return;
    }
    req.admin = session;
    next();
  } catch (err) {
    res.status(503).json({
      error: "Back-office non configuré (SESSION_SECRET manquant sur le serveur).",
    });
  }
}
