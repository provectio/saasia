import type { ProfileId } from "@/lib/scoring";

export interface CtaProfile {
  id: string;
  saasProfile: ProfileId;
  iaProfile: ProfileId;
  message: string;
  ctaLabel: string;
  offer: string;
  href: string;
}

export const CTA_PROFILES: CtaProfile[] = [
  {
    id: "1",
    saasProfile: "fragile",
    iaProfile: "fragile",
    message:
      "Votre SI a besoin d'une remise à niveau avant d'envisager le SaaS ou l'IA.",
    ctaLabel: "Réservez votre Check-up Infra gratuit",
    offer: "Check-up Infra + ProManage",
    href: "https://www.provectio.fr/contact/?source=diag-saasia-1&utm_source=AG_EC_PDL_2026",
  },
  {
    id: "2",
    saasProfile: "perfectible",
    iaProfile: "fragile",
    message:
      "Votre infra tient la route, mais l'environnement n'est pas prêt pour l'IA.",
    ctaLabel: "Structurez votre M365 avant Copilot",
    offer: "Check-up M365 & Copilot",
    href: "https://www.provectio.fr/contact/?source=diag-saasia-2&utm_source=AG_EC_PDL_2026",
  },
  {
    id: "3",
    saasProfile: "fragile",
    iaProfile: "perfectible",
    message: "L'appétence IA est là, mais l'infrastructure doit suivre.",
    ctaLabel: "Sécurisez les fondations d'abord",
    offer: "Check-up Infra + Check-up GRC",
    href: "https://www.provectio.fr/contact/?source=diag-saasia-3&utm_source=AG_EC_PDL_2026",
  },
  {
    id: "4",
    saasProfile: "perfectible",
    iaProfile: "perfectible",
    message: "Des bases solides mais des angles morts des deux côtés.",
    ctaLabel: "Un diagnostic global s'impose",
    offer: "Check-up M365 + Check-up GRC",
    href: "https://www.provectio.fr/contact/?source=diag-saasia-4&utm_source=AG_EC_PDL_2026",
  },
  {
    id: "5",
    saasProfile: "maitrise",
    iaProfile: "perfectible",
    message: "Le SaaS est maîtrisé, il ne manque qu'un pas vers l'IA.",
    ctaLabel: "Vous êtes à un pas de Copilot",
    offer: "Formation Copilot & Cowork",
    href: "https://www.provectio.fr/contact/?source=diag-saasia-5&utm_source=AG_EC_PDL_2026",
  },
  {
    id: "6",
    saasProfile: "perfectible",
    iaProfile: "maitrise",
    message: "L'IA est prête, mais l'infra a besoin d'un coup de boost.",
    ctaLabel: "Consolidez pour passer à l'échelle",
    offer: "ProManage + Optimisation réseau",
    href: "https://www.provectio.fr/contact/?source=diag-saasia-6&utm_source=AG_EC_PDL_2026",
  },
  {
    id: "7",
    saasProfile: "maitrise",
    iaProfile: "maitrise",
    message: "Bravo ! Votre SI est solide et prêt pour l'IA.",
    ctaLabel: "Passez à la vitesse supérieure",
    offer: "Copilot Avancé + Adoption Labs",
    href: "https://www.provectio.fr/contact/?source=diag-saasia-7&utm_source=AG_EC_PDL_2026",
  },
];

export function resolveCtaProfile(
  saasProfile: ProfileId,
  iaProfile: ProfileId,
): CtaProfile {
  const match = CTA_PROFILES.find(
    (p) => p.saasProfile === saasProfile && p.iaProfile === iaProfile,
  );
  return match ?? CTA_PROFILES[3];
}
