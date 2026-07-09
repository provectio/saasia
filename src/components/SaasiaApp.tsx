import { useCallback, useEffect, useMemo, useState } from "react";
import { BLOCKS, JOB_FUNCTIONS, QUESTIONS } from "@/data/questions";
import { computeScores, type QuizAnswer, type ScoreResult } from "@/lib/scoring";
import {
  buildAiReport,
  getUtmSource,
  isApiConfigured,
  submitSuspect,
  trackEvent,
  type AiReport,
  type LeadFormData,
} from "@/lib/api";
import { DualRadarChart } from "@/components/DualRadarChart";
import { ProvectioHeader } from "@/components/ProvectioHeader";
import { TrustSection } from "@/components/TrustSection";
import { PdfReport } from "@/components/PdfReport";
import { ProfileCtaBanner } from "@/components/ProfileCtaBanner";
import { ScoreGauge } from "@/components/ScoreGauge";
import { formatPhoneFr } from "@/lib/phone";
import { CguModal } from "@/components/CguModal";
import {
  clearDiagnosticDraft,
  EMPTY_LEAD_FORM,
  loadDiagnosticDraft,
  saveDiagnosticDraft,
  type DiagnosticStep,
} from "@/lib/diagnostic-session";
import { PROVECTIO_LOGO, PROVECTIO_URL } from "@/data/trust";

type Step = DiagnosticStep;

