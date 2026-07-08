import { Router } from "express";
import { db } from "../db.js";
import { requireManagementAuth } from "../middleware.js";
import { formatJobFunction } from "../labels.js";
import { formatResponses } from "../questions.js";
import { settingsRouter } from "./settings.js";
import { usersRouter } from "./users.js";

export const managementRouter = Router();

managementRouter.use("/users", usersRouter);
managementRouter.use("/settings", settingsRouter);

managementRouter.use(requireManagementAuth);

function rowToLead(row, { includeFormatted = false } = {}) {
  const responses = JSON.parse(row.responses);
  const lead = {
    id: row.id,
    createdAt: row.created_at,
    email: row.email,
    firstname: row.firstname,
    lastname: row.lastname,
    phone: row.phone,
    company: row.company,
    companySize: row.company_size,
    companySizeLabel: formatJobFunction(row.company_size),
    rawScore: row.raw_score,
    scoreCode: row.score_code,
    profile: row.profile,
    profileLabel: row.profile_label,
    axisScores: JSON.parse(row.axis_scores),
    responses,
    sourceType: row.source_type,
  };
  if (includeFormatted) {
    lead.formattedResponses = formatResponses(responses);
  }
  return lead;
}

managementRouter.get("/leads", (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const q = String(req.query.q ?? "").trim().toLowerCase();

  let rows;
  let total;

  if (q) {
    const pattern = `%${q}%`;
    total = db
      .prepare(
        `SELECT COUNT(*) AS c FROM leads
         WHERE lower(email) LIKE ? OR lower(company) LIKE ?
           OR lower(firstname) LIKE ? OR lower(lastname) LIKE ?`,
      )
      .get(pattern, pattern, pattern, pattern).c;

    rows = db
      .prepare(
        `SELECT * FROM leads
         WHERE lower(email) LIKE ? OR lower(company) LIKE ?
           OR lower(firstname) LIKE ? OR lower(lastname) LIKE ?
         ORDER BY datetime(created_at) DESC
         LIMIT ? OFFSET ?`,
      )
      .all(pattern, pattern, pattern, pattern, limit, offset);
  } else {
    total = db.prepare("SELECT COUNT(*) AS c FROM leads").get().c;
    rows = db
      .prepare(
        "SELECT * FROM leads ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?",
      )
      .all(limit, offset);
  }

  res.json({
    total,
    limit,
    offset,
    items: rows.map((row) => rowToLead(row)),
  });
});

managementRouter.get("/leads/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM leads WHERE id = ?")
    .get(Number(req.params.id));

  if (!row) {
    res.status(404).json({ error: "Formulaire introuvable." });
    return;
  }

  res.json(rowToLead(row, { includeFormatted: true }));
});

managementRouter.get("/leads-export.csv", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM leads ORDER BY datetime(created_at) DESC")
    .all();

  const header = [
    "id",
    "date",
    "email",
    "prenom",
    "nom",
    "telephone",
    "societe",
    "fonction",
    "score_moyen",
    "profil",
    "saas_pct",
    "ia_pct",
    "cta",
    "utm",
    "infra",
    "identites",
    "gouvernance",
    "conformite",
    "competences",
    "pilotage",
  ];

  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const lines = [header.join(";")];
  for (const row of rows) {
    const axes = JSON.parse(row.axis_scores);
    const axisValue = (id) => {
      const v = axes[id];
      if (v && typeof v === "object") return `S${v.saas ?? ""}/I${v.ia ?? ""}`;
      return v ?? "";
    };
    lines.push(
      [
        row.id,
        row.created_at,
        row.email,
        row.firstname,
        row.lastname,
        row.phone,
        row.company,
        formatJobFunction(row.company_size),
        row.raw_score,
        row.profile_label,
        axes.percentSaas ?? "",
        axes.percentIa ?? "",
        axes.ctaProfile ?? "",
        axes.utmSource ?? "",
        axisValue("infra"),
        axisValue("identites"),
        axisValue("gouvernance"),
        axisValue("conformite"),
        axisValue("competences"),
        axisValue("pilotage"),
      ]
        .map(escape)
        .join(";"),
    );
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="leads-saasia.csv"',
  );
  res.send("\uFEFF" + lines.join("\n"));
});

managementRouter.get("/stats", (_req, res) => {
  const total = db.prepare("SELECT COUNT(*) AS c FROM leads").get().c;
  const last7 = db
    .prepare(
      `SELECT COUNT(*) AS c FROM leads
       WHERE datetime(created_at) >= datetime('now', '-7 days')`,
    )
    .get().c;
  const byProfile = db
    .prepare(
      `SELECT profile_label AS label, COUNT(*) AS count
       FROM leads GROUP BY profile_label ORDER BY count DESC`,
    )
    .all();

  res.json({ total, last7, byProfile });
});
