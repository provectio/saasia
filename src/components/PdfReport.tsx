import { DualRadarChart } from "@/components/DualRadarChart";
import { ScoreGauge } from "@/components/ScoreGauge";
import { PROVECTIO_LOGO } from "@/data/trust";
import type { AiReport } from "@/lib/api";
import type { LeadFormData } from "@/lib/api";
import type { ScoreResult } from "@/lib/scoring";

interface PdfReportProps {
  scores: ScoreResult;
  aiReport: AiReport;
  form: LeadFormData;
}

function formatDateFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PdfReport({ scores, aiReport, form }: PdfReportProps) {
  const company = form.company.trim() || "Votre organisation";
  const contact = [form.firstname, form.lastname].filter(Boolean).join(" ");

  return (
    <div id="pdf-report" className="pdf-report">
      {/* Page 1 — Garde */}
      <section className="pdf-page pdf-cover">
        <div className="pdf-cover-bg" aria-hidden />
        <img src={PROVECTIO_LOGO} alt="Provectio" className="pdf-cover-logo" />
        <div className="pdf-cover-main">
          <p className="pdf-cover-company">{company}</p>
          <h1 className="pdf-cover-title">Diagnostic SaaS &amp; IA Readiness</h1>
          <p className="pdf-cover-subtitle">
            Votre SI est-il prêt pour le SaaS et l&apos;IA ?
          </p>
          {contact && <p className="pdf-cover-meta">Établi pour {contact}</p>}
          <p className="pdf-cover-date">{formatDateFr(new Date())}</p>
        </div>
        <footer className="pdf-cover-footer">
          <p>
            Provectio SAS — 6 allée Adolphe Bobière, ZAC Atalante Champeaux, 35000 Rennes
          </p>
          <p>
            SIRET : 47786555400059 · TVA : FR15477865554 · 02 21 65 65 65 · bienvenue@provectio.fr
            · www.provectio.fr
          </p>
          <p>Document confidentiel — usage interne et partenaire</p>
        </footer>
      </section>

      {/* Page 2 — Synthèse */}
      <section className="pdf-page pdf-synthesis">
        <header className="pdf-page-header">
          <img src={PROVECTIO_LOGO} alt="" className="pdf-header-logo" />
          <div>
            <p className="pdf-header-kicker">Synthèse</p>
            <h2 className="pdf-header-title">{company}</h2>
          </div>
        </header>

        <p className="pdf-synthesis-lead">{scores.cta.message}</p>

        <div className="pdf-gauges">
          <ScoreGauge
            label="SaaS Readiness"
            percent={scores.saas.percent}
            profileLabel={scores.saas.profileLabel}
            color={scores.saas.profileColor}
            accentColor="#2563eb"
            variant="print"
          />
          <ScoreGauge
            label="IA Readiness"
            percent={scores.ia.percent}
            profileLabel={scores.ia.profileLabel}
            color={scores.ia.profileColor}
            accentColor="#7c3aed"
            variant="print"
          />
        </div>

        <div className="pdf-radar-block">
          <h3 className="pdf-section-title">Radar des 6 axes</h3>
          <DualRadarChart axes={scores.axes} variant="print" />
          <table className="pdf-axis-table">
            <thead>
              <tr>
                <th>Axe</th>
                <th>SaaS</th>
                <th>IA</th>
              </tr>
            </thead>
            <tbody>
              {scores.axes.map((axis) => (
                <tr key={axis.id}>
                  <td>{axis.label}</td>
                  <td>{axis.saasPercent} %</td>
                  <td>{axis.iaPercent} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="pdf-page-footer">
          <span>saas-readiness.provectio.fr</span>
          <span>Page 2 / 3</span>
        </footer>
      </section>

      {/* Page 3 — Rapport personnalisé */}
      <section className="pdf-page pdf-report-page">
        <header className="pdf-page-header">
          <img src={PROVECTIO_LOGO} alt="" className="pdf-header-logo" />
          <div>
            <p className="pdf-header-kicker">Rapport personnalisé</p>
            <h2 className="pdf-header-title">{company}</h2>
          </div>
        </header>

        <p className="pdf-report-summary">{aiReport.summary}</p>

        <h3 className="pdf-section-title">Priorités recommandées</h3>
        <ol className="pdf-priorities">
          {aiReport.priorities.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>

        <div className="pdf-sections">
          {aiReport.sections.map((section, i) => (
            <div key={i} className="pdf-section-block">
              <h4>{section.title}</h4>
              <p>{section.content}</p>
            </div>
          ))}
        </div>

        <div className="pdf-cta-box">
          <p className="pdf-cta-label">Prochaine étape Provectio</p>
          <p className="pdf-cta-offer">{scores.cta.ctaLabel}</p>
          <p className="pdf-cta-detail">{scores.cta.offer}</p>
        </div>

        <footer className="pdf-page-footer">
          <span>saas-readiness.provectio.fr</span>
          <span>Page 3 / 3</span>
        </footer>
      </section>
    </div>
  );
}
