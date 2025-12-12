# ✅ INTERNAL TRANSFER - COMPLETE GUIDE

## 🔄 HOW INTERNAL TRANSFER WORKS

Internal transfer requires **TWO operations**:
1. **DEBIT** from source account
2. **CREDIT** to destination account

---

## 💸 INTERNAL TRANSFER STEPS

### **Step 1: Get Both Account UUIDs**
```
GET http://localhost:3000/api/comptes
```

**Copy TWO account `_id` values:**
- Source account (from): `794cfdd0-14f5-4d25-bfa5-fd2f5a25faac`
- Destination account (to): `6112b41f-e661-4ab6-b7e4-09180dc042d7`

---

### **Step 2: Debit Source Account**
```
POST http://localhost:3000/api/mouvements/debit/794cfdd0-14f5-4d25-bfa5-fd2f5a25faac
Content-Type: application/json

{
  "montant": 200,
  "description": "Transfer to account xxx",
  "reference": "TRF_001"
}
```

**✅ Response:**
```json
{
  "success": true,
  "message": "Compte débité avec succès",
  "data": {
    "typeMouvement": "DEBIT",
    "montant": 200,
    ...
  }
}
```

---

### **Step 3: Credit Destination Account**
```
POST http://localhost:3000/api/mouvements/credit/6112b41f-e661-4ab6-b7e4-09180dc042d7
Content-Type: application/json

{
  "montant": 200,
  "description": "Transfer from account xxx",
  "reference": "TRF_001"
}
```

**✅ Response:**
```json
{
  "success": true,
  "message": "Compte crédité avec succès",
  "data": {
    "typeMouvement": "CREDIT",
    "montant": 200,
    ...
  }
}
```

---

## 🎯 COMPLETE EXAMPLE

### **Scenario:**
Transfer 200 TND from Account A to Account B

**Account A (Source):**
- UUID: `794cfdd0-14f5-4d25-bfa5-fd2f5a25faac`
- Initial Balance: 13400 TND

**Account B (Destination):**
- UUID: `6112b41f-e661-4ab6-b7e4-09180dc042d7`
- Initial Balance: 13000 TND

---

### **Operation 1: Debit A**
```
POST http://localhost:3000/api/mouvements/debit/794cfdd0-14f5-4d25-bfa5-fd2f5a25faac

{
  "montant": 200,
  "description": "Transfer to Account B",
  "reference": "TRF_20241205_001"
}
```

**New Balance A: 13200 TND** (13400 - 200)

---

### **Operation 2: Credit B**
```
POST http://localhost:3000/api/mouvements/credit/6112b41f-e661-4ab6-b7e4-09180dc042d7

{
  "montant": 200,
  "description": "Transfer from Account A",
  "reference": "TRF_20241205_001"
}
```

**New Balance B: 13200 TND** (13000 + 200)

---

### **Verify Transfer:**
```
GET http://localhost:3000/api/comptes
```

Check both accounts have updated balances!

---

## 🎬 POSTMAN COLLECTION FOR TRANSFER

### **Request 1: Get Accounts**
```
GET http://localhost:3000/api/comptes?limit=10
```

**In Tests tab:**
```javascript
pm.environment.set("fromAccountId", pm.response.json().data[0]._id);
pm.environment.set("toAccountId", pm.response.json().data[1]._id);
```

---

### **Request 2: Debit Source**
```
POST http://localhost:3000/api/mouvements/debit/{{fromAccountId}}
Content-Type: application/json

{
  "montant": 200,
  "description": "Internal transfer - debit",
  "reference": "TRF_{{$timestamp}}"
}
```

---

### **Request 3: Credit Destination**
```
POST http://localhost:3000/api/mouvements/credit/{{toAccountId}}
Content-Type: application/json

{
  "montant": 200,
  "description": "Internal transfer - credit",
  "reference": "TRF_{{$timestamp}}"
}
```

---

### **Request 4: Verify Balances**
```
GET http://localhost:3000/api/comptes
```

---

### **Request 5: View Source Movements**
```
GET http://localhost:3000/api/mouvements/compte/{{fromAccountId}}
```

---

### **Request 6: View Destination Movements**
```
GET http://localhost:3000/api/mouvements/compte/{{toAccountId}}
```

---

## 📊 TRANSFER FLOW DIAGRAM

