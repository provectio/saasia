import { Router } from "express";
import { getEmailSettingsPublic, saveEmailSettings } from "../emailSettings.js";
import { formatSmtpError, sendTestEmail } from "../mail.js";
import { requireManagementAuth } from "../middleware.js";

export const settingsRouter = Router();

settingsRouter.use(requireManagementAuth);

settingsRouter.get("/email", (_req, res) => {
  res.json(getEmailSettingsPublic());
});

settingsRouter.put("/email", (req, res) => {
  const body = req.body ?? {};

  if (body.enabled) {
    if (!String(body.smtpHost ?? "").trim()) {
      res.status(400).json({ error: "Serveur SMTP requis." });
      return;
    }
    if (!String(body.smtpUser ?? "").trim()) {
      res.status(400).json({ error: "Utilisateur SMTP requis." });
      return;
    }
    const pwdProvided = String(body.smtpPassword ?? "").length > 0;
    const pwdStored = getEmailSettingsPublic()?.smtpPasswordSet;
    if (!pwdProvided && !pwdStored) {
      res.status(400).json({ error: "Mot de passe SMTP requis." });
      return;
    }
  }

  const saved = saveEmailSettings({
    enabled: Boolean(body.enabled),
    smtpHost: body.smtpHost,
    smtpPort: body.smtpPort,
    smtpSecure: Boolean(body.smtpSecure),
    smtpTlsInsecure: Boolean(body.smtpTlsInsecure),
    smtpUser: body.smtpUser,
    smtpPassword: body.smtpPassword,
    fromAddress: body.fromAddress,
    ccAddresses: body.ccAddresses,
    subjectTemplate: body.subjectTemplate,
    bodyTemplate: body.bodyTemplate,
  });

  res.json(saved);
});

settingsRouter.post("/email/test", async (req, res) => {
  try {
    const testTo = String(req.body?.testTo ?? "").trim();
    await sendTestEmail(testTo || undefined);
    res.json({ ok: true, message: "E-mail de test envoyé." });
  } catch (err) {
    console.error("Test SMTP:", err);
    res.status(400).json({
      error: formatSmtpError(err),
    });
  }
});
