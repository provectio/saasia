# Traefik — dépannage certificat `saas-readiness.provectio.fr`

## Symptôme

`NET::ERR_CERT_AUTHORITY_INVALID` dans Chrome : Traefik répond en HTTPS mais avec un certificat **non émis par une AC reconnue** (souvent le certificat par défaut auto-signé de Traefik).

Ce n’est **pas** un problème du conteneur `saasia` (nginx interne est en **HTTP** sur le port 80).

## Cause la plus fréquente

Le routeur Traefik pour `saas-readiness.provectio.fr` :

- n’existe pas encore → Traefik sert son **certificat par défaut** ;
- existe mais **sans** `tls.certresolver` → pas de Let’s Encrypt ;
- utilise un mauvais nom de resolver (`letsencrypt` vs `le` vs autre).

## Ce qu’il faut faire

### 1. Copier la config de `diag-infogerance.provectio.fr`

Sur la VM, retrouvez comment l’infogérance est déclarée (labels Docker ou fichier dynamique Traefik) :

```bash
docker inspect diaginfogerance --format '{{ json .Config.Labels }}' | jq
# ou
grep -r "diag-infogerance" /chemin/vers/traefik/
```

Repérez notamment :

- le **réseau** Docker (`traefik.docker.network`)
- le **certresolver** (`tls.certresolver=...`)
- les **entrypoints** (`web` / `websecure`)

### 2. Déclarer `saas-readiness` de la même façon

**Option A — labels Docker** (fichier fourni) :

```bash
# Dans .env sur la VM :
TRAEFIK_NETWORK=traefik          # même réseau que diaginfogerance
TRAEFIK_CERT_RESOLVER=letsencrypt # même resolver que diag-infogerance

docker compose -f docker-compose.prod.yml -f docker-compose.traefik.yml up -d
```

**Option B — fichier dynamique Traefik** (si diag-infogerance est en file provider) :

```yaml
http:
  routers:
    saasia:
      rule: Host(`saas-readiness.provectio.fr`)
      entryPoints:
        - websecure
      service: saasia
      tls:
        certResolver: letsencrypt   # adapter au nom réel

  services:
    saasia:
      loadBalancer:
        servers:
          - url: http://127.0.0.1:8086   # ou http://saasia:80 si réseau Docker partagé
```

### 3. Vérifications

```bash
# Le conteneur répond en HTTP (OK) :
curl -I http://127.0.0.1:8086/

# Certificat présenté par Traefik (doit mentionner Let's Encrypt / R3) :
openssl s_client -connect saas-readiness.provectio.fr:443 -servername saas-readiness.provectio.fr </dev/null 2>/dev/null | openssl x509 -noout -issuer -subject

# Logs Traefik (échec ACME ?) :
docker logs <conteneur-traefik> 2>&1 | tail -50
```

### 4. DNS

`saas-readiness.provectio.fr` doit pointer vers l’IP où **Traefik** écoute sur 443 (pas un autre service avec un certificat différent).

## À ne pas faire

- Activer TLS dans le conteneur `saasia` : Traefik gère déjà le HTTPS.
- Utiliser le fichier `deploy/nginx-saas-readiness.conf.example` **en plus** de Traefik sur le même domaine (double proxy / mauvais certificat).

## Variables `.env` (Traefik)

```env
TRAEFIK_NETWORK=traefik
TRAEFIK_CERT_RESOLVER=letsencrypt
CORS_ORIGINS=https://saas-readiness.provectio.fr
```
