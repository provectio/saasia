import { Router } from "express";
import { db, iaProfileLabel, profileFromPercent } from "../db.js";
import { sendLeadNotificationEmail } from "../mail.js";

export const suspectsRouter = Router();

function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

suspectsRouter.post("/suspects", (req, res) => {
  const body = req.body ?? {};
  const sourceType = String(body.type ?? "saasia");
  const isSaasia = sourceType === "saasia";

  const email = String(body.mail ?? body.email ?? "").trim().toLowerCase();
  const firstname = String(body.firstname ?? "").trim();
  const lastname = String(body.lastname ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const company = String(body.company ?? "").trim();
  const jobFunction = String(body.fonction ?? body.jobFunction ?? "").trim();
  const utmSource = String(body.utmSource ?? body.utm_source ?? "").trim();

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Email invalide." });
    return;
  }
  if (!firstname || !lastname) {
    res.status(400).json({ error: "Prénom et nom obligatoires." });
    return;
  }
  if (!isSaasia && !phone) {
    res.status(400).json({ error: "Téléphone obligatoire." });
    return;
  }
  if (!company) {
    res.status(400).json({ error: "Société obligatoire." });
    return;
  }
  if (isSaasia && !jobFunction) {
    res.status(400).json({ error: "Fonction obligatoire." });
    return;
  }

  const percentSaas = Number(body.percentSaas ?? body.percent_saas ?? 0);
  const percentIa = Number(body.percentIa ?? body.percent_ia ?? 0);
  const rawScoreSaas = Number(body.rawScoreSaas ?? body.raw_score_saas ?? 0);
  const rawScoreIa = Number(body.rawScoreIa ?? body.raw_score_ia ?? 0);
  const ctaProfile = String(body.ctaProfile ?? body.cta_profile ?? "").trim();

  const saasMeta = profileFromPercent(percentSaas);
  const iaLabel = iaProfileLabel(percentIa);

  const rawScore = isSaasia
    ? Math.round((percentSaas + percentIa) / 2)
    : Number(body.rawScore ?? body.raw_score ?? 0);

  const scoreCode = isSaasia
    ? `saas:${body.scoreSaas ?? saasMeta.scoreCode}|ia:${body.scoreIa ?? profileFromPercent(percentIa).scoreCode}`
    : String(body.score ?? profileFromPercent(rawScore).scoreCode);

  const profile = isSaasia ? saasMeta.profile : profileFromPercent(rawScore).profile;
  const profileLabel = isSaasia
    ? `SaaS ${percentSaas}% (${saasMeta.profileLabel}) — IA ${percentIa}% (${iaLabel})`
    : profileFromPercent(rawScore).profileLabel;

  const axisScores = parseJson(body.axisScores ?? body.axis_scores, {});
  const responses = parseJson(body.reponses ?? body.responses, []);

  const stmt = db.prepare(`
    INSERT INTO leads (
      email, firstname, lastname, phone, company, company_size,
      raw_score, score_code, profile, profile_label,
      axis_scores, responses, source_type
    ) VALUES (
      @email, @firstname, @lastname, @phone, @company, @company_size,
      @raw_score, @score_code, @profile, @profile_label,
      @axis_scores, @responses, @source_type
    )
  `);

  const result = stmt.run({
    email,
    firstname,
    lastname,
    phone,
    company,
    company_size: isSaasia ? jobFunction : String(body.nbSalaries ?? body.companySize ?? "").trim(),
    raw_score: rawScore,
    score_code: scoreCode,
    profile,
    profile_label: profileLabel,
    axis_scores: JSON.stringify({
      ...axisScores,
      ...(isSaasia
        ? {
            percentSaas,
            percentIa,
            rawScoreSaas,
            rawScoreIa,
            ctaProfile,
            utmSource,
          }
        : {}),
    }),
    responses: JSON.stringify(responses),
    source_type: sourceType,
  });

  const leadId = result.lastInsertRowid;
  const leadRow = db.prepare("SELECT * FROM leads WHERE id = ?").get(leadId);

  res.status(201).json({ id: leadId, ok: true });

  void sendLeadNotificationEmail(leadRow).catch((err) => {
    console.error("Envoi e-mail lead #" + leadId + ":", err.message);
  });
});
