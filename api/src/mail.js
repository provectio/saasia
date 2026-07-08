import nodemailer from "nodemailer";
import {
  buildLeadTemplateVars,
  DEFAULT_NOTIFICATION_RECIPIENTS,
  getEmailSettingsForSend,
  renderTemplate,
} from "./emailSettings.js";

function parseAddressList(value) {
  return String(value)
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => s.includes("@"));
}

function uniqueAddresses(list) {
  return [...new Set(list)];
}

/** Destinataires internes Provectio (jamais l'e-mail du prospect). */
export function getNotificationRecipients(config) {
  const list = uniqueAddresses([
    ...parseAddressList(config.cc_addresses),
    ...parseAddressList(config.to_addresses),
  ]);
  if (list.length) return list;
  return parseAddressList(DEFAULT_NOTIFICATION_RECIPIENTS);
}

/** @deprecated Utiliser getNotificationRecipients */
export function getInternalCcAddresses(config) {
  return getNotificationRecipients(config);
}

function createTransporter(row) {
  const options = {
    host: row.smtp_host,
    port: row.smtp_port,
    secure: row.smtp_secure === 1,
    auth: {
      user: row.smtp_user,
      pass: row.smtp_password,
    },
  };

  if (row.smtp_tls_insecure === 1) {
    options.tls = { rejectUnauthorized: false };
  }

  return nodemailer.createTransport(options);
}

export function formatSmtpError(err) {
  const msg = String(err?.message ?? err ?? "");
  if (
    msg.includes("certificate") ||
    msg.includes("UNABLE_TO_VERIFY_LEAF_SIGNATURE") ||
    err?.code === "ESOCKET"
  ) {
    return "Certificat TLS non reconnu par le serveur. Cochez « Ne pas vérifier le certificat TLS » dans la configuration SMTP (relai interne), ou vérifiez le port (587 STARTTLS vs 465 SSL).";
  }
  return msg || "Échec de l'envoi SMTP.";
}

export async function sendLeadNotificationEmail(lead) {
  const config = getEmailSettingsForSend();
  if (!config) {
    return { ok: false, skipped: true, reason: "email_disabled_or_incomplete" };
  }

  const vars = buildLeadTemplateVars(lead);
  const subject = renderTemplate(config.subject_template, vars);
  const text = renderTemplate(config.body_template, vars);
  const from = config.from_address || config.smtp_user;
  const to = getNotificationRecipients(config);

  if (!to.length) {
    return { ok: false, skipped: true, reason: "no_notification_recipients" };
  }

  const transporter = createTransporter(config);
  await transporter.sendMail({
    from,
    to: to.join(", "),
    subject,
    text,
  });

  return { ok: true };
}

export async function sendTestEmail(testTo) {
  const config = getEmailSettingsForSend();
  if (!config) {
    throw new Error("Configuration incomplète ou notifications désactivées.");
  }

  const to = testTo
    ? parseAddressList(testTo)
    : getNotificationRecipients(config);
  if (!to.length) {
    throw new Error(
      "Indiquez une adresse de test ou configurez un destinataire interne (ex. marketing@provectio.fr).",
    );
  }

  const transporter = createTransporter(config);
  await transporter.sendMail({
    from: config.from_address || config.smtp_user,
    to: to.join(", "),
    subject: "Test — Diagnostic SaaS & IA Provectio",
    text: "Ceci est un e-mail de test envoyé depuis le back-office du diagnostic SaaS & IA.",
  });

  return { ok: true };
}
