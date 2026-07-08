import { db } from "./db.js";
import { formatJobFunction } from "./labels.js";

/** Destinataire interne par défaut des notifications de lead */
export const DEFAULT_NOTIFICATION_RECIPIENTS = "marketing@provectio.fr";

function mergeInternalCcForDisplay(row) {
  const seen = new Set();
  const out = [];
  for (const raw of [row.cc_addresses, row.to_addresses]) {
    for (const addr of String(raw ?? "")
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.includes("@"))) {
      const key = addr.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(addr);
      }
    }
  }
  return out.join(", ");
}

const DEFAULT_SUBJECT =
  "Nouveau diagnostic SaaS & IA — {{company}}";

const DEFAULT_BODY = `Bonjour,

Un nouveau diagnostic SaaS & IA vient d'être complété.

Société : {{company}}
Contact : {{firstname}} {{lastname}}
Email : {{email}}
Téléphone : {{phone}}
Fonction : {{companySize}}
Profil : {{profileLabel}}
Score moyen : {{score}}

—
Notification automatique Provectio (destinataire interne uniquement)`;

db.exec(`
  CREATE TABLE IF NOT EXISTS email_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled INTEGER NOT NULL DEFAULT 0,
    smtp_host TEXT NOT NULL DEFAULT '',
    smtp_port INTEGER NOT NULL DEFAULT 587,
    smtp_secure INTEGER NOT NULL DEFAULT 0,
    smtp_user TEXT NOT NULL DEFAULT '',
    smtp_password TEXT NOT NULL DEFAULT '',
    from_address TEXT NOT NULL DEFAULT '',
    to_addresses TEXT NOT NULL DEFAULT '',
    cc_addresses TEXT NOT NULL DEFAULT '',
    subject_template TEXT NOT NULL DEFAULT '',
    body_template TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const existing = db.prepare("SELECT id FROM email_settings WHERE id = 1").get();
if (!existing) {
  db.prepare(
    `INSERT INTO email_settings (
      id, enabled, smtp_port, cc_addresses, subject_template, body_template
    ) VALUES (1, 0, 587, ?, ?, ?)`,
  ).run(DEFAULT_NOTIFICATION_RECIPIENTS, DEFAULT_SUBJECT, DEFAULT_BODY);
}

try {
  db.exec(
    "ALTER TABLE email_settings ADD COLUMN smtp_tls_insecure INTEGER NOT NULL DEFAULT 0",
  );
} catch {
  /* colonne déjà présente */
}

export function getEmailSettingsRow() {
  return db.prepare("SELECT * FROM email_settings WHERE id = 1").get();
}

export function getEmailSettingsPublic() {
  const row = getEmailSettingsRow();
  if (!row) return null;
  return {
    enabled: row.enabled === 1,
    smtpHost: row.smtp_host,
    smtpPort: row.smtp_port,
    smtpSecure: row.smtp_secure === 1,
    smtpTlsInsecure: row.smtp_tls_insecure === 1,
    smtpUser: row.smtp_user,
    smtpPasswordSet: Boolean(row.smtp_password),
    fromAddress: row.from_address,
    ccAddresses: mergeInternalCcForDisplay(row),
    subjectTemplate: row.subject_template,
    bodyTemplate: row.body_template,
    updatedAt: row.updated_at,
  };
}

export function saveEmailSettings(input) {
  const current = getEmailSettingsRow();
  const password =
    input.smtpPassword !== undefined && String(input.smtpPassword).length > 0
      ? String(input.smtpPassword)
      : current.smtp_password;

  db.prepare(
    `UPDATE email_settings SET
      enabled = @enabled,
      smtp_host = @smtp_host,
      smtp_port = @smtp_port,
      smtp_secure = @smtp_secure,
      smtp_tls_insecure = @smtp_tls_insecure,
      smtp_user = @smtp_user,
      smtp_password = @smtp_password,
      from_address = @from_address,
      to_addresses = @to_addresses,
      cc_addresses = @cc_addresses,
      subject_template = @subject_template,
      body_template = @body_template,
      updated_at = datetime('now')
    WHERE id = 1`,
  ).run({
    enabled: input.enabled ? 1 : 0,
    smtp_host: String(input.smtpHost ?? "").trim(),
    smtp_port: Number(input.smtpPort) || 587,
    smtp_secure: input.smtpSecure ? 1 : 0,
    smtp_tls_insecure: input.smtpTlsInsecure ? 1 : 0,
    smtp_user: String(input.smtpUser ?? "").trim(),
    smtp_password: password,
    from_address: String(input.fromAddress ?? "").trim(),
    to_addresses: "",
    cc_addresses: String(input.ccAddresses ?? "").trim(),
    subject_template: String(input.subjectTemplate ?? DEFAULT_SUBJECT).trim(),
    body_template: String(input.bodyTemplate ?? DEFAULT_BODY).trim(),
  });

  return getEmailSettingsPublic();
}

export function getEmailSettingsForSend() {
  const row = getEmailSettingsRow();
  if (!row || row.enabled !== 1) return null;
  if (!row.smtp_host || !row.smtp_user || !row.smtp_password) {
    return null;
  }
  return row;
}

export function renderTemplate(template, vars) {
  return String(template).replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = vars[key];
    return value == null ? "" : String(value);
  });
}

export function buildLeadTemplateVars(lead) {
  return {
    firstname: lead.firstname,
    lastname: lead.lastname,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    companySize: formatJobFunction(lead.company_size),
    companySizeRaw: lead.company_size,
    score: lead.raw_score,
    profileLabel: lead.profile_label,
    profile: lead.profile,
    leadId: lead.id,
  };
}
