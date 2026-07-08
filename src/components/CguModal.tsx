import { useCallback, useEffect, useRef, useState } from "react";
import { CGU_TOC, CguContent } from "@/components/CguContent";
import { CguTocNav } from "@/components/CguTocNav";
import { DIAG_SITE_URL } from "@/data/legal";

interface CguModalProps {
  open: boolean;
  onClose: () => void;
}

export function CguModal({ open, onClose }: CguModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("s1");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    setActiveSection("s1");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const scrollToSection = useCallback((sectionId: string) => {
    const root = contentRef.current;
    if (!root) return;
    const el = root.querySelector(`#${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = contentRef.current;
    if (!root) return;

    const sections = root.querySelectorAll<HTMLElement>("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { root, rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cgu-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Fermer"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl bg-gradient-to-b from-white to-gray-50/80 shadow-2xl ring-1 ring-primary/10 sm:max-h-[90vh] sm:rounded-3xl lg:max-w-7xl">
        {/* En-tête */}
        <div className="shrink-0 border-b border-primary/10 bg-white/95 px-6 py-5 backdrop-blur-sm sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Auto-diagnostic SaaS & IA
              </p>
              <h2
                id="cgu-modal-title"
                className="mt-1 text-xl font-bold leading-tight text-gray-900 sm:text-2xl"
              >
                Conditions générales d&apos;utilisation
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {DIAG_SITE_URL} — juin 2026
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full border border-gray-200 p-2 text-gray-500 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              aria-label="Fermer la fenêtre"
            >
              <span className="block size-5 text-center text-xl leading-5">&times;</span>
            </button>
          </div>
        </div>

        {/* Corps : sommaire + contenu */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          {/* Sommaire — desktop (hauteur limitée au corps, sans chevauchement du pied) */}
          <aside className="hidden min-h-0 w-[260px] shrink-0 flex-col overflow-hidden border-r border-gray-100 bg-white/90 md:flex lg:w-[300px]">
            <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-6">
              <CguTocNav
                onSectionClick={scrollToSection}
                activeId={activeSection}
              />
            </div>
          </aside>

          {/* Sommaire — mobile (horizontal chips) */}
          <div className="border-b border-gray-100 bg-white px-4 py-3 md:hidden">
            <select
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              value={activeSection}
              onChange={(e) => scrollToSection(e.target.value)}
              aria-label="Aller à une section"
            >
              {CGU_TOC.map((item, i) => (
                <option key={item.id} value={item.id}>
                  {i + 1}. {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Contenu */}
          <div
            ref={contentRef}
            className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8"
          >
            <div className="rounded-2xl border border-primary/15 bg-white p-6 shadow-[4px_4px_24px_2px_#9747FC18] sm:p-8">
              <CguContent showIntro={false} />
            </div>
          </div>
        </div>

        {/* Pied */}
        <div className="relative z-20 shrink-0 border-t border-gray-100 bg-white px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white shadow-[4px_4px_15px_2px_#9747FC33] transition hover:bg-primary/90"
          >
            Fermer et revenir au formulaire
          </button>
        </div>
      </div>
    </div>
  );
}
