import { CERTIFICATION_LOGOS, CLIENT_LOGOS } from "@/data/trust";
import { REVIEWS } from "@/data/reviews";

function LogoMarquee({ logos }: { logos: readonly { src: string; alt: string }[] }) {
  const items = [...logos, ...logos];
  return (
    <div className="relative overflow-hidden mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-trust-scroll items-center gap-14 py-4">
        {items.map((logo, i) => (
          <figure
            key={`${logo.alt}-${i}`}
            className="flex h-16 w-36 shrink-0 items-center justify-center grayscale transition hover:grayscale-0 md:h-20 md:w-44"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}

export function TrustSection() {
  return (
    <section id="social" className="border-t border-gray-200 bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold leading-snug text-gray-900 md:text-4xl">
            Nous travaillons{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              avec
            </span>
            …
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Plus de 600 entreprises nous confient leur système d&apos;information —
            PME, ETI, collectivités et associations, partout en France.
          </p>
        </div>

        <div className="mt-12">
          <LogoMarquee logos={CLIENT_LOGOS} />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          {CERTIFICATION_LOGOS.map((logo) => (
            <figure
              key={logo.alt}
              className="flex h-14 items-center justify-center opacity-90"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="max-h-14 max-w-[120px] object-contain"
                loading="lazy"
              />
            </figure>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl text-center">
          <h3 className="text-2xl font-bold leading-snug text-gray-900 md:text-3xl">
            Parce que vous êtes au cœur de nos préoccupations,
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              vos avis sont primordiaux.
            </span>
          </h3>

          <div className="mx-auto mt-10 grid gap-3 text-left sm:grid-cols-2">
            {REVIEWS.map((review, index) => (
              <figure
                key={`${review.author}-${index}`}
                className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4"
              >
                <blockquote className="text-sm text-gray-700">&quot;{review.text}&quot;</blockquote>
                <figcaption className="mt-2 text-xs text-gray-500">
                  — {review.author}
                  {review.role ? ` • ${review.role}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 shadow-sm">
            <span className="text-lg font-bold text-gray-900">4,8</span>
            <span className="text-amber-500" aria-hidden>
              ★★★★★
            </span>
            <span className="text-sm text-gray-500">sur Google</span>
          </div>
        </div>
      </div>
    </section>
  );
}
