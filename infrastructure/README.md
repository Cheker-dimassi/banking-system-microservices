## Infrastructure

- `compose.yaml` (à venir) pour démarrer toutes les dépendances (Postgres, Kafka, Redis).
- Scripts IaC (Terraform / Pulumi) pour provision cloud.
- Dossier `k8s/` pour manifests par service.

### To-do
- [ ] Définir réseau local (Docker) + variables partagées.
- [ ] Ajouter observabilité (Prometheus, Grafana, Loki).
- [ ] Sécuriser secrets (Vault, SOPS).

