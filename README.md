## Système Bancaire - TechWin

Plateforme bancaire modulaire construite par l'équipe **TechWin**.  
Chaque microservice est développé par un membre différent et versionné dans ce dépôt commun.

### Microservices
- `services/auth-service` · Authentification, KYC, rôles (Dhafer Sellami)
- `services/accounts-service` · Gestion des comptes courants/épargne (Aymen Somai)
- `services/transactions-service` · Dépôts, retraits, virements, atomicité (Chaker Allah Dimassi)
- `services/payments-service` · Paiement de factures, cartes virtuelles
- `services/notifications-service` · Emails/SMS/push
- `services/audit-service` · Journalisation et traçabilité
- `gateway` · API Gateway / BFF
- `frontend` · Tableau de bord client & back-office

### Démarrage rapide
1. `npm install` (ou l'outil propre à chaque service) dans le dossier concerné.
2. Copier `.env.example` vers `.env` et compléter les secrets.
3. Lancer `docker compose up --build` pour démarrer les dépendances communes (DB, bus de messages, etc.).  
4. Démarrer votre microservice en local (`npm run dev`, `nest start`, etc.). Les ports par défaut sont listés dans `docs/architecture.md`.

### Conventions d'équipe
- **Branches** : `service/<name>-<description>` (ex: `service/transactions-saga`).
- **Commits** : `feat(transactions): add internal transfer`.
- **Revues** : toute PR doit être approuvée par au moins 1 membre non auteur.
- **Docs** : toute nouvelle API => mise à jour `docs/api/`.

### Structure
```
docs/                  # Architecture, API, RFCs
frontend/              # Application web (React/Next/etc.)
gateway/               # API Gateway (NestJS, Express, etc.)
services/
  auth-service/
  accounts-service/
  transactions-service/
  payments-service/
  notifications-service/
  audit-service/
infrastructure/        # IaC, Docker, pipelines
.github/               # Workflows + templates
```

### Contribution
Lire `CONTRIBUTING.md` pour le workflow détaillé (issues, PR, qualité).  
Chaque service garde son README avec instructions techniques spécifiques.

