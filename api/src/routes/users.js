import { Router } from "express";
import {
  findUserByUsername,
  hashPassword,
  verifyPassword,
} from "../auth.js";
import { db } from "../db.js";
import { requireManagementAuth } from "../middleware.js";

export const usersRouter = Router();

usersRouter.use(requireManagementAuth);

function rowToUser(row) {
  return {
    id: row.id,
    username: row.username,
    totpEnabled: row.totp_enabled === 1,
    createdAt: row.created_at,
  };
}

function validatePassword(password) {
  if (!password || String(password).length < 10) {
    return "Le mot de passe doit contenir au moins 10 caractères.";
  }
  return null;
}

usersRouter.get("/", (_req, res) => {
  const rows = db
    .prepare("SELECT id, username, totp_enabled, created_at FROM admin_users ORDER BY username")
    .all();
  res.json({ items: rows.map(rowToUser) });
});

usersRouter.post("/", (req, res) => {
  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (!username || username.length < 2) {
    res.status(400).json({ error: "Identifiant invalide (min. 2 caractères)." });
    return;
  }

  const pwdErr = validatePassword(password);
  if (pwdErr) {
    res.status(400).json({ error: pwdErr });
    return;
  }

  if (findUserByUsername(username)) {
    res.status(409).json({ error: "Cet identifiant existe déjà." });
    return;
  }

  const result = db
    .prepare(
      "INSERT INTO admin_users (username, password_hash, totp_enabled) VALUES (?, ?, 0)",
    )
    .run(username, hashPassword(password));

  const row = db
    .prepare("SELECT id, username, totp_enabled, created_at FROM admin_users WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(rowToUser(row));
});

usersRouter.post("/me/reset-2fa", (req, res) => {
  const password = String(req.body?.password ?? "");
  const user = db.prepare("SELECT * FROM admin_users WHERE id = ?").get(req.admin.userId);

  if (!user || !verifyPassword(user, password)) {
    res.status(401).json({ error: "Mot de passe incorrect." });
    return;
  }

  db.prepare(
    "UPDATE admin_users SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?",
  ).run(user.id);

  db.prepare("DELETE FROM admin_sessions WHERE user_id = ?").run(user.id);

  res.json({
    ok: true,
    logout: true,
    message: "2FA réinitialisée. Reconnectez-vous pour configurer un nouveau code.",
  });
});

usersRouter.patch("/:id/password", (req, res) => {
  const id = Number(req.params.id);
  const password = String(req.body?.password ?? "");
  const pwdErr = validatePassword(password);
  if (pwdErr) {
    res.status(400).json({ error: pwdErr });
    return;
  }

  const user = db.prepare("SELECT id FROM admin_users WHERE id = ?").get(id);
  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable." });
    return;
  }

  db.prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?").run(
    hashPassword(password),
    id,
  );
  db.prepare("DELETE FROM admin_sessions WHERE user_id = ?").run(id);
  res.json({ ok: true });
});

usersRouter.post("/:id/reset-2fa", (req, res) => {
  const id = Number(req.params.id);
  const user = db.prepare("SELECT id FROM admin_users WHERE id = ?").get(id);
  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable." });
    return;
  }

  db.prepare(
    "UPDATE admin_users SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?",
  ).run(id);
  db.prepare("DELETE FROM admin_sessions WHERE user_id = ?").run(id);

  res.json({
    ok: true,
    message: "2FA réinitialisée. L'utilisateur devra la reconfigurer à la prochaine connexion.",
  });
});

usersRouter.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (id === req.admin.userId) {
    res.status(400).json({ error: "Vous ne pouvez pas supprimer votre propre compte." });
    return;
  }

  const total = db.prepare("SELECT COUNT(*) AS c FROM admin_users").get().c;
  if (total <= 1) {
    res.status(400).json({ error: "Impossible de supprimer le dernier compte administrateur." });
    return;
  }

  const user = db.prepare("SELECT id FROM admin_users WHERE id = ?").get(id);
  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable." });
    return;
  }

  db.prepare("DELETE FROM admin_users WHERE id = ?").run(id);
  res.json({ ok: true });
});
