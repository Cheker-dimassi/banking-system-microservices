# Postman Testing Guide: Métier 4 - Transaction Reports & Analytics

Complete testing guide for all Reports & Analytics endpoints.

**Base URL:** `http://localhost:3001`

---

## 📊 Métier 4: Transaction Reports & Analytics

### 1. Get Overall Summary

**Purpose:** Get overall transaction statistics across all accounts.

**Request:**
```
GET http://localhost:3001/transactions/reports/summary
GET http://localhost:3001/transactions/reports/summary?startDate=2024-01-01&endDate=2024-12-31
```

**Headers:**
```
Content-Type: application/json
```

**Query Parameters (Optional):**
- `startDate` (optional): Start date in format `YYYY-MM-DD` (e.g., `2024-01-01`)
- `endDate` (optional): End date in format `YYYY-MM-DD` (e.g., `2024-12-31`)

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "summary": {
    "totalTransactions": 25,
    "totalDeposits": 8,
    "totalWithdrawals": 5,
    "totalTransfers": 12,
    "totalAmount": 45000.50,
    "totalDepositAmount": 15000.00,
    "totalWithdrawalAmount": 5000.00,
    "totalTransferAmount": 25000.50,
    "averageTransactionAmount": 1800.02,
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    }
  }
}
```

**Test Cases:**
- ✅ Get all-time summary: `/reports/summary`
- ✅ Get summary for date range: `/reports/summary?startDate=2024-01-01&endDate=2024-12-31`
- ✅ Get summary from start date: `/reports/summary?startDate=2024-01-01`
- ✅ Get summary until end date: `/reports/summary?endDate=2024-12-31`

**Postman Setup:**
1. Method: `GET`
2. URL: `http://localhost:3001/transactions/reports/summary`
3. Optional: Add query parameters in Params tab

---

### 2. Get Account Statistics

**Purpose:** Get detailed statistics for a specific account.

**Request:**
```
GET http://localhost:3001/transactions/reports/account/ACC_123
GET http://localhost:3001/transactions/reports/account/ACC_123?startDate=2024-01-01&endDate=2024-12-31
```

**Headers:**
```
Content-Type: application/json
```

**URL Parameters:**
- `accountId` (required): Account ID (e.g., `ACC_123`, `ACC_456`, `EXT_999`)

**Query Parameters (Optional):**
- `startDate` (optional): Start date in format `YYYY-MM-DD`
- `endDate` (optional): End date in format `YYYY-MM-DD`

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "statistics": {
    "accountId": "ACC_123",
    "accountBalance": 5500.00,
    "totalTransactions": 15,
    "incomingTransactions": 8,
    "outgoingTransactions": 7,
    "totalIncoming": 12000.00,
    "totalOutgoing": 6500.00,
    "netFlow": 5500.00,
    "deposits": 5,
    "withdrawals": 3,
    "transfers": 7,
    "averageIncoming": 1500.00,
    "averageOutgoing": 928.57,
    "period": {
      "startDate": "all time",
      "endDate": "all time"
    }
  }
}
```

**Test Cases:**
- ✅ Valid account: `ACC_123`, `ACC_456`, `EXT_999`
- ✅ With date range: `?startDate=2024-01-01&endDate=2024-12-31`
- ❌ Invalid account: `ACC_999` → `404 Account not found`

**Postman Setup:**
1. Method: `GET`
2. URL: `http://localhost:3001/transactions/reports/account/{{account_id}}`
3. Use environment variable: `account_id = ACC_123`

---

### 3. Get Monthly Statistics

**Purpose:** Get transaction statistics for a specific month.

**Request:**
```
GET http://localhost:3001/transactions/reports/monthly
GET http://localhost:3001/transactions/reports/monthly?year=2024&month=1
GET http://localhost:3001/transactions/reports/monthly?year=2024&month=12
```

**Headers:**
```
Content-Type: application/json
```

**Query Parameters (Optional):**
- `year` (optional): Year (e.g., `2024`). Defaults to current year.
- `month` (optional): Month number 1-12 (e.g., `1` for January, `12` for December). Defaults to current month.

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "monthlyStatistics": {
    "year": 2024,
    "month": 1,
    "monthName": "January",
    "totalTransactions": 20,
    "totalAmount": 35000.00,
    "deposits": {
      "count": 8,
      "total": 15000.00
    },
    "withdrawals": {
      "count": 5,
      "total": 5000.00
    },
    "transfers": {
      "count": 7,
      "total": 15000.00
    },
    "dailyBreakdown": [
      {
        "date": "2024-01-01",
        "count": 3,
        "amount": 5000.00
      },
      {
        "date": "2024-01-15",
        "count": 5,
        "amount": 10000.00
      },
      {
        "date": "2024-01-31",
        "count": 2,
        "amount": 2000.00
      }
    ]
  }
}
```

**Test Cases:**
- ✅ Current month: `/reports/monthly`
- ✅ Specific month: `/reports/monthly?year=2024&month=1`
- ✅ December: `/reports/monthly?year=2024&month=12`
- ✅ January: `/reports/monthly?year=2024&month=1`

**Postman Setup:**
1. Method: `GET`
2. URL: `http://localhost:3001/transactions/reports/monthly`
3. Optional: Add query parameters `?year=2024&month=1`

---

### 4. Get Transaction Trends

**Purpose:** Get transaction trends over a period of time with daily breakdown.

**Request:**
```
GET http://localhost:3001/transactions/reports/trends
GET http://localhost:3001/transactions/reports/trends?period=30
GET http://localhost:3001/transactions/reports/trends?period=7&type=deposit
GET http://localhost:3001/transactions/reports/trends?period=90&type=withdrawal
```

**Headers:**
```
Content-Type: application/json
```

