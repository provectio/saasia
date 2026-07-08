import { CguContent } from "@/components/CguContent";
import { CguTocNav } from "@/components/CguTocNav";
import { PRIVACY_POLICY_URL } from "@/data/legal";
import { PROVECTIO_LOGO } from "@/data/trust";

export default function CguStandalone() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#9747FC]/15 via-[#5D85FD]/10 to-white">
      <header className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <a href="/" className="inline-flex shrink-0 items-center" aria-label="Retour au diagnostic">
            <img
              src={PROVECTIO_LOGO}
              alt="Logo Provectio"
              width={180}
              height={38}
              className="h-9 w-auto md:h-10"
              loading="eager"
            />
          </a>
          <a
            href="/"
            className="rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Retour au diagnostic
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12 lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
        <aside className="mb-10 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
          <div className="max-h-[70vh] overflow-y-auto">
            <CguTocNav />
          </div>
        </aside>

        <main className="min-w-0">
          <div className="rounded-3xl border border-primary/20 bg-white p-8 shadow-[4px_4px_24px_2px_#9747FC22] md:p-12">
            <CguContent showIntro />
            <div className="mt-12 flex flex-wrap gap-4 border-t border-gray-100 pt-8">
              <a
                href="/"
                className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Retour au diagnostic
              </a>
              <a
                href={PRIVACY_POLICY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gray-300 px-8 py-3 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
              >
                Politique de confidentialité
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
