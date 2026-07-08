import { PROVECTIO_LOGO, PROVECTIO_URL } from "@/data/trust";

export function ProvectioHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href={PROVECTIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center"
          aria-label="Provectio — Retour au site principal"
        >
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
          href="https://www.provectio.fr/contact/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white sm:inline-block"
        >
          Nous contacter
        </a>
      </div>
    </header>
  );
}
