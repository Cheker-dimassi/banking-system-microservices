# Métier 4: Automation Rules - Complete API Reference

## Base URL
```
http://localhost:3001
```

---

## 1. CREATE AUTOMATION RULE

### Endpoint
```
POST /transactions/auto-rules
```

### Example 1: Auto-Save Percentage
```json
{
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
}
```

### Example 2: Round-Up Savings
```json
{
  "accountId": "ACC_123",
  "name": "Round-Up Savings",
  "description": "Round up withdrawals to nearest 10 TND and save difference",
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
}
```

### Example 3: Fixed Transfer on Salary
```json
{
  "accountId": "ACC_123",
  "name": "Salary Day Savings",
  "description": "Save 500 TND when salary is deposited",
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
    "description": "Monthly salary savings"
  }
}
```

### Example 4: Conditional Transfer
```json
{
  "accountId": "ACC_123",
  "name": "Large Deposit Saver",
  "description": "Save 20% on deposits over 1000 TND",
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
}
```

### Example 5: Auto-Invest
```json
{
  "accountId": "ACC_123",
  "name": "Auto-Invest 5%",
  "description": "Automatically invest 5% of deposits",
  "type": "auto_invest",
  "trigger": "on_deposit",
  "action": {
    "targetAccount": "ACC_456",
    "actionType": "invest",
    "percentage": 5,
    "description": "Automatic investment"
  }
}
```

---

## 2. GET ALL RULES FOR ACCOUNT

### Endpoint
```
GET /transactions/auto-rules/:accountId
```

### Examples
```
GET /transactions/auto-rules/ACC_123
GET /transactions/auto-rules/ACC_456
```

### No Body Required (GET request)

---

## 3. GET SPECIFIC RULE BY ID

### Endpoint
```
GET /transactions/auto-rules/rule/:id
```

### Example
```
GET /transactions/auto-rules/rule/RULE_1738047821234_ABC123
```

### No Body Required (GET request)

---

## 4. UPDATE AUTOMATION RULE

### Endpoint
```
PUT /transactions/auto-rules/:id
```

### Example 1: Update Percentage
```
PUT /transactions/auto-rules/RULE_1738047821234_ABC123
```
```json
{
  "action": {
    "targetAccount": "ACC_456",
    "actionType": "save",
    "percentage": 15,
    "description": "Updated to 15% savings"
  }
}
```

### Example 2: Update Limits
```
PUT /transactions/auto-rules/RULE_1738047821234_ABC123
```
```json
{
  "limits": {
    "maxPerTransaction": 200,
    "maxPerDay": 1000,
    "maxPerMonth": 5000
  }
}
```

### Example 3: Update Name & Description
```
PUT /transactions/auto-rules/RULE_1738047821234_ABC123
```
```json
{
  "name": "Improved Auto-Saver",
  "description": "Updated automation rule for better savings"
}
```

### Example 4: Update Conditions
```
PUT /transactions/auto-rules/RULE_1738047821234_ABC123
```
```json
{
  "conditions": {
    "minAmount": 500,
    "maxAmount": 5000,
    "descriptionContains": "income"
  }
}
```

---

## 5. TOGGLE RULE (ENABLE/DISABLE)

### Endpoint
```
PATCH /transactions/auto-rules/:id/toggle
```

### Example
```
PATCH /transactions/auto-rules/RULE_1738047821234_ABC123/toggle
```

### No Body Required (PATCH request)

---

## 6. DELETE AUTOMATION RULE

### Endpoint
```
DELETE /transactions/auto-rules/:id
```

### Example
```
DELETE /transactions/auto-rules/RULE_1738047821234_ABC123
```

### No Body Required (DELETE request)

---

## 7. GET RULE STATISTICS

### Endpoint
```
GET /transactions/auto-rules/:id/statistics
```

### Example
```
GET /transactions/auto-rules/RULE_1738047821234_ABC123/statistics
```

### No Body Required (GET request)

---

## 8. GET RULE EXECUTION HISTORY

### Endpoint
```
GET /transactions/auto-rules/:id/history
```

### Examples
```
GET /transactions/auto-rules/RULE_1738047821234_ABC123/history
GET /transactions/auto-rules/RULE_1738047821234_ABC123/history?limit=50
GET /transactions/auto-rules/RULE_1738047821234_ABC123/history?limit=100&startDate=2025-01-01&endDate=2025-01-31
```

### Query Parameters
- `limit` (optional): Maximum number of records (default: 50)
- `startDate` (optional): Filter from this date (format: YYYY-MM-DD)
- `endDate` (optional): Filter to this date (format: YYYY-MM-DD)

### No Body Required (GET request)

---

## COMPLETE cURL EXAMPLES

### 1. Create Auto-Save Rule
```bash
curl -X POST http://localhost:3001/transactions/auto-rules \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACC_123",
    "name": "Auto-Save 10%",
    "type": "save_percentage",
    "trigger": "on_deposit",
    "action": {
      "targetAccount": "ACC_456",
      "percentage": 10
    }
  }'
```

### 2. Get All Rules for Account
```bash
curl http://localhost:3001/transactions/auto-rules/ACC_123
```

### 3. Get Specific Rule
```bash
curl http://localhost:3001/transactions/auto-rules/rule/RULE_1738047821234_ABC123
```

### 4. Update Rule
```bash
curl -X PUT http://localhost:3001/transactions/auto-rules/RULE_1738047821234_ABC123 \
  -H "Content-Type: application/json" \
  -d '{
    "action": {
      "targetAccount": "ACC_456",
      "percentage": 15
    }
  }'
```

