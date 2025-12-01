# Testing Automation Rules (Métier 4)

This guide shows you how to test the automation rules endpoints.

## What are Automation Rules?

Automation rules allow users to set up automated actions that trigger based on their transactions. Examples:
- **Auto-save 10% of every deposit**
- **Round up purchases and save the difference**
- **Automatically transfer to savings on salary day**

---

## Prerequisites

1. **Server must be running**:
   ```bash
   npm run dev
   ```
   Server should be on `http://localhost:3001`

2. **Test accounts available**:
   - `ACC_123` - Main account (balance: 5500 TND)
   - `ACC_456` - Savings account (balance: 3000 TND)
   - `EXT_999` - External account

---

## Test 1: Create an Automation Rule

### Example 1: Save 10% of Every Deposit

```bash
curl -X POST http://localhost:3001/transactions/auto-rules \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACC_123",
    "name": "Auto-Save 10%",
    "description": "Automatically save 10% of every deposit",
    "type": "save_percentage",
    "trigger": "on_deposit",
    "action": {
      "targetAccount": "ACC_456",
      "actionType": "save",
      "percentage": 10,
      "description": "Automatic savings"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Automation rule created successfully",
  "rule": {
    "ruleId": "RULE_1738047821234_ABC123",
    "accountId": "ACC_123",
    "name": "Auto-Save 10%",
    "type": "save_percentage",
    "trigger": "on_deposit",
    "isActive": true
  }
}
```

### Example 2: Round Up & Save

```bash
curl -X POST http://localhost:3001/transactions/auto-rules \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACC_123",
    "name": "Round Up Savings",
    "description": "Round up transactions to nearest 10 TND and save difference",
    "type": "round_up",
    "trigger": "on_withdrawal",
    "action": {
      "targetAccount": "ACC_456",
      "actionType": "save",
      "roundUpTo": 10,
      "description": "Round-up savings"
    },
    "limits": {
      "maxPerTransaction": 10,
      "maxPerDay": 50,
      "maxPerMonth": 200
    }
  }'
```

### Example 3: Salary Day Auto-Transfer

```bash
curl -X POST http://localhost:3001/transactions/auto-rules \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACC_123",
    "name": "Salary Day Savings",
    "description": "Save fixed amount when salary is deposited",
    "type": "fixed_transfer",
    "trigger": "on_salary",
    "conditions": {
      "minAmount": 2000,
      "descriptionContains": "salary"
    },
    "action": {
      "targetAccount": "ACC_456",
      "actionType": "save",
      "fixedAmount": 500,
      "description": "Monthly savings from salary"
    }
  }'
```

---

## Test 2: Trigger the Automation Rule

Now make a deposit to trigger the automation rule:

```bash
curl -X POST http://localhost:3001/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "toAccount": "ACC_123",
    "amount": 1000,
    "description": "Test deposit to trigger automation"
  }'
```

**What happens:**
1. The deposit completes successfully (1000 TND added to ACC_123)
2. The automation rule triggers automatically
3. 10% (100 TND) is automatically transferred from ACC_123 to ACC_456
4. Check the console logs - you'll see: `🤖 Executed 1 automation rules for transaction TXN_...`

---

## Test 3: Get All Rules for an Account

```bash
curl http://localhost:3001/transactions/auto-rules/ACC_123
```

**Expected Response:**
```json
{
  "success": true,
  "accountId": "ACC_123",
  "count": 1,
  "rules": [
    {
      "ruleId": "RULE_...",
      "name": "Auto-Save 10%",
      "type": "save_percentage",
      "trigger": "on_deposit",
      "isActive": true,
      "executionCount": 1,
      "totalAmountProcessed": 100,
      "lastExecuted": "2025-01-27T08:30:00.000Z"
    }
  ]
}
```

---

## Test 4: Get Rule Execution History

```bash
curl http://localhost:3001/transactions/auto-rules/RULE_1738047821234_ABC123/history
```

This shows all transactions created by this automation rule.

---

## Test 5: Get Rule Statistics

```bash
curl http://localhost:3001/transactions/auto-rules/RULE_1738047821234_ABC123/statistics
```

