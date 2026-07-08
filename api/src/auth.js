import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { db } from "./db.js";

authenticator.options = { window: 1 };

const SESSION_COOKIE = "mgmt_session";
const SESSION_HOURS = 8;

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function requireSessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET manquant ou trop court (min. 32 caractères). Générer : openssl rand -hex 32",
    );
  }
  return secret;
}

function signSid(sid) {
  const secret = requireSessionSecret();
  const sig = crypto.createHmac("sha256", secret).update(sid).digest("hex");
  return `${sid}.${sig}`;
}

function verifySignedCookie(value) {
  if (!value || !value.includes(".")) return null;
  const [sid, sig] = value.split(".");
  if (!sid || !sig) return null;
  const secret = requireSessionSecret();
  const expected = crypto.createHmac("sha256", secret).update(sid).digest("hex");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }
  return sid;
}

export function readSession(req) {
  const raw = req.cookies?.[SESSION_COOKIE];
  const sid = verifySignedCookie(raw);
  if (!sid) return null;

  const row = db
    .prepare(
      `SELECT s.sid, s.user_id, s.totp_verified, s.expires_at, u.username, u.totp_enabled, u.totp_secret
       FROM admin_sessions s
       JOIN admin_users u ON u.id = s.user_id
       WHERE s.sid = ?`,
    )
    .get(sid);

  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    destroySession(sid);
    return null;
  }

  return {
    sid: row.sid,
    userId: row.user_id,
    username: row.username,
    totpVerified: row.totp_verified === 1,
    totpEnabled: row.totp_enabled === 1,
    totpSecret: row.totp_secret,
  };
}

export function createSession(res, userId, { totpVerified = false } = {}) {
  const sid = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000).toISOString();

  db.prepare(
    "INSERT INTO admin_sessions (sid, user_id, expires_at, totp_verified) VALUES (?, ?, ?, ?)",
  ).run(sid, userId, expiresAt, totpVerified ? 1 : 0);

  const secure = process.env.NODE_ENV === "production";
  res.cookie(SESSION_COOKIE, signSid(sid), {
    httpOnly: true,
    secure,
    sameSite: "strict",
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
    path: "/",
  });

  return sid;
}

export function setSessionTotpVerified(sid) {
  db.prepare("UPDATE admin_sessions SET totp_verified = 1 WHERE sid = ?").run(sid);
}

export function destroySession(sid) {
  if (sid) {
    db.prepare("DELETE FROM admin_sessions WHERE sid = ?").run(sid);
  }
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export function purgeExpiredSessions() {
  db.prepare("DELETE FROM admin_sessions WHERE datetime(expires_at) < datetime('now')").run();
}

export function findUserByUsername(username) {
  return db
    .prepare("SELECT * FROM admin_users WHERE username = ? COLLATE NOCASE")
    .get(username.trim());
}

export function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 12);
}

export function generateTotpSecret() {
  return authenticator.generateSecret();
}

export function totpKeyUri(username, secret) {
  const issuer = "Provectio Diag Infogerance";
  return authenticator.keyuri(username, issuer, secret);
}

export function verifyTotpCode(secret, token) {
  return authenticator.verify({ token: String(token).replace(/\s/g, ""), secret });
}

export function enableTotp(userId, secret) {
  db.prepare(
    "UPDATE admin_users SET totp_secret = ?, totp_enabled = 1 WHERE id = ?",
  ).run(secret, userId);
}
