# Troubleshooting Guide

## Common Errors and Solutions

### 1. "Account not found" in Update Limits

**Error:**
```json
{
  "success": false,
  "error": "Account not found"
}
```

**Solution:**
- ✅ Make sure you're using a valid account ID: `ACC_123`, `ACC_456`, or `EXT_999`
- ✅ Check if the account exists in MongoDB
- ✅ Verify the accountId in the URL: `PUT /transactions/limits/ACC_123`

**Test:**
```
GET http://localhost:3001/transactions/limits/ACC_123
```
If this works, the account exists. If not, the account doesn't exist.

---

### 2. "Endpoint not found" for Fraud Check

**Error:**
```json
{
  "success": false,
  "error": "Endpoint not found",
  "path": "/transactions/fraud-check%0A"
}
```

**Problem:** The `%0A` in the path indicates a **newline character** in your URL.

**Solution:**
1. ✅ **Copy the URL carefully** - don't include any newlines
2. ✅ **Use this exact URL:** `http://localhost:3001/transactions/fraud-check`
3. ✅ **In Postman:** Make sure there are no spaces or newlines in the URL field
4. ✅ **Check for hidden characters:** Delete and retype the URL

**Correct URL:**
```
POST http://localhost:3001/transactions/fraud-check
```

**Wrong (has newline):**
```
POST http://localhost:3001/transactions/fraud-check
[newline character here]
```

**Postman Tips:**
- Click in the URL field
- Select all (Ctrl+A)
- Delete and retype: `http://localhost:3001/transactions/fraud-check`
- Make sure cursor is at the end, no extra characters

---

### 3. "Transaction not found"

**Error:**
```json
{
  "success": false,
  "error": "Transaction not found"
}
```

**Solution:**
- ✅ Use the correct `transactionId` format: `TXN_XXXXXXXX`
- ✅ Get transactionId from the response when creating a transaction
- ✅ List all transactions: `GET /transactions` to see available IDs

---

### 4. "transactions.filter is not a function"

**Error:**
```json
{
  "success": false,
  "error": "transactions.filter is not a function"
}
```

**Solution:**
- ✅ This should be fixed now
- ✅ Restart your server if you still see this error
- ✅ Make sure you're using the latest code

---

### 5. "Daily withdrawal limit exceeded"

**Error:**
```json
{
  "success": false,
  "error": "Daily withdrawal limit exceeded (50000 TND)"
}
```

**Solution:**
- ✅ Limits are now increased: 50,000 TND daily withdrawal
- ✅ Check your daily usage: `GET /transactions/limits/ACC_123`
- ✅ Wait for the next day or use a different account

---

## URL Formatting Issues

### Common URL Problems:

**❌ Wrong:**
```
http://localhost:3001/transactions/fraud-check
[newline]
```

**✅ Correct:**
```
http://localhost:3001/transactions/fraud-check
```

**❌ Wrong (extra spaces):**
```
http://localhost:3001/transactions/ fraud-check
```

**✅ Correct:**
```
http://localhost:3001/transactions/fraud-check
```

**❌ Wrong (trailing slash):**
```
http://localhost:3001/transactions/fraud-check/
```

**✅ Correct:**
```
http://localhost:3001/transactions/fraud-check
```

---

## Testing Checklist

Before reporting an error, check:

- [ ] Server is running on port 3001
- [ ] MongoDB is connected
- [ ] URL has no extra spaces or newlines
- [ ] Account ID is correct (ACC_123, ACC_456, EXT_999)
- [ ] Request method is correct (GET, POST, PUT, DELETE)
- [ ] Content-Type header is set to `application/json` (for POST/PUT)
- [ ] Request body is valid JSON (for POST/PUT)

---

## Quick Fixes

### Restart Server
```bash
# Stop server (Ctrl+C)
cd services/transactions-service
npm run dev
```

### Check MongoDB Connection
```bash
cd services/transactions-service
node test-connection.js
```

### Verify Account Exists
```
GET http://localhost:3001/transactions/limits/ACC_123
```

### List All Transactions
```
GET http://localhost:3001/transactions
```

---

## Still Having Issues?

1. **Check server logs** - Look for error messages
2. **Verify MongoDB** - Make sure accounts are seeded
3. **Test with curl** - To rule out Postman issues:
   ```bash
   curl -X POST http://localhost:3001/transactions/fraud-check \
     -H "Content-Type: application/json" \
     -d '{"type":"withdrawal","fromAccount":"ACC_123","amount":1000}'
   ```

---

**Most common issue:** URL has hidden newline characters. Always retype the URL manually! 🚀

