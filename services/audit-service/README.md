## Audit Service

- Centralise logs métiers et conformité.
- Stocke tous les événements importants + recherche (ELK/OpenSearch).
- API read-only pour les contrôleurs internes.

### Étapes
- [ ] Choisir stockage (Postgres, Mongo, OpenSearch).
- [ ] Ajouter indexation par `sagaId`, `accountId`.
- [ ] Hooks d'export CSV/PDF.