const PROFILE_PILLS = [
  { label: "SaaS Readiness", color: "#2563eb" },
  { label: "IA Readiness", color: "#7c3aed" },
] as const;

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function SaasiaApp() {
  const [step, setStep] = useState<Step>("hero");
  const [blockIndex, setBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [form, setForm] = useState<LeadFormData>(EMPTY_LEAD_FORM);
  const [scores, setScores] = useState<ScoreResult | null>(null);
  const [aiReport, setAiReport] = useState<AiReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "failed">(
    "idle",
  );
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [acceptedCgu, setAcceptedCgu] = useState(false);
  const [cguModalOpen, setCguModalOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const currentBlock = BLOCKS[blockIndex];
  const blockQuestions = useMemo(
    () => QUESTIONS.filter((q) => q.block === currentBlock?.id),
    [currentBlock],
  );

  const answerMap = useMemo(
    () => new Map(answers.map((a) => [a.questionId, a.points])),
    [answers],
  );

  const blockComplete = blockQuestions.every((q) => answerMap.has(q.id));
  const progress = ((blockIndex + (blockComplete ? 1 : 0.5)) / BLOCKS.length) * 100;

  useEffect(() => {
    trackEvent("page_view", { utm_source: getUtmSource() });
  }, []);

  useEffect(() => {
    const draft = loadDiagnosticDraft();
    if (draft) {
      setStep(draft.step);
      setBlockIndex(draft.blockIndex);
      setAnswers(draft.answers);
      setForm(draft.form);
      setAcceptedCgu(draft.acceptedCgu);
    }
    setSessionReady(true);
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    if (step === "hero" && answers.length === 0 && !form.email) {
      clearDiagnosticDraft();
      return;
    }
    saveDiagnosticDraft({ step, blockIndex, answers, form, acceptedCgu });
  }, [sessionReady, step, blockIndex, answers, form, acceptedCgu]);

  const navigateTo = useCallback((next: Step) => {
    setStep(next);
    scrollToTop();
  }, []);

  const goToQuiz = useCallback(() => {
    trackEvent("quiz_started");
    clearDiagnosticDraft();
    setAnswers([]);
    setBlockIndex(0);
    setForm(EMPTY_LEAD_FORM);
    setAcceptedCgu(false);
    setError(null);
    navigateTo("quiz");
  }, [navigateTo]);

  const selectAnswer = (questionId: string, points: 0 | 1 | 2) => {
    const next = answers.filter((a) => a.questionId !== questionId);
    next.push({ questionId, points });
    setAnswers(next);
    trackEvent("question_answered", { question_id: questionId });
  };

  const goBackBlock = () => {
    if (blockIndex > 0) {
      setBlockIndex((i) => i - 1);
      scrollToTop();
    }
  };

  const goNextBlock = () => {
    if (!blockComplete) {
      setError("Répondez à toutes les questions de cette étape pour continuer.");
      return;
    }
    setError(null);
    if (blockIndex < BLOCKS.length - 1) {
      setBlockIndex((i) => i + 1);
      trackEvent("block_completed", { block: currentBlock.id, index: blockIndex + 1 });
      scrollToTop();
    } else {
      trackEvent("quiz_completed");
      navigateTo("capture");
    }
  };

  const goBackFromCapture = () => {
    setBlockIndex(BLOCKS.length - 1);
    navigateTo("quiz");
  };

  const computed = useMemo(
    () => (answers.length === QUESTIONS.length ? computeScores(answers) : null),
    [answers],
  );

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!computed) {
      setError(
        "Le questionnaire n'est pas complet. Revenez aux questions précédentes pour finaliser le diagnostic.",
      );
      return;
    }
    if (!acceptedCgu) {
      setError(
        "Vous devez accepter les conditions générales d'utilisation pour continuer.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    setSaveWarning(null);

    const payload = {
      form,
      answers,
      scores: computed,
      utmSource: getUtmSource(),
    };

    setScores(computed);
    setAiReport(buildAiReport(computed, form));
    setLoading(false);
    navigateTo("results");

    if (!isApiConfigured()) {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("saving");
    void submitSuspect(payload)
      .then(() => {
        trackEvent("lead_submitted", {
          saas: computed.saas.percent,
          ia: computed.ia.percent,
        });
        setSaveStatus("saved");
        setSaveWarning(null);
      })
      .catch((err) => {
        setSaveStatus("failed");
        setSaveWarning(
          err instanceof Error
            ? err.message
            : "Vos résultats sont affichés, mais l'enregistrement n'a pas abouti.",
        );
      });
  };

  const handleDownloadPdf = () => {
    trackEvent("pdf_download");
    const previousTitle = document.title;
    const company = form.company.trim() || "Provectio";
    document.title = `Diagnostic SaaS IA - ${company}`;
    window.print();
    document.title = previousTitle;
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#9747FC]/20 via-[#5D85FD]/15 to-white print:hidden">
      <ProvectioHeader />

      {step === "hero" && (
        <section
          id="hero"
          className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-16 text-center"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
            Auto-diagnostic SaaS & IA
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Votre SI est-il prêt
            </span>
            <br />
            <span className="text-gray-800">pour le SaaS et l&apos;IA ?</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-600">
            3 minutes pour évaluer votre maturité — 16 questions, 2 scores séparés
            (SaaS Readiness + IA Readiness), radar 6 axes et recommandations
            personnalisées.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {PROFILE_PILLS.map((p) => (
              <span
                key={p.label}
                className="rounded-full border px-4 py-1.5 text-sm font-medium"
                style={{ borderColor: p.color, color: p.color }}
              >
                {p.label}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={goToQuiz}
            className="mt-12 rounded-full bg-primary px-10 py-4 text-lg font-semibold text-white shadow-[4px_4px_15px_2px_#9747FC33] transition hover:bg-primary/90"
          >
            Démarrer le diagnostic
          </button>

          <ul className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <li>100% gratuit</li>
            <li>~3 minutes</li>
            <li>16 questions</li>
            <li>2 scores + radar</li>
          </ul>
        </section>
      )}

      {step === "quiz" && currentBlock && (
        <section
          id="quiz"
          className="min-h-[calc(100vh-4rem)] px-6 py-12 md:py-16"
        >
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              {blockIndex > 0 && (
                <button
                  type="button"
                  onClick={goBackBlock}
                  className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-primary hover:text-primary"
                >
                  ← Étape précédente
                </button>
              )}
              <div className="mb-2 flex justify-between text-sm text-gray-500">
                <span>
                  Étape {blockIndex + 1} / {BLOCKS.length}
                </span>
                <span>{currentBlock.label}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-white/90 p-6 shadow-[4px_4px_15px_2px_#9747FC22] backdrop-blur-sm md:p-8">
              <p className="mb-2 text-xs font-semibold uppercase text-primary">
                Bloc {blockIndex + 1} — {currentBlock.label}
              </p>

              <div className="space-y-10">
                {blockQuestions.map((question) => {
                  const questionNumber =
                    QUESTIONS.findIndex((q) => q.id === question.id) + 1;
                  return (
                  <div key={question.id}>
                    <h2 className="mb-4 text-lg font-semibold leading-snug text-gray-900 md:text-xl">
                      <span className="mr-2 text-primary">Q{questionNumber}.</span>
                      {question.text}
                    </h2>
                    <div className="flex flex-col gap-2">
                      {question.answers.map((opt) => (
                        <button
                          key={opt.points}
                          type="button"
                          onClick={() => selectAnswer(question.id, opt.points)}
                          className={`rounded-2xl border-2 px-4 py-3 text-left text-sm transition md:text-base ${
                            answerMap.get(question.id) === opt.points
                              ? "border-primary bg-primary/10 font-medium text-primary"
                              : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                          }`}
                        >
                          <span className="mr-2 font-bold text-primary">{opt.points}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>

              {error && (
                <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={goNextBlock}
                className="mt-8 w-full rounded-full bg-primary py-4 font-semibold text-white transition hover:bg-primary/90"
              >
                {blockIndex < BLOCKS.length - 1
                  ? "Étape suivante"
                  : "Voir mes résultats"}
              </button>
            </div>
          </div>
        </section>
      )}

      {step === "capture" && (
        <section
          id="capture"
          className="flex min-h-[calc(100vh-4rem)] items-center px-6 py-16"
        >
          <div className="mx-auto w-full max-w-lg rounded-3xl border border-primary/30 bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">
              Recevez votre diagnostic personnalisé
            </h2>
            <p className="mt-2 text-gray-600">
              Indiquez vos coordonnées pour afficher vos scores SaaS et IA.
            </p>

            <button
              type="button"
              onClick={goBackFromCapture}
              className="mt-4 text-sm text-gray-500 underline hover:text-primary"
            >
              ← Modifier mes réponses
            </button>

            <form onSubmit={handleSubmitLead} className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstname" className="mb-1 block text-sm font-medium">
                    Prénom *
                  </label>
                  <input
                    id="firstname"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={form.firstname}
                    onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="lastname" className="mb-1 block text-sm font-medium">
                    Nom *
                  </label>
                  <input
                    id="lastname"
                    type="text"
                    required
                    autoComplete="family-name"
                    value={form.lastname}
                    onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  Email professionnel *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  placeholder="vous@entreprise.fr"
                />
              </div>
              <div>
                <label htmlFor="company" className="mb-1 block text-sm font-medium">
                  Société *
                </label>
                <input
                  id="company"
                  type="text"
                  required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="jobFunction" className="mb-1 block text-sm font-medium">
                  Fonction *
                </label>
                <select
                  id="jobFunction"
                  required
                  value={form.jobFunction}
                  onChange={(e) => setForm({ ...form, jobFunction: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                >
                  <option value="">Sélectionnez…</option>
                  {JOB_FUNCTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                  Téléphone <span className="font-normal text-gray-400">(optionnel)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: formatPhoneFr(e.target.value) })
                  }
                  maxLength={14}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4 text-sm leading-relaxed text-gray-600">
                <input
                  type="checkbox"
                  checked={acceptedCgu}
                  onChange={(e) => {
                    setAcceptedCgu(e.target.checked);
                    if (e.target.checked) setError(null);
                  }}
                  className="mt-0.5 size-4 shrink-0 rounded border-gray-300 text-primary focus:ring-primary/30"
                />
                <span>
                  En soumettant ce formulaire, j&apos;accepte les{" "}
                  <button
                    type="button"
                    className="font-medium text-primary underline hover:text-primary/80"
                    onClick={(e) => {
                      e.preventDefault();
                      setCguModalOpen(true);
                    }}
                  >
                    CGU de Provectio
                  </button>{" "}
                  et j&apos;autorise le traitement de mes données pour recevoir les
                  résultats de mon diagnostic.
                </span>
              </label>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !acceptedCgu}
                className="w-full rounded-full bg-primary py-4 font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Génération en cours…" : "Voir mes scores"}
              </button>
            </form>
          </div>
        </section>
      )}

      {step === "results" && scores && (
        <section id="results" className="px-6 py-16 pt-8">
          <div className="mx-auto max-w-5xl">
            {saveStatus === "saving" && (
              <p className="no-print mb-6 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-gray-700">
                Enregistrement de vos coordonnées en cours…
              </p>
            )}
            {saveWarning && (
              <p className="no-print mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {saveWarning}
              </p>
            )}

            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Vos résultats</h2>
              <p className="mt-2 text-gray-600">{scores.cta.message}</p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <ScoreGauge
                label="SaaS Readiness"
                percent={scores.saas.percent}
                profileLabel={scores.saas.profileLabel}
                color={scores.saas.profileColor}
                accentColor="#2563eb"
              />
              <ScoreGauge
                label="IA Readiness"
                percent={scores.ia.percent}
                profileLabel={scores.ia.profileLabel}
                color={scores.ia.profileColor}
                accentColor="#7c3aed"
              />
            </div>

            <div className="mt-12 rounded-3xl border border-primary/20 bg-white p-6 shadow-lg md:p-8">
              <h3 className="mb-6 text-center text-xl font-semibold text-gray-800">
                Radar des 6 axes
              </h3>
              <DualRadarChart axes={scores.axes} />
              <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {scores.axes.map((axis) => (
                  <div
                    key={axis.id}
                    className="rounded-lg bg-gray-50 px-3 py-2 text-center text-xs"
                  >
                    <span className="font-medium text-gray-700">{axis.label}</span>
                    <br />
                    <span className="text-[#2563eb] font-semibold">
                      SaaS {axis.saasPercent}%
                    </span>
                    {" · "}
                    <span className="text-[#7c3aed] font-semibold">
                      IA {axis.iaPercent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 rounded-3xl border border-secondary/30 bg-gradient-to-br from-primary/5 to-secondary/5 p-8">
              <h3 className="text-xl font-bold text-gray-900">Rapport personnalisé</h3>
              {aiReport && (
                <div className="mt-4 space-y-4">
                  <p className="leading-relaxed text-gray-700">{aiReport.summary}</p>
                  <ul className="list-disc space-y-1 pl-5 text-gray-700">
                    {aiReport.priorities.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                  {aiReport.sections.map((s, i) => (
                    <div key={i}>
                      <h4 className="font-semibold text-primary">{s.title}</h4>
                      <p className="text-gray-600">{s.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="no-print mt-8 text-center">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="rounded-full border border-primary px-8 py-3 font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                Télécharger mon diagnostic
              </button>
              <p className="mt-2 text-xs text-gray-400">
                Rapport 3 pages : page de garde, synthèse et rapport personnalisé.
              </p>
            </div>
          </div>
        </section>
      )}

      {step === "results" && scores && (
        <section className="px-6 py-12">
          <ProfileCtaBanner
            cta={scores.cta}
            onClick={() => trackEvent("cta_clicked", { profile: scores.cta.id })}
          />
        </section>
      )}

      {step === "results" && <TrustSection />}

      <footer className="border-t border-gray-200 bg-gray-50 px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <a
            href={PROVECTIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Provectio"
          >
            <img
              src={PROVECTIO_LOGO}
              alt="Logo Provectio"
              width={160}
              height={34}
              className="h-8 w-auto opacity-80"
              loading="lazy"
            />
          </a>
          <p className="text-sm text-gray-500">
            Un outil d&apos;évaluation imaginé et développé en Bretagne par Provectio
            — Services informatiques et télécom pour les professionnels.
          </p>
          <p className="text-xs text-gray-400">
            <button
              type="button"
              onClick={() => setCguModalOpen(true)}
              className="text-gray-500 underline hover:text-primary"
            >
              Conditions générales d&apos;utilisation
            </button>
            {" · "}
            1.0.1 — Tous droits réservés Provectio — 2026
          </p>
        </div>
      </footer>

      <CguModal open={cguModalOpen} onClose={() => setCguModalOpen(false)} />
      </div>

      {step === "results" && scores && aiReport && (
        <div className="pdf-print-only">
          <PdfReport scores={scores} aiReport={aiReport} form={form} />
        </div>
      )}
    </>
  );
}
