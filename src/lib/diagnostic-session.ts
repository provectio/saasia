import type { QuizAnswer } from "@/lib/scoring";
import type { LeadFormData } from "@/lib/api";
export type DiagnosticStep = "hero" | "quiz" | "capture" | "results";

const STORAGE_KEY = "diag-saasia-draft";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface DiagnosticDraft {
  step: DiagnosticStep;
  blockIndex: number;
  answers: QuizAnswer[];
  form: LeadFormData;
  acceptedCgu: boolean;
  savedAt: number;
}

const VALID_STEPS = new Set<DiagnosticStep>(["hero", "quiz", "capture", "results"]);

function isValidDraft(value: unknown): value is DiagnosticDraft {
  if (!value || typeof value !== "object") return false;
  const d = value as DiagnosticDraft;
  return (
    VALID_STEPS.has(d.step) &&
    typeof d.blockIndex === "number" &&
    Array.isArray(d.answers) &&
    d.form != null &&
    typeof d.form.email === "string" &&
    typeof d.acceptedCgu === "boolean" &&
    typeof d.savedAt === "number"
  );
}

export function loadDiagnosticDraft(): DiagnosticDraft | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidDraft(parsed)) return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveDiagnosticDraft(draft: Omit<DiagnosticDraft, "savedAt">) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...draft, savedAt: Date.now() } satisfies DiagnosticDraft),
    );
  } catch {
    /* quota dépassé */
  }
}

export function clearDiagnosticDraft() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export const EMPTY_LEAD_FORM: LeadFormData = {
  email: "",
  firstname: "",
  lastname: "",
  phone: "",
  company: "",
  jobFunction: "",
};
