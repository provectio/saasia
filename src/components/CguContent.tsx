import {
  DIAG_SITE_URL,
  PRIVACY_POLICY_URL,
  PROVECTIO_CONTACT,
  PROVECTIO_DPO,
} from "@/data/legal";

export const CGU_TOC = [
  { id: "s1", label: "Mentions légales" },
  { id: "s2", label: "Définitions" },
  { id: "s3", label: "Objet et opposabilité" },
  { id: "s4", label: "Description du service" },
  { id: "s5", label: "Accès et maintenance" },
  { id: "s6", label: "Inscription et comptes" },
  { id: "s7", label: "Usages interdits" },
  { id: "s8", label: "Propriété intellectuelle" },
  { id: "s9", label: "Données et RGPD" },
  { id: "s10", label: "Sécurité" },
  { id: "s11", label: "Garanties" },
  { id: "s12", label: "Responsabilité" },
  { id: "s13", label: "Indemnisation" },
  { id: "s14", label: "Évolution des CGU" },
  { id: "s15", label: "Force majeure" },
  { id: "s16", label: "Cession" },
  { id: "s17", label: "Preuve" },
  { id: "s18", label: "Nullité partielle" },
  { id: "s19", label: "Droit applicable" },
  { id: "s20", label: "Contact" },
] as const;

const sectionClass =
  "scroll-mt-24 border-t border-gray-100 pt-8 first:border-0 first:pt-0";
const linkClass = "text-primary underline";

