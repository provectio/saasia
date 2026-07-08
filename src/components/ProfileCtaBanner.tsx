import type { CtaProfile } from "@/data/cta";

interface ProfileCtaBannerProps {
  cta: CtaProfile;
  onClick?: () => void;
}

export function ProfileCtaBanner({ cta, onClick }: ProfileCtaBannerProps) {
  return (
    <div
      id="cta"
      className="mx-auto max-w-3xl rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-8 text-center shadow-[4px_4px_15px_2px_#9747FC22]"
    >
      <p className="text-lg text-gray-700">{cta.message}</p>
      <p className="mt-2 text-sm font-medium text-primary">{cta.offer}</p>
      <a
        href={cta.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="mt-8 inline-block rounded-full bg-primary px-10 py-4 text-lg font-semibold text-white shadow-[4px_4px_15px_2px_#9747FC33] transition hover:bg-primary/90"
      >
        {cta.ctaLabel}
      </a>
    </div>
  );
}
