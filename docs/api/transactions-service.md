## Transactions Service API (v1)

| Endpoint | Méthode | Description | Auth |
|----------|---------|-------------|------|
| `/transactions/deposit` | POST | Dépôt sur compte interne | Bearer |
| `/transactions/withdraw` | POST | Retrait | Bearer |
| `/transactions/transfer/internal` | POST | Virement même banque | Bearer |
| `/transactions/transfer/external` | POST | Interbancaire (via partenaire) | Bearer |
| `/transactions/:id` | GET | Détails d'une transaction | Bearer |

### Payload type (ex: internal transfer)
```json
{
  "fromAccount": "ACC-123",
  "toAccount": "ACC-456",
  "amount": 250.0,
  "currency": "EUR",
  "metadata": {
    "purpose": "Invoice 2024-0001"
  }
}
```

### Idempotence
- Header `Idempotency-Key` requis pour tous les transferts.
- Les clés expirent après 24h, stockées côté Transactions Service (Redis).

### Événements émis
- `transaction.initiated`
- `transaction.completed`
- `transaction.failed`

Chaque événement inclut `sagaId`, `accountSnapshot`, `auditTrail`.