```
Source Account (A)          Destination Account (B)
Balance: 13400 TND          Balance: 13000 TND
      |                            |
      | POST /debit (200 TND)      |
      |------------------------┐   |
      |                        |   |
      | -200 TND              |   |
      |                        |   |
Balance: 13200 TND            |   |
                              |   |
                              |   | POST /credit (200 TND)
                              |   |------------------------┐
                              |   |                        |
                              |   |                  +200 TND
                              |   |                        |
                              |   |          Balance: 13200 TND
                              |   |
                      ✅ Transfer Complete!
```

---

## 💡 IMPORTANT NOTES

### **Same Reference:**
Use the **same reference** for both operations to link them:
```json
"reference": "TRF_20241205_001"  // Same for debit and credit
```

This helps you identify matching debit/credit pairs!

---

### **Descriptions Should Match:**
```javascript
// Debit description
"description": "Transfer to Account [B numeroCompte]"

// Credit description  
"description": "Transfer from Account [A numeroCompte]"
```

---

### **Error Handling:**
If debit succeeds but credit fails:
1. You'll need to manually reverse the debit
2. Or retry the credit operation
3. Check account balances to verify state

**Best Practice:** 
- Check source has sufficient balance before starting
- Use same reference for both operations
- Verify both operations succeeded

---

## 🎓 TEACHER DEMO SCRIPT

### **Demo: Internal Transfer** (3 minutes)

**Step 1:** Show both accounts
```
GET http://localhost:3000/api/comptes
```

**Say:** "I have two accounts. Account A with 13400 TND and Account B with 13000 TND. I'll transfer 200 TND from A to B."

---

**Step 2:** Debit source
```
POST /api/mouvements/debit/{accountA}
Body: {"montant": 200, "description": "Transfer to B", "reference": "TRF_DEMO"}
```

**Say:** "First, I debit 200 TND from Account A. This goes through the Gateway to the Accounts Service."

---

**Step 3:** Credit destination
```
POST /api/mouvements/credit/{accountB}
Body: {"montant": 200, "description": "Transfer from A", "reference": "TRF_DEMO"}
```

**Say:** "Then I credit 200 TND to Account B. Same reference 'TRF_DEMO' links both operations."

---

**Step 4:** Verify
```
GET http://localhost:3000/api/comptes
```

**Say:** "Now Account A shows 13200 TND (down 200), and Account B shows 13200 TND (up 200). The transfer is complete and both transactions are stored in MongoDB with the same reference."

---

**Step 5:** Show movement history
```
GET /api/mouvements/compte/{accountA}
GET /api/mouvements/compte/{accountB}
```

**Say:** "Here you can see the complete transaction history for both accounts, showing the linked debit and credit operations."

---

## 📋 QUICK REFERENCE

| Operation | Endpoint | Body |
|-----------|----------|------|
| **Get Accounts** | `GET /api/comptes` | - |
| **Debit Source** | `POST /api/mouvements/debit/:fromId` | `{montant, description, reference}` |
| **Credit Dest** | `POST /api/mouvements/credit/:toId` | `{montant, description, reference}` |
| **View Movements** | `GET /api/mouvements/compte/:id` | - |

---

## ✅ CONFIRMED WORKING

**Tested Transfer:**
- Source: `794cfdd0-14f5-4d25-bfa5-fd2f5a25faac`
- Destination: `6112b41f-e661-4ab6-b7e4-09180dc042d7`
- Amount: 200 TND
- Result: ✅ **SUCCESS!**

Both accounts updated correctly!

---

## 🎯 ALL OPERATIONS WORKING

| Operation | Status | Via Gateway |
|-----------|--------|-------------|
| **Deposit** | ✅ Works | ✅ Yes |
| **Withdrawal** | ✅ Works | ✅ Yes |
| **Internal Transfer** | ✅ Works | ✅ Yes |
| **Check Balance** | ✅ Works | ✅ Yes |
| **View Movements** | ✅ Works | ✅ Yes |

---

## 🚀 READY FOR DEMO!

**You now have:**
- ✅ Deposits working
- ✅ Withdrawals working
- ✅ Internal transfers working
- ✅ Balance checking working
- ✅ Movement history working

**All through the Gateway with proper UUID-based accounts!** 🎉

