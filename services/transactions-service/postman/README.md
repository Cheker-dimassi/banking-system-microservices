# Postman Collection - Métier 4: Automation Rules

## 📁 Collection Structure

The Postman collection is organized into 6 folders:

### 1. **Create Automation Rule**
Contains 4 examples of different rule types:
- Auto-Save 10% Rule (save percentage)
- Round-Up Savings Rule (round up)
- Salary Day Transfer Rule (fixed transfer on salary)
- Conditional Transfer Rule (save on large deposits)

### 2. **Get Automation Rules**
Retrieve automation rules:
- Get all rules for an account
- Get specific rule by ID

### 3. **Update Automation Rule**
Update existing rules:
- Update rule percentage
- Update rule limits
- Update name & description

### 4. **Toggle & Delete Rules**
Manage rule lifecycle:
- Toggle rule (enable/disable)
- Delete automation rule

### 5. **Statistics & History**
Monitor rule performance:
- Get rule statistics (execution count, amounts)
- Get execution history (transactions created by rule)

### 6. **Test Automation Flow**
Complete end-to-end test sequence with automated tests:
- Step 1: Create auto-save rule
- Step 2: Make deposit (triggers rule)
- Step 3: Check statistics
- Step 4: View execution history
- Step 5: Clean up (delete test rule)

---

## 🚀 How to Import

1. **Open Postman Desktop or Web**

2. **Import the collection**:
   - Click **Import** button (top left)
   - Choose **File**
   - Select: `Metier_4_Automation_Rules.postman_collection.json`
   - Click **Import**

3. **Collection will appear** in your Collections sidebar

---

## ⚙️ Setup

### Environment Variables

The collection uses these variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:3001` | Server URL |
| `ruleId` | `RULE_XXXXXX` | Rule ID (auto-populated in tests) |

**To set up:**
1. Create a new environment called "Transaction Service Local"
2. Add variable `baseUrl` with value `http://localhost:3001`
3. Select this environment before running requests

---

## 🧪 Testing Flow

### Quick Test (Manual):

1. **Create a rule**: Run any request from folder "1. Create Automation Rule"
   - Copy the `ruleId` from response
   
2. **Replace {{ruleId}}**: In other requests, replace `{{ruleId}}` with actual rule ID

3. **Make a transaction**: Run "Step 2: Make Deposit" to trigger automation

4. **Check results**: Run "Get Rule Statistics" to see execution count

### Automated Test Flow:

Run the entire **"6. Test Automation Flow"** folder as a sequence:
1. Right-click on "6. Test Automation Flow" folder
2. Click **Run folder**
3. Click **Run Métier 4: Automation Rules**
4. Watch all 5 steps execute automatically with test assertions!

---

## 📝 Example Requests

### Create Auto-Save 10% Rule
```http
POST http://localhost:3001/transactions/auto-rules
Content-Type: application/json

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

### Get All Rules for Account
```http
GET http://localhost:3001/transactions/auto-rules/ACC_123
```

### Get Rule Statistics
```http
GET http://localhost:3001/transactions/auto-rules/RULE_XXXXXX/statistics
```

---

## 🎯 Request Examples by Use Case

### Personal Savings Automation

**Save 15% of every deposit:**
```json
{
  "accountId": "ACC_123",
  "name": "Personal Savings",
  "type": "save_percentage",
  "trigger": "on_deposit",
  "action": {
    "targetAccount": "ACC_456",
    "percentage": 15
  }
}
```

### Round-Up Savings

**Round purchases to nearest 10 TND:**
```json
{
  "accountId": "ACC_123",
  "name": "Round-Up Challenge",
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

### Salary Day Automation

**Save 500 TND when salary arrives:**
```json
{
  "accountId": "ACC_123",
  "name": "Salary Savings",
  "type": "fixed_transfer",
  "trigger": "on_salary",
  "conditions": {
    "minAmount": 2000,
    "descriptionContains": "salary"
  },
  "action": {
    "targetAccount": "ACC_456",
    "fixedAmount": 500
  }
}
```

---

## 🔍 Understanding Responses

### Successful Rule Creation
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
    "isActive": true,
    "createdAt": "2025-01-27T08:30:00.000Z"
  }
}
```

### Rule Statistics Response
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

## ✅ Pre-Request Scripts & Tests

The collection includes automated tests that:
- ✅ Verify response status codes
- ✅ Check response structure
- ✅ Save rule IDs to variables automatically
- ✅ Validate rule execution

**Example Test (from "Step 1: Create Auto-Save Rule"):**
```javascript
pm.test("Rule created successfully", function () {
    pm.response.to.have.status(201);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.rule).to.have.property('ruleId');
    
    // Save rule ID for next requests
    pm.environment.set("ruleId", jsonData.rule.ruleId);
});
```

---

## 🐛 Troubleshooting

### Connection Refused
**Error**: `ECONNREFUSED`  
**Solution**: Make sure the server is running on port 3001
```bash
cd services/transactions-service
npm run dev
```

### Account Not Found
**Error**: `Account ACC_XXX not found`  
**Solution**: Use test accounts `ACC_123`, `ACC_456`, or `EXT_999`

### Rule Not Found
**Error**: `Automation rule not found`  
**Solution**: Make sure you're using the correct `ruleId` from the create response

### Validation Errors
**Error**: `Missing required fields`  
**Solution**: Check the request body matches the required schema for the rule type

---

## 📊 Collection Features

✅ **26 Requests** covering all automation rule operations  
✅ **6 Organized Folders** for easy navigation  
✅ **Automated Tests** for validation  
✅ **Environment Variables** for flexibility  
✅ **Complete Examples** for all rule types  
✅ **End-to-End Test Flow** for comprehensive testing  

---

## 🎓 Tips

1. **Use the Test Flow folder first** - it's the easiest way to understand the feature
2. **Copy rule IDs** - always copy the `ruleId` from create responses
3. **Check server logs** - watch the console for automation execution messages (🤖)
4. **Monitor statistics** - use the statistics endpoint to track rule performance
5. **Test with small amounts** - start with small percentages/amounts

---

## 📚 Related Documentation

- **Full Testing Guide**: `TESTING_AUTOMATION_RULES.md`
- **Quick Reference**: `AUTOMATION_RULES_QUICK_REF.md`
- **Implementation Summary**: `METIER_4_SUMMARY.md`
- **Test Script**: `test-automation-rules.js`

---

**Developer**: Chaker Allah Dimassi  
**Team**: TechWin  
**Service**: Transaction Management Microservice  
**Version**: 1.0.0