**Expected Response:**
```json
{
  "success": true,
  "statistics": {
    "ruleId": "RULE_...",
    "ruleName": "Auto-Save 10%",
    "isActive": true,
    "totalExecutions": 5,
    "totalAmountProcessed": 500,
    "lastExecuted": "2025-01-27T12:00:00.000Z",
    "today": {
      "executions": 2,
      "amount": 200
    },
    "thisMonth": {
      "executions": 5,
      "amount": 500
    }
  }
}
```

---

## Test 6: Update an Automation Rule

```bash
curl -X PUT http://localhost:3001/transactions/auto-rules/RULE_1738047821234_ABC123 \
  -H "Content-Type: application/json" \
  -d '{
    "action": {
      "targetAccount": "ACC_456",
      "actionType": "save",
      "percentage": 15,
      "description": "Increased to 15% savings"
    }
  }'
```

---

## Test 7: Toggle Rule (Disable/Enable)

```bash
curl -X PATCH http://localhost:3001/transactions/auto-rules/RULE_1738047821234_ABC123/toggle
```

This will toggle the `isActive` status. If it was active, it becomes inactive (and vice versa).

---

## Test 8: Delete an Automation Rule

```bash
curl -X DELETE http://localhost:3001/transactions/auto-rules/RULE_1738047821234_ABC123
```

---

## Advanced: Test with Conditions

### Create Rule with Multiple Conditions

```bash
curl -X POST http://localhost:3001/transactions/auto-rules \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACC_123",
    "name": "Large Deposit Saver",
    "description": "Save 20% only on deposits over 1000 TND",
    "type": "save_percentage",
    "trigger": "on_deposit",
    "conditions": {
      "minAmount": 1000,
      "maxAmount": 10000
    },
    "action": {
      "targetAccount": "ACC_456",
      "actionType": "save",
      "percentage": 20,
      "description": "Large deposit savings"
    },
    "limits": {
      "maxPerTransaction": 500,
      "maxPerDay": 1000
    }
  }'
```

Now test with different deposit amounts:

```bash
# This should NOT trigger (below minimum)
curl -X POST http://localhost:3001/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{"toAccount": "ACC_123", "amount": 500}'

# This SHOULD trigger (within range)
curl -X POST http://localhost:3001/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{"toAccount": "ACC_123", "amount": 2000}'
```

---

## All Available Rule Types

1. **`save_percentage`** - Save X% of transaction amount
   - Requires: `action.percentage`

2. **`round_up`** - Round up to nearest amount and save difference
   - Requires: `action.roundUpTo`

3. **`fixed_transfer`** - Transfer fixed amount on trigger
   - Requires: `action.fixedAmount`

4. **`conditional_transfer`** - Transfer if conditions met
   - Requires: `action.fixedAmount` + `conditions`

5. **`auto_invest`** - Automatically invest amount
   - Requires: `action.percentage` OR `action.fixedAmount`

---

## All Available Triggers

1. **`on_deposit`** - When money is deposited
2. **`on_withdrawal`** - When money is withdrawn
3. **`on_transfer_in`** - When receiving a transfer
4. **`on_transfer_out`** - When sending a transfer
5. **`on_any_transaction`** - Any completed transaction
6. **`on_salary`** - Salary deposits (checks for "salary" in description)

---

## Testing Checklist

- [ ] Create automation rule successfully
- [ ] Trigger automation rule with a transaction
- [ ] Verify automated transaction was created
- [ ] Check rule execution count increased
- [ ] View rule execution history
- [ ] View rule statistics
- [ ] Update rule settings
- [ ] Disable/enable rule
- [ ] Delete rule
- [ ] Test with conditions (min/max amount)
- [ ] Test with limits (per transaction, daily, monthly)

---

## Troubleshooting

### Rule not executing?
- Check `isActive` is `true`
- Verify trigger matches transaction type
- Check if conditions are met
- Verify limits haven't been reached

### Getting insufficient balance error?
- The source account needs enough balance for both the original transaction AND the automated transfer

### Can't create rule?
- Ensure both `accountId` and `action.targetAccount` exist
- Verify they are different accounts
- Check all required fields for the rule type are provided

---

## Next Steps

After testing, you can:
1. Create multiple automation rules per account
2. Combine different rule types (save on deposits, round-up on withdrawals)
3. Set up complex conditions for smart automation
4. Monitor automation performance with statistics
5. Export automation history for reporting
