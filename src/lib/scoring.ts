import {
  BLOCKS,
  QUESTIONS,
  weightCoefficient,
  type BlockId,
  type Question,
} from "@/data/questions";
import { resolveCtaProfile, type CtaProfile } from "@/data/cta";

export type ProfileId = "fragile" | "perfectible" | "maitrise";

export interface QuizAnswer {
  questionId: string;
  points: 0 | 1 | 2;
}

export interface AxisScore {
  id: BlockId;
  label: string;
  saasPercent: number;
  iaPercent: number;
}

export interface ReadinessScore {
  raw: number;
  max: number;
  percent: number;
  profile: ProfileId;
  profileLabel: string;
  profileDescription: string;
  profileColor: string;
}

export interface ScoreResult {
  saas: ReadinessScore;
  ia: ReadinessScore;
  axes: AxisScore[];
  cta: CtaProfile;
}

const PROFILE_META: Record<
  ProfileId,
  { label: string; saasDescription: string; iaDescription: string; color: string }
> = {
  fragile: {
    label: "Fragile",
    color: "var(--color-profile-fragile)",
    saasDescription:
      "Votre SI n'est pas prêt pour absorber la bascule SaaS de vos éditeurs. Risques d'interruption, de perte de données et de failles de sécurité.",
    iaDescription:
      "Les prérequis ne sont pas réunis pour un déploiement IA sécurisé et efficace.",
  },
  perfectible: {
    label: "Perfectible",
    color: "var(--color-profile-perfectible)",
    saasDescription:
      "Des bases existent mais des angles morts subsistent (sécurité, réseau, gouvernance). Un diagnostic ciblé s'impose.",
    iaDescription:
      "Le potentiel est là, mais des fondations sont à consolider avant d'activer Copilot.",
  },
  maitrise: {
    label: "Maîtrisé",
    color: "var(--color-profile-maitrise)",
    saasDescription:
      "Votre infrastructure est solide. Place à l'optimisation et à l'anticipation.",
    iaDescription:
      "Votre organisation a les fondations pour tirer parti de l'IA. Passez à l'action !",
  },
};

export function getProfile(percent: number): ProfileId {
  if (percent <= 35) return "fragile";
  if (percent <= 65) return "perfectible";
  return "maitrise";
}

function questionContribution(
  question: Question,
  points: number,
  dimension: "saas" | "ia",
): number {
  const coeff =
    dimension === "saas"
      ? weightCoefficient(question.saasWeight)
      : weightCoefficient(question.iaWeight);
  return points * coeff;
}

function questionMaxContribution(question: Question, dimension: "saas" | "ia"): number {
  const coeff =
    dimension === "saas"
      ? weightCoefficient(question.saasWeight)
      : weightCoefficient(question.iaWeight);
  return 2 * coeff;
}

function normalizePercent(raw: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((raw / max) * 100));
}

function maxRawScore(dimension: "saas" | "ia"): number {
  return QUESTIONS.reduce((sum, q) => {
    const coeff =
      dimension === "saas"
        ? weightCoefficient(q.saasWeight)
        : weightCoefficient(q.iaWeight);
    return sum + coeff * 2;
  }, 0);
}

function buildReadinessScore(
  raw: number,
  dimension: "saas" | "ia",
): ReadinessScore {
  const max = maxRawScore(dimension);
  const percent = normalizePercent(raw, max);
  const profile = getProfile(percent);
  const meta = PROFILE_META[profile];

  return {
    raw: Math.round(raw * 10) / 10,
    max,
    percent,
    profile,
    profileLabel:
      dimension === "saas"
        ? profile === "fragile"
          ? "Fragile"
          : profile === "perfectible"
            ? "Perfectible"
            : "Maîtrisé"
        : profile === "fragile"
          ? "Non prêt"
          : profile === "perfectible"
            ? "Presque prêt"
            : "Prêt pour l'IA",
    profileDescription:
      dimension === "saas" ? meta.saasDescription : meta.iaDescription,
    profileColor: meta.color,
  };
}

export function computeScores(
  answers: QuizAnswer[],
  questions: Question[] = QUESTIONS,
): ScoreResult {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.points]));

  let saasRaw = 0;
  let iaRaw = 0;

  for (const q of questions) {
    const pts = answerMap.get(q.id) ?? 0;
    saasRaw += questionContribution(q, pts, "saas");
    iaRaw += questionContribution(q, pts, "ia");
  }

  const saas = buildReadinessScore(saasRaw, "saas");
  const ia = buildReadinessScore(iaRaw, "ia");

  const axes: AxisScore[] = BLOCKS.map((block) => {
    const blockQuestions = questions.filter((q) => q.block === block.id);
    let saasBlock = 0;
    let saasMax = 0;
    let iaBlock = 0;
    let iaMax = 0;

    for (const q of blockQuestions) {
      const pts = answerMap.get(q.id) ?? 0;
      saasBlock += questionContribution(q, pts, "saas");
      saasMax += questionMaxContribution(q, "saas");
      iaBlock += questionContribution(q, pts, "ia");
      iaMax += questionMaxContribution(q, "ia");
    }

    return {
      id: block.id,
      label: block.label,
      saasPercent: normalizePercent(saasBlock, saasMax),
      iaPercent: normalizePercent(iaBlock, iaMax),
    };
  });

  return {
    saas,
    ia,
    axes,
    cta: resolveCtaProfile(saas.profile, ia.profile),
  };
}

export function buildScoreCode(percent: number): "1" | "2" | "3" {
  if (percent <= 35) return "1";
  if (percent <= 65) return "2";
  return "3";
}
