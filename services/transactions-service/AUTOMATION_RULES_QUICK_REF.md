# Automation Rules - Quick Reference

## Quick Create Examples

### 1. Save 10% of Deposits
```json
POST /transactions/auto-rules
{
  "accountId": "ACC_123",
  "name": "Auto-Save 10%",
  "type": "save_percentage",
  "trigger": "on_deposit",
  "action": {
    "targetAccount": "ACC_456",
    "percentage": 10
  }
}
```

### 2. Round Up Purchases
```json
POST /transactions/auto-rules
{
  "accountId": "ACC_123",
  "name": "Round Up Savings",
  "type": "round_up",
  "trigger": "on_withdrawal",
  "action": {
    "targetAccount": "ACC_456",
    "roundUpTo": 10
  },
  "limits": {
    "maxPerDay": 50
  }
}
```

### 3. Salary Day Transfer
```json
POST /transactions/auto-rules
{
  "accountId": "ACC_123",
  "name": "Salary Savings",
  "type": "fixed_transfer",
  "trigger": "on_salary",
  "conditions": {
    "minAmount": 2000
  },
  "action": {
    "targetAccount": "ACC_456",
    "fixedAmount": 500
  }
}
```

## All Endpoints

```
POST   /transactions/auto-rules                     Create rule
GET    /transactions/auto-rules/:accountId          List rules
GET    /transactions/auto-rules/rule/:id            Get rule
PUT    /transactions/auto-rules/:id                 Update rule
DELETE /transactions/auto-rules/:id                 Delete rule
PATCH  /transactions/auto-rules/:id/toggle          Toggle active
GET    /transactions/auto-rules/:id/history         Execution history
GET    /transactions/auto-rules/:id/statistics      Statistics
```

## Rule Types

| Type | Requires | Example |
|------|----------|---------|
| `save_percentage` | `percentage` | Save 10% |
| `round_up` | `roundUpTo` | Round to 10  TND |
| `fixed_transfer` | `fixedAmount` | Transfer 100 TND |
| `conditional_transfer` | `fixedAmount` + `conditions` | If > 1000, transfer 100 |
| `auto_invest` | `percentage` OR `fixedAmount` | Invest 5% |

## Triggers

| Trigger | When |
|---------|------|
| `on_deposit` | Money deposited |
| `on_withdrawal` | Money withdrawn |
| `on_transfer_in` | Receiving transfer |
| `on_transfer_out` | Sending transfer |
| `on_any_transaction` | Any transaction |
| `on_salary` | Salary deposit (checks description) |

## Conditions (Optional)

```json
"conditions": {
  "minAmount": 100,           // Minimum transaction amount
  "maxAmount": 10000,         // Maximum transaction amount
  "transactionTypes": ["deposit", "withdrawal"],
  "descriptionContains": "salary",  // Description must contain
  "dayOfMonth": 15,          // Only on 15th of month
  "dayOfWeek": 1             // Only on Mondays (0=Sunday)
}
```

## Limits (Optional)

```json
"limits": {
  "maxPerTransaction": 100,  // Max amount per execution
  "maxPerDay": 500,          // Max daily total
  "maxPerMonth": 2000        // Max monthly total
}
```

## Common Use Cases

**🏦 Savings Builder**
```
Save 15% of every deposit → Build emergency fund
```

**🔄 Round-Up Challenge**
```
Round up all purchases to nearest 10 TND → Painless micro-savings
```

**💰 Salary Automation**
```
When salary arrives:
- 20% → Savings
- 10% → Investment
- 5% → Emergency fund
```

**📊 Smart Investing**
```
When receiving transfer > 1000 TND → Invest 10% automatically
```

**🎯 Goal-Based Savings**
```
Every withdrawal → Transfer 5 TND to vacation fund
```

## Testing Flow

```bash
# 1. Create
curl -X POST http://localhost:3001/transactions/auto-rules \
  -H "Content-Type: application/json" \
  -d '{ ... }'

# 2. Trigger (make transaction)
curl -X POST http://localhost:3001/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{"toAccount": "ACC_123", "amount": 1000}'

# 3. Verify
curl http://localhost:3001/transactions/auto-rules/RULE_ID/statistics
```

## Tips

✅ **DO**:
- Set reasonable limits to prevent over-automation
- Use descriptive names for rules
- Test with small amounts first
- Monitor statistics regularly

❌ **DON'T**:
- Set source and target as same account
- Create conflicting rules
- Set percentages > 100%
- Forget to check account balances

## Error Messages

| Error | Reason | Fix |
|-------|--------|-----|
| "Account not found" | Invalid accountId | Use ACC_123, ACC_456, or EXT_999 |
| "Source and target must be different" | Same account used | Use different accounts |
| "Missing required fields" | Incomplete data | Check required fields for rule type |
| "Amount exceeds limits" | Limit reached | Increase limits or wait |

---

**Developed by**: Chaker Allah Dimassi  
**Service**: Transaction Management Microservice  
**Team**: TechWin
