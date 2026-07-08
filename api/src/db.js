import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "leads.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    email TEXT NOT NULL,
    firstname TEXT NOT NULL DEFAULT '',
    lastname TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    company TEXT NOT NULL DEFAULT '',
    company_size TEXT NOT NULL DEFAULT '',
    raw_score INTEGER NOT NULL,
    score_code TEXT NOT NULL,
    profile TEXT NOT NULL,
    profile_label TEXT NOT NULL,
    axis_scores TEXT NOT NULL,
    responses TEXT NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'saasia'
  );

  CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    totp_secret TEXT,
    totp_enabled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    sid TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    totp_verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);
`);

export function profileFromScore(rawScore) {
  const total = Number(rawScore) || 0;
  if (total <= 35) {
    return { profile: "fragile", profileLabel: "Fragile", scoreCode: "1" };
  }
  if (total <= 65) {
    return { profile: "perfectible", profileLabel: "Perfectible", scoreCode: "2" };
  }
  return { profile: "maitrise", profileLabel: "Maîtrisé", scoreCode: "3" };
}

export function profileFromPercent(percent) {
  return profileFromScore(Number(percent) || 0);
}

export function iaProfileLabel(percent) {
  const p = Number(percent) || 0;
  if (p <= 35) return "Non prêt";
  if (p <= 65) return "Presque prêt";
  return "Prêt pour l'IA";
}

function bootstrapAdmin() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM admin_users").get().c;
  if (count > 0) return;

  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    console.warn(
      "Aucun compte admin : définir ADMIN_USERNAME et ADMIN_PASSWORD au premier démarrage.",
    );
    return;
  }

  const hash = bcrypt.hashSync(password, 12);
  db.prepare(
    "INSERT INTO admin_users (username, password_hash, totp_enabled) VALUES (?, ?, 0)",
  ).run(username, hash);
  console.log(`Compte admin créé : ${username} (activez la 2FA à la première connexion).`);
}

bootstrapAdmin();
