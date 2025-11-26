## Contribution TechWin

1. **Fork & clone** le dépôt, ou crée une branche directement si tu as les droits.
2. **Branche** : `service/<service>-<feature>` (ex. `service/auth-kyc-flow`).
3. **Issue obligatoire** pour toute fonctionnalité ou bug non trivial. Relier la PR à l'issue.
4. **Tests & lint** : exécuter `npm test` et `npm run lint` dans le service modifié.
5. **Commits** format Conventional: `feat(transactions): add saga orchestrator`.
6. **Pull Request**
   - Checklist : tests ok, docs à jour, reviewers mentionnés.
   - Inclure captures Postman/Swagger si API changée.
7. **Docs**
   - API → `docs/api/<service>.md`.
   - Architecture ou RFC → `docs/architecture.md` ou nouveau fichier.
8. **Revue**
   - 1 reviewer minimum externe au service concerné.
   - Résoudre toutes les conversations avant fusion.

> Astuce : utiliser `docs/templates/api-contract.md` pour documenter les nouvelles routes.

