## Accounts Service (Owner: Aymen Somai)

- CRUD des comptes, soldes, historique.
- Fournit API `GET /accounts/:id`, `POST /accounts`.
- Écoute les événements `transaction.completed` pour mettre à jour les soldes.

### Backlog
- [ ] Choisir ORM (Prisma, Sequelize...).
- [ ] Implémenter réservations de fonds pour la Saga des transactions.
- [ ] Exposer métriques Prometheus (`/metrics`).