export function CguContent({ showIntro = true }: { showIntro?: boolean }) {
  return (
    <>
      {showIntro ? (
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Auto-diagnostic SaaS & IA
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            Conditions générales d&apos;utilisation
          </h1>
          <p className="mt-4 text-gray-600">
            Plateforme accessible à l&apos;adresse{" "}
            <a href={DIAG_SITE_URL} className={`font-medium ${linkClass}`}>
              {DIAG_SITE_URL}
            </a>
            . Dernière mise à jour : juin 2026.
          </p>
        </div>
      ) : null}

      <article className="mt-10 space-y-10 text-[15px] leading-relaxed text-gray-700">
        <section id="s1" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            1. Mentions légales – Éditeur et hébergeur
          </h2>
          <div className="mt-4 space-y-3">
            <p>
              <strong>Éditeur du Site :</strong> PROVECTIO, SAS au capital de
              106&nbsp;340&nbsp;€, immatriculée au RCS de Rennes B&nbsp;477&nbsp;865&nbsp;554,
              siège social&nbsp;: 6 allée Adolphe Bobière, 35000 Rennes.
            </p>
            <p>
              <strong>N° TVA intracommunautaire :</strong> FR15477865554
            </p>
            <p>
              <strong>Directeur de la publication :</strong> Maxime CHARLES
            </p>
            <p>
              <strong>Contact :</strong>{" "}
              <a href={`mailto:${PROVECTIO_CONTACT}`} className={linkClass}>
                {PROVECTIO_CONTACT}
              </a>
            </p>
            <p>
              <strong>Hébergeur :</strong> PROVECTIO, immatriculée au RCS de
              Rennes B&nbsp;477&nbsp;865&nbsp;554, siège social&nbsp;: 6 allée
              Adolphe Bobière, 35000 Rennes.
            </p>
          </div>
        </section>

        <section id="s2" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">2. Définitions</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              <strong>«&nbsp;Site&nbsp;»</strong> : la plateforme en ligne
              accessible à l&apos;adresse{" "}
              <a href={DIAG_SITE_URL} className={linkClass}>
                {DIAG_SITE_URL}
              </a>{" "}
              permettant de réaliser un auto-diagnostic de la maturité SaaS et IA de votre SI.
            </li>
            <li>
              <strong>«&nbsp;Éditeur&nbsp;»</strong> : la société identifiée à
              l&apos;article&nbsp;1.
            </li>
            <li>
              <strong>«&nbsp;Utilisateur&nbsp;»</strong> : toute personne
              accédant au Site.
            </li>
            <li>
              <strong>«&nbsp;Client&nbsp;»</strong> : toute personne morale
              utilisant le Site pour ses besoins professionnels.
            </li>
            <li>
              <strong>«&nbsp;Données&nbsp;»</strong> : ensemble des
              informations saisies par l&apos;Utilisateur/Client (réponses,
              coordonnées, pièces, etc.).
            </li>
            <li>
              <strong>«&nbsp;Résultats&nbsp;»</strong> : score(s), rapports et
              indicateurs générés par l&apos;outil.
            </li>
            <li>
              <strong>«&nbsp;Politique de confidentialité&nbsp;»</strong> :
              document décrivant les traitements de données personnelles (
              <a
                href={PRIVACY_POLICY_URL}
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                lien
              </a>
              ).
            </li>
          </ul>
        </section>

        <section id="s3" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            3. Objet et opposabilité
          </h2>
          <p className="mt-4">
            Les présentes CGU ont pour objet de définir les conditions
            d&apos;accès et d&apos;utilisation du Site. L&apos;accès ou
            l&apos;utilisation du Site emporte acceptation sans réserve des CGU
            et de la Politique de confidentialité. En cas de désaccord,
            l&apos;Utilisateur doit cesser toute utilisation.
          </p>
        </section>

        <section id="s4" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            4. Description du service
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              Le Site met à disposition un outil automatisé de diagnostic de
              la maturité SaaS et IA sur un modèle d&apos;analyse propriétaire
              (questionnaires, barèmes, algorithmes).
            </li>
            <li>
              Les Résultats ont un caractère purement informatif et
              indicatif&nbsp;; ils ne constituent ni un audit, ni un conseil
              personnalisé, ni une garantie de conformité ou de sécurité.
            </li>
            <li>
              Toute décision prise sur la base des Résultats relève de la seule
              responsabilité de l&apos;Utilisateur/Client.
            </li>
            <li>
              L&apos;Éditeur peut faire évoluer le contenu, les fonctionnalités
              et l&apos;ergonomie du Site à tout moment.
            </li>
          </ul>
        </section>

        <section id="s5" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            5. Accès – Disponibilité – Maintenance
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              Le Site est accessible 24/7, sous réserve d&apos;interruptions
              (maintenance, mises à jour, cas fortuit/force majeure, sécurité).
            </li>
            <li>
              L&apos;Éditeur ne garantit pas un accès ininterrompu, exempt
              d&apos;erreurs ou de vulnérabilités.
            </li>
            <li>
              En cas d&apos;opération planifiée impactante, l&apos;Éditeur
              pourra en informer préalablement les Utilisateurs enregistrés,
              sans obligation.
            </li>
          </ul>
        </section>

        <section id="s6" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            6. Inscription et comptes (le cas échéant)
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              Certaines fonctionnalités peuvent nécessiter la création d&apos;un
              compte. L&apos;Utilisateur s&apos;engage à fournir des
              informations exactes, complètes et à jour et à préserver la
              confidentialité de ses identifiants.
            </li>
            <li>
              Toute activité réalisée via le compte est réputée effectuée par le
              Client correspondant. Le Client notifie sans délai toute suspicion
              d&apos;usage frauduleux&nbsp;:{" "}
              <a href={`mailto:${PROVECTIO_CONTACT}`} className={linkClass}>
                {PROVECTIO_CONTACT}
              </a>
              .
            </li>
          </ul>
        </section>

        <section id="s7" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            7. Bonnes pratiques et usages interdits
          </h2>
          <p className="mt-4">
            L&apos;Utilisateur/Client s&apos;interdit, directement ou via un
            tiers, de&nbsp;:
          </p>
          <ul className="mt-3 list-[lower-alpha] space-y-2 pl-6">
            <li>
              tenter d&apos;accéder au code source, aux API ou aux bases de
              données hors interfaces publiques&nbsp;;
            </li>
            <li>
              contourner les mesures de sécurité, mener des tests
              d&apos;intrusion, scans, injections, tests de charge non
              autorisés&nbsp;;
            </li>
            <li>
              perturber le Site (malwares, spams, DDoS, scripts automatisés
              abusifs)&nbsp;;
            </li>
            <li>
              utiliser le Site pour évaluer des tiers sans leur consentement ou
              en violation d&apos;obligations de confidentialité&nbsp;;
            </li>
            <li>
              copier, reproduire, revendre ou exploiter les Résultats ou le
              modèle d&apos;évaluation au-delà des droits concédés&nbsp;;
            </li>
            <li>
              enfreindre la loi applicable (données sensibles sans base légale,
              export de données soumis contrôle, etc.).
            </li>
          </ul>
          <p className="mt-4">
            L&apos;Éditeur se réserve le droit de suspendre ou bloquer
            l&apos;accès en cas de violation.
          </p>
        </section>

        <section id="s8" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            8. Propriété intellectuelle – Licence d&apos;utilisation
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              Le Site et tous ses éléments (architecture, contenus,
              questionnaires, algorithmes, base de connaissances, marques,
              logos, charte graphique) sont protégés par le droit de la propriété
              intellectuelle.
            </li>
            <li>
              Sous réserve du respect des CGU, l&apos;Éditeur concède au Client
              une licence non exclusive, non transférable et révocable lui
              permettant d&apos;utiliser le Site et d&apos;exploiter les
              Résultats pour ses seuls besoins internes.
            </li>
            <li>
              Toute reproduction, extraction, ingénierie inverse, réutilisation
              systématique, mise à disposition ou exploitation commerciale des
              Résultats ou du modèle d&apos;évaluation est interdite sans
              autorisation écrite préalable.
            </li>
          </ul>
        </section>

        <section id="s9" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            9. Données, confidentialité et protection des données personnelles
          </h2>

          <h3 className="mt-6 text-lg font-semibold text-gray-900">
            9.1. Données saisies et finalités
          </h3>
          <p className="mt-3">Les Données saisies sont utilisées pour&nbsp;:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              produire les Résultats (score, rapport, recommandations
              génériques)&nbsp;;
            </li>
            <li>
              améliorer le modèle d&apos;évaluation, la qualité du service et la
              sécurité&nbsp;;
            </li>
            <li>établir des statistiques et analyses anonymisées.</li>
          </ul>

          <h3 className="mt-6 text-lg font-semibold text-gray-900">
            9.2. Données personnelles (RGPD)
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              L&apos;Éditeur agit en responsable de traitement pour les données
              personnelles collectées via le Site.
            </li>
            <li>
              <strong>Base(s) légale(s)&nbsp;:</strong> exécution du contrat
              (fourniture du service), intérêt légitime (amélioration, sécurité,
              prévention de la fraude) et consentement lorsque requis
              (prospection, cookies non essentiels).
            </li>
            <li>
              Les droits des personnes (accès, rectification, effacement,
              opposition, limitation, portabilité, directives post-mortem)
              s&apos;exercent à&nbsp;:{" "}
              <a href={`mailto:${PROVECTIO_DPO}`} className={linkClass}>
                {PROVECTIO_DPO}
              </a>{" "}
              | 6 allée Adolphe Bobière, 35000 Rennes, avec justificatif
              d&apos;identité si nécessaire.
            </li>
            <li>
              Réclamation possible auprès de la CNIL (
              <a
                href="https://www.cnil.fr"
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                www.cnil.fr
              </a>
              ).
            </li>
            <li>
              Les durées de conservation sont détaillées dans la Politique de
              confidentialité&nbsp;:{" "}
              <a
                href={PRIVACY_POLICY_URL}
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                {PRIVACY_POLICY_URL}
              </a>
            </li>
          </ul>

          <h3 className="mt-6 text-lg font-semibold text-gray-900">
            9.3. Hébergement – Sous-traitants – Transferts
          </h3>
          <p className="mt-3">
            Les données sont hébergées chez Provectio, situé en France.
            L&apos;Éditeur peut recourir à des sous-traitants (hébergement,
            e-mailing, analytics, support), encadrés par des contrats conformes
            au RGPD. Le cas échéant, les transferts hors UE sont encadrés
            (clauses types, garanties additionnelles). La liste à jour des
            sous-traitants est disponible sur demande ou via la Politique de
            confidentialité.
          </p>

          <h3 className="mt-6 text-lg font-semibold text-gray-900">
            9.4. Confidentialité
          </h3>
          <p className="mt-3">
            L&apos;Éditeur s&apos;engage à traiter les Données du Client comme
            confidentielles et à ne pas les divulguer, sauf (i) consentement du
            Client, (ii) obligation légale/réglementaire, (iii) défense des
            droits de l&apos;Éditeur, (iv) prestataires dûment habilités.
          </p>

          <h3 className="mt-6 text-lg font-semibold text-gray-900">
            9.5. Cookies et traceurs
          </h3>
          <p className="mt-3">
            L&apos;utilisation de cookies est décrite dans la Politique cookies
            (bannière et gestionnaire de préférences)&nbsp;:{" "}
            <a
              href={PRIVACY_POLICY_URL}
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              {PRIVACY_POLICY_URL}
            </a>
          </p>
        </section>

        <section id="s10" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">10. Sécurité</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              L&apos;Éditeur met en œuvre des mesures techniques et
              organisationnelles raisonnables (contrôles d&apos;accès,
              chiffrement en transit au minimum, journalisation, sauvegardes)
              adaptées aux risques.
            </li>
            <li>
              L&apos;Utilisateur/Client demeure responsable de la sécurité de
              ses terminaux, de son réseau, de la qualité et de l&apos;exactitude
              des données fournies.
            </li>
            <li>
              Toute faille ou incident suspecté doit être signalé sans délai
              à&nbsp;:{" "}
              <a href={`mailto:${PROVECTIO_CONTACT}`} className={linkClass}>
                {PROVECTIO_CONTACT}
              </a>
              .
            </li>
          </ul>
        </section>

        <section id="s11" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            11. Garanties – Exclusions
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              Le Site et les Résultats sont fournis «&nbsp;en l&apos;état&nbsp;».
              L&apos;Éditeur n&apos;accorde aucune garantie expresse ou implicite,
              notamment de conformité à un référentiel donné, d&apos;adéquation à
              un usage particulier, de continuité ou d&apos;absence d&apos;erreur.
            </li>
            <li>
              Les recommandations éventuellement affichées sont génériques et ne
              remplacent pas un audit ou un conseil rendu par un professionnel
              qualifié.
            </li>
          </ul>
        </section>

        <section id="s12" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            12. Responsabilité – Limitation
          </h2>
          <p className="mt-4">
            Dans la limite permise par la loi, l&apos;Éditeur ne saurait être tenu
            responsable des dommages indirects (perte d&apos;exploitation, perte
            de données, atteinte à l&apos;image, manque à gagner) ni des
            conséquences liées à&nbsp;:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>l&apos;inexactitude des Données saisies&nbsp;;</li>
            <li>l&apos;utilisation des Résultats&nbsp;;</li>
            <li>des indisponibilités ou dysfonctionnements&nbsp;;</li>
            <li>
              des attaques ou intrusions non imputables à une faute de
              l&apos;Éditeur.
            </li>
          </ul>
          <p className="mt-4">
            En toute hypothèse, la responsabilité totale de l&apos;Éditeur, tous
            fondements confondus, sera capée au plus élevé des deux montants
            suivants&nbsp;: (a) 1&nbsp;000&nbsp;€, ou (b) les sommes
            effectivement payées par le Client au titre des 12 derniers mois pour
            l&apos;accès au Site (si service payant).
          </p>
          <p className="mt-3">
            Aucune clause n&apos;exclut la responsabilité en cas de dol ou de
            faute lourde, ni les droits impératifs du consommateur si applicable
            (service destiné prioritairement aux professionnels).
          </p>
        </section>

        <section id="s13" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            13. Indemnisation (B2B)
          </h2>
          <p className="mt-4">
            Le Client garantit et indemnisera l&apos;Éditeur contre toute
            réclamation de tiers résultant d&apos;une utilisation non conforme du
            Site, d&apos;une violation des CGU ou d&apos;atteintes aux droits des
            tiers (y compris données et propriété intellectuelle).
          </p>
        </section>

        <section id="s14" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            14. Évolution du Site et des CGU – Versioning
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              L&apos;Éditeur peut modifier les CGU à tout moment. Les
              modifications substantielles feront l&apos;objet d&apos;une
              information raisonnable aux Utilisateurs enregistrés (e-mail ou
              notification sur le Site).
            </li>
            <li>
              L&apos;usage du Site postérieur à l&apos;entrée en vigueur vaut
              acceptation. L&apos;Éditeur conserve l&apos;historique des versions
              applicables.
            </li>
          </ul>
        </section>

        <section id="s15" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">15. Force majeure</h2>
          <p className="mt-4">
            Aucune partie n&apos;est responsable d&apos;un manquement dû à un
            événement de force majeure au sens de l&apos;article&nbsp;1218 du Code
            civil (y compris pannes externes majeures, cyber-attaques à large
            échelle, décisions administratives, catastrophes).
          </p>
        </section>

        <section id="s16" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            16. Cession – Sous-licence – Sous-traitance
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              Les droits concédés à l&apos;Utilisateur/Client sont intuitu
              personae et ne peuvent être cédés/sous-licenciés sans accord écrit
              de l&apos;Éditeur.
            </li>
            <li>
              L&apos;Éditeur peut librement sous-traiter tout ou partie des
              prestations, dans le respect du RGPD.
            </li>
          </ul>
        </section>

        <section id="s17" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            17. Preuve – Convention de preuve
          </h2>
          <p className="mt-4">
            Les journaux, horodatages, sauvegardes, extractions et rapports issus
            des systèmes de l&apos;Éditeur feront foi entre les parties, sous
            réserve de preuve contraire.
          </p>
        </section>

        <section id="s18" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            18. Nullité partielle – Tolérance – Intégralité
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              La nullité d&apos;une clause n&apos;affecte pas la validité des
              autres.
            </li>
            <li>
              Le fait pour l&apos;une des parties de ne pas se prévaloir d&apos;un
              manquement n&apos;emporte pas renonciation.
            </li>
            <li>
              Les présentes CGU constituent l&apos;intégralité de l&apos;accord
              relatif à l&apos;utilisation du Site.
            </li>
          </ul>
        </section>

        <section id="s19" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">
            19. Droit applicable – Juridiction compétente
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>Les CGU sont régies par le droit français.</li>
            <li>
              Compétence exclusive est attribuée aux tribunaux du ressort du
              siège social de l&apos;Éditeur, y compris en cas de pluralité de
              défendeurs ou d&apos;appel en garantie, sauf dispositions légales
              impératives contraires.
            </li>
          </ul>
        </section>

        <section id="s20" className={sectionClass}>
          <h2 className="text-xl font-bold text-gray-900">20. Contact – DPO</h2>
          <p className="mt-4">
            Pour toute question relative au Site, aux CGU ou à la protection des
            données&nbsp;:
          </p>
          <ul className="mt-4 space-y-2 rounded-2xl bg-gray-50 p-5">
            <li>
              <strong>Support général :</strong>{" "}
              <a href={`mailto:${PROVECTIO_CONTACT}`} className={linkClass}>
                {PROVECTIO_CONTACT}
              </a>
            </li>
            <li>
              <strong>Sécurité :</strong>{" "}
              <a href={`mailto:${PROVECTIO_CONTACT}`} className={linkClass}>
                {PROVECTIO_CONTACT}
              </a>
            </li>
            <li>
              <strong>DPO / Référent RGPD :</strong>{" "}
              <a href={`mailto:${PROVECTIO_DPO}`} className={linkClass}>
                {PROVECTIO_DPO}
              </a>
            </li>
            <li>
              <strong>Adresse postale :</strong> 6 allée Adolphe Bobière, 35000
              Rennes
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}
