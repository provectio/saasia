# Diagnostic SaaS & IA — Provectio

Single-page application pour l'auto-diagnostic « Votre SI est-il prêt pour le SaaS et l'IA ? ».

## Fonctionnalités

- Questionnaire 16 questions en 6 blocs (wizard)
- 2 scores séparés : **SaaS Readiness** et **IA Readiness** (normalisés sur 100)
- Radar 6 axes superposé (courbes SaaS bleue + IA violette)
- 7 profils commerciaux avec CTA personnalisé
- Capture lead (nom, prénom, email, société, fonction, téléphone optionnel)
- Rapport personnalisé généré localement
- Téléchargement PDF via impression navigateur
- Tracking UTM (`AG_EC_PDL_2026` par défaut pour le salon)

## Développement local

```bash
npm install
npm run dev
```

Site : http://localhost:4321/

### Avec API (enregistrement des leads)

```bash
PUBLIC_API_BASE_URL=http://localhost:3000/api/v1 npm run dev
```

## Scoring

- Chaque réponse : 0, 1 ou 2 points
- Pondération par question (⭐ = 0,5 · ⭐⭐ = 1 · ⭐⭐⭐ = 1,5)
- Normalisation : `(score brut / max théorique) × 100` (max calculé depuis les pondérations)

| Score | SaaS | IA |
|-------|------|-----|
| 0–35 | Fragile | Non prêt |
| 36–65 | Perfectible | Presque prêt |
| 66–100 | Maîtrisé | Prêt pour l'IA |

## Structure

Inspirée du projet [evaluation-infogerance](../evaluation-infogerance/) (Astro + React + Tailwind).

## Docker (production)

### Développement local (front + API + back-office)

```bash
cp .env.example .env
# Éditer SESSION_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD

docker compose up -d --build
```

- Site : http://localhost:8086/
- Back-office : http://localhost:8086/management

### Production (VM)

```bash
cp .env.production.example .env
# Renseigner SESSION_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, CORS_ORIGINS

docker login ghcr.io
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

**Sur la VM, ne pas lancer** `docker compose build` en production : les images sont publiées sur GHCR via GitHub Actions (`ghcr.io/provectio/saasia` et `ghcr.io/provectio/saasia-api`).

### Variables `.env` sur la VM

| Variable | Description |
|----------|-------------|
| `SESSION_SECRET` | Secret session (min. 32 car.) — `openssl rand -hex 32` |
| `ADMIN_USERNAME` | Identifiant admin (créé au 1er démarrage si base vide) |
| `ADMIN_PASSWORD` | Mot de passe initial (fort) |
| `CORS_ORIGINS` | Origine du site public (ex. `https://diag-saasia.provectio.fr`) |
| `HTTP_PORT` | Port exposé (défaut `8086`) |

**Première connexion :** ouvrir `/management`, se connecter, scanner le QR code 2FA, valider avec un code à 6 chiffres.

Les données sont dans le volume Docker `api-data` (`/data/leads.db`).

### Images Docker

| Image | Rôle |
|-------|------|
| `ghcr.io/provectio/saasia:latest` | Site statique + nginx (proxy `/api`, `/management`) |
| `ghcr.io/provectio/saasia-api:latest` | API + back-office + SQLite |
