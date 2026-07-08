export type BlockId =
  | "infra"
  | "identites"
  | "gouvernance"
  | "conformite"
  | "competences"
  | "pilotage";

export type WeightTier = 1 | 2 | 3;

export interface AnswerOption {
  points: 0 | 1 | 2;
  label: string;
}

export interface Question {
  id: string;
  block: BlockId;
  blockLabel: string;
  text: string;
  answers: AnswerOption[];
  saasWeight: WeightTier;
  iaWeight: WeightTier;
}

export const BLOCKS: { id: BlockId; label: string; step: number }[] = [
  { id: "infra", label: "Infrastructure & connectivité", step: 1 },
  { id: "identites", label: "Identités & sécurité des accès", step: 2 },
  { id: "gouvernance", label: "Gouvernance des données & M365", step: 3 },
  { id: "conformite", label: "Conformité & réglementation", step: 4 },
  { id: "competences", label: "Compétences & adoption", step: 5 },
  { id: "pilotage", label: "Pilotage & stratégie SI", step: 6 },
];

/** 1 ⭐ = 0,5 · 2 ⭐ = 1 · 3 ⭐ = 1,5 */
export function weightCoefficient(tier: WeightTier): number {
  return tier === 1 ? 0.5 : tier === 2 ? 1 : 1.5;
}

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    block: "infra",
    blockLabel: "Infrastructure & connectivité",
    text: "Comment qualifiez-vous la fiabilité de votre connexion internet ?",
    saasWeight: 3,
    iaWeight: 2,
    answers: [
      { points: 0, label: "Coupures fréquentes, lien unique sans redondance" },
      { points: 1, label: "Lien stable mais sans redondance ni QoS" },
      { points: 2, label: "Lien redondé, QoS, fibre ou SD-WAN" },
    ],
  },
  {
    id: "q2",
    block: "infra",
    blockLabel: "Infrastructure & connectivité",
    text: "Où sont hébergées vos applications métier principales (compta, paie, ERP…) ?",
    saasWeight: 3,
    iaWeight: 2,
    answers: [
      { points: 0, label: "Serveur local, pas de cloud" },
      { points: 1, label: "Mix local + quelques outils SaaS" },
      { points: 2, label: "Majorité en SaaS / cloud, stratégie claire" },
    ],
  },
  {
    id: "q3",
    block: "infra",
    blockLabel: "Infrastructure & connectivité",
    text: "Disposez-vous d'une sauvegarde externalisée de vos données critiques (y compris M365, SaaS) ?",
    saasWeight: 3,
    iaWeight: 1,
    answers: [
      { points: 0, label: "Pas de sauvegarde externe ou ne sait pas" },
      { points: 1, label: "Sauvegarde partielle (serveurs mais pas le cloud)" },
      { points: 2, label: "Sauvegarde complète testée régulièrement (local + cloud + SaaS)" },
    ],
  },
  {
    id: "q4",
    block: "identites",
    blockLabel: "Identités & sécurité des accès",
    text: "L'authentification multifacteur (MFA) est-elle activée pour tous vos utilisateurs ?",
    saasWeight: 3,
    iaWeight: 3,
    answers: [
      { points: 0, label: "Non ou ne sait pas" },
      { points: 1, label: "Oui, pour certains utilisateurs (admins, direction)" },
      { points: 2, label: "Oui, pour tous, avec politique d'accès conditionnel" },
    ],
  },
  {
    id: "q5",
    block: "identites",
    blockLabel: "Identités & sécurité des accès",
    text: "Des règles de sécurité contrôlent-elles les conditions d'accès à vos ressources (lieu, appareil, niveau de risque) ?",
    saasWeight: 3,
    iaWeight: 3,
    answers: [
      {
        points: 0,
        label: "Non — l'accès est possible de n'importe où, sur n'importe quel appareil",
      },
      { points: 1, label: "Partiellement — VPN ou filtrage IP, sans politique contextuelle" },
      {
        points: 2,
        label: "Oui — politiques d'accès conditionnel actives (zone, appareil, risque)",
      },
    ],
  },
  {
    id: "q6",
    block: "identites",
    blockLabel: "Identités & sécurité des accès",
    text: "Comment gérez-vous les arrivées et départs de collaborateurs sur le plan informatique ?",
    saasWeight: 3,
    iaWeight: 3,
    answers: [
      { points: 0, label: "Pas de procédure formalisée" },
      { points: 1, label: "Procédure existante mais manuelle et incomplète" },
      {
        points: 2,
        label: "Processus on/offboarding automatisé, comptes désactivés systématiquement",
      },
    ],
  },
  {
    id: "q7",
    block: "identites",
    blockLabel: "Identités & sécurité des accès",
    text: "Avez-vous établi un inventaire des applications critiques (droits, disponibilités, confidentialité…) ?",
    saasWeight: 3,
    iaWeight: 2,
    answers: [
      { points: 0, label: "Non, aucune visibilité" },
      { points: 1, label: "Partiellement, les principales sont connues" },
      { points: 2, label: "Oui, inventaire à jour, accès contrôlés et validés" },
    ],
  },
  {
    id: "q8",
    block: "gouvernance",
    blockLabel: "Gouvernance des données & M365",
    text: "Comment sont organisés et classés vos documents numériques (SharePoint, OneDrive, serveur…) ?",
    saasWeight: 2,
    iaWeight: 3,
    answers: [
      { points: 0, label: "Pas de règle, chacun stocke où il veut" },
      { points: 1, label: "Arborescence définie mais peu respectée" },
      {
        points: 2,
        label: "Organisation structurée, droits maîtrisés, politique de nommage cohérente",
      },
    ],
  },
  {
    id: "q9",
    block: "gouvernance",
    blockLabel: "Gouvernance des données & M365",
    text: "Les droits d'accès aux fichiers et dossiers sont-ils régulièrement revus ?",
    saasWeight: 2,
    iaWeight: 3,
    answers: [
      { points: 0, label: "Jamais ou ne sait pas" },
      { points: 1, label: "Ponctuellement, lors d'un incident ou d'un départ" },
      {
        points: 2,
        label: "Revue régulière (au moins annuelle), principe du moindre privilège appliqué",
      },
    ],
  },
  {
    id: "q10",
    block: "gouvernance",
    blockLabel: "Gouvernance des données & M365",
    text: "Utilisez-vous des étiquettes de confidentialité (labels) ou une classification des données ?",
    saasWeight: 2,
    iaWeight: 3,
    answers: [
      { points: 0, label: "Non" },
      { points: 1, label: "En cours de réflexion ou déploiement partiel" },
      { points: 2, label: "Oui, politique de classification active (labels ou équivalent)" },
    ],
  },
  {
    id: "q11",
    block: "conformite",
    blockLabel: "Conformité & réglementation",
    text: "Avez-vous une charte informatique & IA formalisée ?",
    saasWeight: 3,
    iaWeight: 2,
    answers: [
      { points: 0, label: "Non" },
      { points: 1, label: "Oui mais pas à jour ou pas communiquée" },
      { points: 2, label: "Oui, à jour, communiquée et signée par les collaborateurs" },
    ],
  },
  {
    id: "q12",
    block: "conformite",
    blockLabel: "Conformité & réglementation",
    text: "Où en êtes-vous vis-à-vis des obligations réglementaires (RGPD, facture électronique, NIS2…) ?",
    saasWeight: 3,
    iaWeight: 2,
    answers: [
      { points: 0, label: "Pas ou peu engagé" },
      { points: 1, label: "Démarche initiée mais incomplète" },
      {
        points: 2,
        label: "Conformité suivie, DPO ou référent identifié, registre des traitements à jour",
      },
    ],
  },
  {
    id: "q13",
    block: "competences",
    blockLabel: "Compétences & adoption",
    text: "Vos collaborateurs sont-ils formés aux outils numériques qu'ils utilisent au quotidien ?",
    saasWeight: 2,
    iaWeight: 3,
    answers: [
      { points: 0, label: "Pas de formation, apprentissage sur le tas" },
      { points: 1, label: "Formation initiale mais pas de suivi" },
      { points: 2, label: "Plan de formation régulier, accompagnement au changement actif" },
    ],
  },
  {
    id: "q14",
    block: "competences",
    blockLabel: "Compétences & adoption",
    text: "Vos équipes ont-elles déjà utilisé des outils d'IA (ChatGPT, Copilot, autres…) dans un cadre professionnel ?",
    saasWeight: 1,
    iaWeight: 3,
    answers: [
      { points: 0, label: "Non, aucune initiative" },
      { points: 1, label: "Oui, de manière individuelle et non encadrée" },
      { points: 2, label: "Oui, avec un cadre défini (outils validés, bonnes pratiques, gouvernance)" },
    ],
  },
  {
    id: "q15",
    block: "pilotage",
    blockLabel: "Pilotage & stratégie SI",
    text: "Disposez-vous d'un interlocuteur dédié (interne ou externe) pour piloter votre informatique ?",
    saasWeight: 3,
    iaWeight: 2,
    answers: [
      { points: 0, label: "Non, chacun se débrouille" },
      { points: 1, label: "Oui, un référent interne mais sans stratégie formalisée" },
      {
        points: 2,
        label: "Oui, DSI/RSI ou partenaire infogérant avec comités de pilotage réguliers",
      },
    ],
  },
  {
    id: "q16",
    block: "pilotage",
    blockLabel: "Pilotage & stratégie SI",
    text: "Avez-vous une feuille de route numérique pour les 12 prochains mois ?",
    saasWeight: 2,
    iaWeight: 3,
    answers: [
      { points: 0, label: "Non" },
      { points: 1, label: "Des projets identifiés mais pas de planning" },
      { points: 2, label: "Oui, roadmap formalisée avec budget, priorités et jalons" },
    ],
  },
];

export const MAX_SAAS_RAW_SCORE = QUESTIONS.reduce(
  (sum, q) => sum + weightCoefficient(q.saasWeight) * 2,
  0,
);

export const MAX_IA_RAW_SCORE = QUESTIONS.reduce(
  (sum, q) => sum + weightCoefficient(q.iaWeight) * 2,
  0,
);

export const JOB_FUNCTIONS = [
  { value: "dirigeant", label: "Dirigeant / Direction générale" },
  { value: "dsi", label: "DSI / RSSI / IT Manager" },
  { value: "daf", label: "DAF / Finance" },
  { value: "rh", label: "RH / Office Manager" },
  { value: "metier", label: "Responsable métier" },
  { value: "autre", label: "Autre" },
] as const;