**Query Parameters (Optional):**
- `period` (optional): Number of days to analyze (default: `30`). Examples: `7`, `30`, `90`, `365`
- `type` (optional): Filter by transaction type. Options: `deposit`, `withdrawal`, `internal_transfer`, `interbank_transfer`

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "period": "30 days",
  "totalTransactions": 45,
  "typeStatistics": {
    "deposit": {
      "count": 15,
      "total": 25000.00
    },
    "withdrawal": {
      "count": 10,
      "total": 8000.00
    },
    "internal_transfer": {
      "count": 15,
      "total": 12000.00
    },
    "interbank_transfer": {
      "count": 5,
      "total": 5000.00
    }
  },
  "trends": [
    {
      "date": "2024-01-01",
      "count": 5,
      "totalAmount": 5000.00,
      "deposits": 2,
      "withdrawals": 1,
      "transfers": 2
    },
    {
      "date": "2024-01-02",
      "count": 3,
      "totalAmount": 3000.00,
      "deposits": 1,
      "withdrawals": 1,
      "transfers": 1
    },
    {
      "date": "2024-01-03",
      "count": 8,
      "totalAmount": 12000.00,
      "deposits": 4,
      "withdrawals": 2,
      "transfers": 2
    }
  ]
}
```

**Test Cases:**
- ✅ Last 30 days (default): `/reports/trends`
- ✅ Last 7 days: `/reports/trends?period=7`
- ✅ Last 90 days: `/reports/trends?period=90`
- ✅ Last 7 days, deposits only: `/reports/trends?period=7&type=deposit`
- ✅ Last 30 days, withdrawals only: `/reports/trends?period=30&type=withdrawal`
- ✅ Last 90 days, transfers only: `/reports/trends?period=90&type=internal_transfer`

**Postman Setup:**
1. Method: `GET`
2. URL: `http://localhost:3001/transactions/reports/trends`
3. Optional: Add query parameters `?period=30&type=deposit`

---

## Complete Test Flow for Métier 4

### Step-by-Step Testing:

**1. Get Overall Summary**
```
GET /transactions/reports/summary
```
✅ See total transactions, amounts, and averages

**2. Get Account Statistics**
```
GET /transactions/reports/account/ACC_123
```
✅ See account-specific stats, net flow, averages

**3. Get Monthly Statistics**
```
GET /transactions/reports/monthly?year=2024&month=1
```
✅ See monthly breakdown with daily details

**4. Get Transaction Trends**
```
GET /transactions/reports/trends?period=30
```
✅ See daily trends over time

---

## Postman Environment Variables

Create these variables in your Postman environment:

```
base_url = http://localhost:3001
account_id = ACC_123
start_date = 2024-01-01
end_date = 2024-12-31
year = 2024
month = 1
period = 30
```

**Use in requests:**
- `{{base_url}}/transactions/reports/summary?startDate={{start_date}}&endDate={{end_date}}`
- `{{base_url}}/transactions/reports/account/{{account_id}}`
- `{{base_url}}/transactions/reports/monthly?year={{year}}&month={{month}}`
- `{{base_url}}/transactions/reports/trends?period={{period}}`

---

## Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/transactions/reports/summary` | GET | Overall summary |
| `/transactions/reports/account/:accountId` | GET | Account statistics |
| `/transactions/reports/monthly` | GET | Monthly statistics |
| `/transactions/reports/trends` | GET | Transaction trends |

---

## Testing Checklist

- [ ] Get overall summary (all time)
- [ ] Get overall summary with date range
- [ ] Get account statistics for ACC_123
- [ ] Get account statistics for ACC_456
- [ ] Get account statistics with date range
- [ ] Get current month statistics
- [ ] Get specific month statistics (January 2024)
- [ ] Get specific month statistics (December 2024)
- [ ] Get trends for last 30 days (default)
- [ ] Get trends for last 7 days
- [ ] Get trends for last 90 days
- [ ] Get trends filtered by deposit type
- [ ] Get trends filtered by withdrawal type
- [ ] Get trends filtered by transfer type
- [ ] Test with invalid account (should return 404)
- [ ] Test with invalid date format (should handle gracefully)

---

## Date Format

All dates should be in **ISO 8601 format**: `YYYY-MM-DD`

**Examples:**
- ✅ `2024-01-01` (January 1, 2024)
- ✅ `2024-12-31` (December 31, 2024)
- ✅ `2024-03-15` (March 15, 2024)
- ❌ `01/01/2024` (Wrong format)
- ❌ `2024-1-1` (Should use zero-padding)

---

## Response Fields Explained

### Summary Response:
- `totalTransactions`: Total number of completed transactions
- `totalDeposits`: Count of deposit transactions
- `totalWithdrawals`: Count of withdrawal transactions
- `totalTransfers`: Count of transfer transactions
- `totalAmount`: Sum of all transaction amounts
- `totalDepositAmount`: Sum of all deposit amounts
- `totalWithdrawalAmount`: Sum of all withdrawal amounts
- `totalTransferAmount`: Sum of all transfer amounts
- `averageTransactionAmount`: Average transaction amount

### Account Statistics Response:
- `accountBalance`: Current account balance
- `incomingTransactions`: Transactions where money came in
- `outgoingTransactions`: Transactions where money went out
- `totalIncoming`: Total amount received
- `totalOutgoing`: Total amount sent
- `netFlow`: Difference between incoming and outgoing (positive = net gain)

### Monthly Statistics Response:
- `dailyBreakdown`: Array of daily statistics for the month
- Each day shows: `date`, `count`, `amount`

### Trends Response:
- `typeStatistics`: Statistics broken down by transaction type
- `trends`: Array of daily trends showing transaction activity per day

---

**All Métier 4 endpoints are ready for testing!** 🚀

