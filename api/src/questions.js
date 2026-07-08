/** Miroir des questions du questionnaire (affichage back-office). */
export const QUESTIONS = [
  { id: "q1", categoryLabel: "Infrastructure & connectivité", text: "Comment qualifiez-vous la fiabilité de votre connexion internet ?", answers: [{ points: 0, label: "Coupures fréquentes, lien unique sans redondance" }, { points: 1, label: "Lien stable mais sans redondance ni QoS" }, { points: 2, label: "Lien redondé, QoS, fibre ou SD-WAN" }] },
  { id: "q2", categoryLabel: "Infrastructure & connectivité", text: "Où sont hébergées vos applications métier principales (compta, paie, ERP…) ?", answers: [{ points: 0, label: "Serveur local, pas de cloud" }, { points: 1, label: "Mix local + quelques outils SaaS" }, { points: 2, label: "Majorité en SaaS / cloud, stratégie claire" }] },
  { id: "q3", categoryLabel: "Infrastructure & connectivité", text: "Disposez-vous d'une sauvegarde externalisée de vos données critiques (y compris M365, SaaS) ?", answers: [{ points: 0, label: "Pas de sauvegarde externe ou ne sait pas" }, { points: 1, label: "Sauvegarde partielle (serveurs mais pas le cloud)" }, { points: 2, label: "Sauvegarde complète testée régulièrement (local + cloud + SaaS)" }] },
  { id: "q4", categoryLabel: "Identités & sécurité des accès", text: "L'authentification multifacteur (MFA) est-elle activée pour tous vos utilisateurs ?", answers: [{ points: 0, label: "Non ou ne sait pas" }, { points: 1, label: "Oui, pour certains utilisateurs (admins, direction)" }, { points: 2, label: "Oui, pour tous, avec politique d'accès conditionnel" }] },
  { id: "q5", categoryLabel: "Identités & sécurité des accès", text: "Des règles de sécurité contrôlent-elles les conditions d'accès à vos ressources ?", answers: [{ points: 0, label: "Non — accès depuis n'importe où" }, { points: 1, label: "Partiellement — VPN ou filtrage IP" }, { points: 2, label: "Oui — accès conditionnel actif" }] },
  { id: "q6", categoryLabel: "Identités & sécurité des accès", text: "Comment gérez-vous les arrivées et départs de collaborateurs sur le plan informatique ?", answers: [{ points: 0, label: "Pas de procédure formalisée" }, { points: 1, label: "Procédure manuelle et incomplète" }, { points: 2, label: "On/offboarding automatisé" }] },
  { id: "q7", categoryLabel: "Identités & sécurité des accès", text: "Avez-vous établi un inventaire des applications critiques ?", answers: [{ points: 0, label: "Non, aucune visibilité" }, { points: 1, label: "Partiellement" }, { points: 2, label: "Oui, inventaire à jour" }] },
  { id: "q8", categoryLabel: "Gouvernance des données & M365", text: "Comment sont organisés et classés vos documents numériques ?", answers: [{ points: 0, label: "Pas de règle" }, { points: 1, label: "Arborescence peu respectée" }, { points: 2, label: "Organisation structurée et droits maîtrisés" }] },
  { id: "q9", categoryLabel: "Gouvernance des données & M365", text: "Les droits d'accès aux fichiers sont-ils régulièrement revus ?", answers: [{ points: 0, label: "Jamais" }, { points: 1, label: "Ponctuellement" }, { points: 2, label: "Revue régulière (moindre privilège)" }] },
  { id: "q10", categoryLabel: "Gouvernance des données & M365", text: "Utilisez-vous des étiquettes de confidentialité ou une classification des données ?", answers: [{ points: 0, label: "Non" }, { points: 1, label: "Déploiement partiel" }, { points: 2, label: "Politique de classification active" }] },
  { id: "q11", categoryLabel: "Conformité & réglementation", text: "Avez-vous une charte informatique & IA formalisée ?", answers: [{ points: 0, label: "Non" }, { points: 1, label: "Oui mais pas à jour" }, { points: 2, label: "Oui, à jour et signée" }] },
  { id: "q12", categoryLabel: "Conformité & réglementation", text: "Où en êtes-vous vis-à-vis des obligations réglementaires (RGPD, NIS2…) ?", answers: [{ points: 0, label: "Pas ou peu engagé" }, { points: 1, label: "Démarche initiée" }, { points: 2, label: "Conformité suivie" }] },
  { id: "q13", categoryLabel: "Compétences & adoption", text: "Vos collaborateurs sont-ils formés aux outils numériques ?", answers: [{ points: 0, label: "Pas de formation" }, { points: 1, label: "Formation initiale sans suivi" }, { points: 2, label: "Plan de formation régulier" }] },
  { id: "q14", categoryLabel: "Compétences & adoption", text: "Vos équipes ont-elles utilisé des outils d'IA dans un cadre professionnel ?", answers: [{ points: 0, label: "Non" }, { points: 1, label: "Oui, de manière individuelle" }, { points: 2, label: "Oui, avec un cadre défini" }] },
  { id: "q15", categoryLabel: "Pilotage & stratégie SI", text: "Disposez-vous d'un interlocuteur dédié pour piloter votre informatique ?", answers: [{ points: 0, label: "Non" }, { points: 1, label: "Référent sans stratégie formalisée" }, { points: 2, label: "DSI/RSI ou partenaire avec comités réguliers" }] },
  { id: "q16", categoryLabel: "Pilotage & stratégie SI", text: "Avez-vous une feuille de route numérique pour les 12 prochains mois ?", answers: [{ points: 0, label: "Non" }, { points: 1, label: "Projets sans planning" }, { points: 2, label: "Roadmap formalisée" }] },
];

const byId = new Map(QUESTIONS.map((q) => [q.id, q]));

export function formatResponses(raw) {
  const list = Array.isArray(raw) ? raw : [];
  return list.map((r) => {
    const id = String(r.idQ ?? r.questionId ?? "");
    const q = byId.get(id);
    const points = Number(r.points);
    const answerLabel =
      q?.answers.find((a) => a.points === points)?.label ?? `${points} pt(s)`;
    return {
      questionId: id,
      category: q?.categoryLabel ?? "",
      question: q?.text ?? id,
      points,
      answer: answerLabel,
    };
  });
}