### 5. Toggle Rule
```bash
curl -X PATCH http://localhost:3001/transactions/auto-rules/RULE_1738047821234_ABC123/toggle
```

### 6. Delete Rule
```bash
curl -X DELETE http://localhost:3001/transactions/auto-rules/RULE_1738047821234_ABC123
```

### 7. Get Statistics
```bash
curl http://localhost:3001/transactions/auto-rules/RULE_1738047821234_ABC123/statistics
```

### 8. Get History
```bash
curl "http://localhost:3001/transactions/auto-rules/RULE_1738047821234_ABC123/history?limit=50"
```

---

## FULL REQUEST BODY SCHEMA

### Create/Update Rule - All Possible Fields
```json
{
  "accountId": "ACC_123",                    // REQUIRED (only for create)
  "name": "Rule Name",                       // REQUIRED
  "description": "Rule description",         // OPTIONAL
  
  "type": "save_percentage",                 // REQUIRED
  // Options: "save_percentage", "round_up", "fixed_transfer", 
  //          "conditional_transfer", "auto_invest"
  
  "trigger": "on_deposit",                   // REQUIRED
  // Options: "on_deposit", "on_withdrawal", "on_transfer_in",
  //          "on_transfer_out", "on_any_transaction", "on_salary"
  
  "conditions": {                            // OPTIONAL
    "minAmount": 100,
    "maxAmount": 10000,
    "transactionTypes": ["deposit", "withdrawal"],
    "descriptionContains": "salary",
    "dayOfMonth": 15,                        // 1-31
    "dayOfWeek": 1                          // 0-6 (0=Sunday)
  },
  
  "action": {                               // REQUIRED
    "targetAccount": "ACC_456",             // REQUIRED
    "actionType": "save",                   // REQUIRED
    // Options: "transfer", "save", "invest"
    
    "percentage": 10,                       // For save_percentage, auto_invest
    "fixedAmount": 500,                     // For fixed_transfer, conditional_transfer
    "roundUpTo": 10,                        // For round_up
    "description": "Action description"     // OPTIONAL
  },
  
  "limits": {                               // OPTIONAL
    "maxPerTransaction": 100,
    "maxPerDay": 500,
    "maxPerMonth": 2000
  },
  
  "isActive": true                          // OPTIONAL (default: true)
}
```

---

## TESTING WORKFLOW

### Step 1: Create Rule
```bash
curl -X POST http://localhost:3001/transactions/auto-rules \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACC_123",
    "name": "Test Auto-Save",
    "type": "save_percentage",
    "trigger": "on_deposit",
    "action": {
      "targetAccount": "ACC_456",
      "percentage": 10
    }
  }'
```
**Response**: Copy the `ruleId` from response

### Step 2: Make Deposit (Triggers Rule)
```bash
curl -X POST http://localhost:3001/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "toAccount": "ACC_123",
    "amount": 1000,
    "description": "Test deposit"
  }'
```

### Step 3: Check Statistics
```bash
curl http://localhost:3001/transactions/auto-rules/RULE_XXXXXX/statistics
```

### Step 4: View History
```bash
curl http://localhost:3001/transactions/auto-rules/RULE_XXXXXX/history
```

### Step 5: Disable Rule
```bash
curl -X PATCH http://localhost:3001/transactions/auto-rules/RULE_XXXXXX/toggle
```

### Step 6: Delete Rule
```bash
curl -X DELETE http://localhost:3001/transactions/auto-rules/RULE_XXXXXX
```

---

## QUICK REFERENCE TABLE

| Method | Endpoint | Body Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/transactions/auto-rules` | ✅ Yes | Create rule |
| GET | `/transactions/auto-rules/:accountId` | ❌ No | List rules |
| GET | `/transactions/auto-rules/rule/:id` | ❌ No | Get rule |
| PUT | `/transactions/auto-rules/:id` | ✅ Yes | Update rule |
| PATCH | `/transactions/auto-rules/:id/toggle` | ❌ No | Toggle rule |
| DELETE | `/transactions/auto-rules/:id` | ❌ No | Delete rule |
| GET | `/transactions/auto-rules/:id/statistics` | ❌ No | Get stats |
| GET | `/transactions/auto-rules/:id/history` | ❌ No | Get history |

---

## RESPONSE EXAMPLES

### Create Rule - Success Response
```json
{
  "success": true,
  "message": "Automation rule created successfully",
  "rule": {
    "ruleId": "RULE_1738047821234_ABC123",
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
    },
    "isActive": true,
    "createdAt": "2025-01-27T09:30:00.000Z"
  }
}
```

### Get Statistics - Success Response
```json
{
  "success": true,
  "statistics": {
    "ruleId": "RULE_1738047821234_ABC123",
    "ruleName": "Auto-Save 10%",
    "isActive": true,
    "totalExecutions": 12,
    "totalAmountProcessed": 1200,
    "lastExecuted": "2025-01-27T12:45:00.000Z",
    "today": {
      "executions": 3,
      "amount": 300
    },
    "thisMonth": {
      "executions": 12,
      "amount": 1200
    },
    "limits": {
      "maxPerTransaction": null,
      "maxPerDay": null,
      "maxPerMonth": null
    },
    "createdAt": "2025-01-27T09:30:00.000Z"
  }
}
```

---

**Developer**: Chaker Allah Dimassi  
**Team**: TechWin  
**Service**: Transaction Management Microservice  
**Base URL**: http://localhost:3001
