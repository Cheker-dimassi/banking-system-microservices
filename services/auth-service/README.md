## Auth Service (Owner: Dhafer Sellami)

- Gestion des utilisateurs, rôles, KYC.
- Fournit JWT/OAuth2 au Gateway et aux autres services.

### Todo
- [ ] Choisir framework (NestJS, Express...).
- [ ] Implémenter endpoints `/register`, `/login`, `/kyc`.
- [ ] Publier événements `user.verified`.

### Démarrer
1. `npm init -y`
2. `npm install <deps>`
3. Ajouter `.env` (voir `env.example` à la racine).

