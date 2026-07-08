import { fetchWithTimeout } from "@/lib/fetch";
import { phoneDigits } from "@/lib/phone";
import type { ScoreResult } from "@/lib/scoring";
import { buildScoreCode } from "@/lib/scoring";
import type { QuizAnswer } from "@/lib/scoring";
import { DEFAULT_UTM_SOURCE } from "@/data/legal";

export function isApiConfigured(): boolean {
  const url = import.meta.env.PUBLIC_API_BASE_URL?.trim();
  return Boolean(url);
}

export function getApiBase(): string | null {
  const fromEnv = import.meta.env.PUBLIC_API_BASE_URL?.trim();
  if (!fromEnv) return null;
  return fromEnv.replace(/\/$/, "");
}

export function getUtmSource(): string {
  if (typeof window === "undefined") return DEFAULT_UTM_SOURCE;
  const params = new URLSearchParams(window.location.search);
  return params.get("utm_source")?.trim() || DEFAULT_UTM_SOURCE;
}

export interface LeadFormData {
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  company: string;
  jobFunction: string;
}

export interface SubmitPayload {
  form: LeadFormData;
  answers: QuizAnswer[];
  scores: ScoreResult;
  utmSource: string;
}

export async function submitSuspect(payload: SubmitPayload): Promise<void> {
  const apiBase = getApiBase();
  if (!apiBase) return;

  const reponses = JSON.stringify(
    payload.answers.map((a) => ({
      idQ: a.questionId,
      points: a.points,
    })),
  );

  const body = {
    type: "saasia",
    mail: payload.form.email,
    firstname: payload.form.firstname,
    lastname: payload.form.lastname,
    phone: phoneDigits(payload.form.phone) || undefined,
    company: payload.form.company,
    fonction: payload.form.jobFunction,
    reponses,
    scoreSaas: buildScoreCode(payload.scores.saas.percent),
    scoreIa: buildScoreCode(payload.scores.ia.percent),
    rawScoreSaas: payload.scores.saas.raw,
    rawScoreIa: payload.scores.ia.raw,
    percentSaas: payload.scores.saas.percent,
    percentIa: payload.scores.ia.percent,
    ctaProfile: payload.scores.cta.id,
    utmSource: payload.utmSource,
    axisScores: payload.scores.axes.reduce(
      (acc, axis) => {
        acc[axis.id] = { saas: axis.saasPercent, ia: axis.iaPercent };
        return acc;
      },
      {} as Record<string, { saas: number; ia: number }>,
    ),
  };

  const res = await fetchWithTimeout(
    `${apiBase}/suspects`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    20_000,
  );

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}

async function parseApiError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");

  if (text.includes("<html") || text.includes("nginx")) {
    if (res.status === 405) {
      return "Le serveur web bloque l'envoi des données. Vérifiez la configuration de l'API.";
    }
    if (res.status === 504) {
      return "Le serveur met trop de temps à répondre. Vos résultats restent affichés.";
    }
    return `Erreur serveur (${res.status}). Réessayez ou contactez le support.`;
  }

  try {
    const data = JSON.parse(text) as { error?: string };
    if (data.error) {
      return "Vérifiez que tous les champs obligatoires sont remplis.";
    }
  } catch {
    /* raw text */
  }
  return text.length > 200
    ? `Erreur lors de l'enregistrement (${res.status}). Réessayez.`
    : text || `Erreur lors de l'enregistrement (${res.status}). Réessayez.`;
}

export interface AiReportSection {
  title: string;
  content: string;
}

export interface AiReport {
  summary: string;
  priorities: string[];
  sections: AiReportSection[];
}

export function buildAiReport(scores: ScoreResult, form: LeadFormData): AiReport {
  const sortedSaas = [...scores.axes].sort((a, b) => a.saasPercent - b.saasPercent);
  const sortedIa = [...scores.axes].sort((a, b) => a.iaPercent - b.iaPercent);
  const weakestSaas = sortedSaas[0];
  const weakestIa = sortedIa[0];

  return {
    summary: `${form.company || "Votre organisation"} obtient ${scores.saas.percent}/100 en SaaS Readiness (${scores.saas.profileLabel}) et ${scores.ia.percent}/100 en IA Readiness (${scores.ia.profileLabel}). ${scores.cta.message}`,
    priorities: [
      `Renforcer : ${weakestSaas.label} (SaaS ${weakestSaas.saasPercent} %).`,
      `Renforcer : ${weakestIa.label} (IA ${weakestIa.iaPercent} %).`,
      `Prochaine étape recommandée : ${scores.cta.offer}.`,
    ],
    sections: [
      {
        title: "SaaS Readiness",
        content: scores.saas.profileDescription,
      },
      {
        title: "IA Readiness",
        content: scores.ia.profileDescription,
      },
      {
        title: "Offre adaptée",
        content: `${scores.cta.ctaLabel} — ${scores.cta.offer}.`,
      },
    ],
  };
}

export function trackEvent(
  step: string,
  extra?: Record<string, string | number | undefined>,
): void {
  const apiBase = getApiBase();
  if (!apiBase) return;

  const sessionId =
    sessionStorage.getItem("saasia_session") ??
    (() => {
      const id = crypto.randomUUID();
      sessionStorage.setItem("saasia_session", id);
      return id;
    })();

  const body = JSON.stringify({
    session_id: sessionId,
    step,
    product: "saasia",
    utm_source: getUtmSource(),
    path: window.location.pathname,
    ...extra,
  });

  const url = `${apiBase}/quiz-retention/events`;
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}
