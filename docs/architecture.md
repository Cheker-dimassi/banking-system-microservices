## Architecture globale

```
[Frontend] --> [Gateway API] --> [Microservices]
                                |--> Auth (JWT, KYC)
                                |--> Accounts (balances)
                                |--> Transactions (Saga orchestrator)
                                |--> Payments
                                |--> Notifications
                                |--> Audit
```

- **Communication** : REST + events (Kafka / RabbitMQ).  
- **Base de données** : Postgres par service (pattern database-per-service).  
- **Observabilité** : chaque service pousse logs vers `audit-service` et métriques (Prometheus).  
- **Sécurité** : JWT signés par `auth-service`, vérifiés par Gateway + services sensibles.

### Ports par défaut
| Service | Port |
|---------|------|
| Gateway | 7100 |
| Auth | 7001 |
| Accounts | 7002 |
| Transactions | 7003 |
| Payments | 7004 |
| Notifications | 7005 |
| Audit | 7006 |

### Flot d'un virement interbancaire
1. Client appelle Gateway.
2. Gateway valide JWT avec Auth Service.
3. Transactions Service demarre une Saga:
   - Réserve le montant via Accounts Service.
   - Appelle API externe interbanque.
   - Confirme ou annule.
4. Notifications Service envoie email/SMS.
5. Audit Service journalise l'opération.

