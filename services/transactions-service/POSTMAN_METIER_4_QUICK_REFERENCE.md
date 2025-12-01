# Métier 4: Reports & Analytics - Quick Reference

**Base URL:** `http://localhost:3001`

---

## 📊 All Endpoints with URLs & Request Bodies

### 1. Get Overall Summary

**URL:**
```
GET http://localhost:3001/transactions/reports/summary
GET http://localhost:3001/transactions/reports/summary?startDate=2024-01-01&endDate=2024-12-31
```

**Query Parameters (Optional):**
- `startDate`: `2024-01-01`
- `endDate`: `2024-12-31`

**Body:** None

---

### 2. Get Account Statistics

**URL:**
```
GET http://localhost:3001/transactions/reports/account/ACC_123
GET http://localhost:3001/transactions/reports/account/ACC_123?startDate=2024-01-01&endDate=2024-12-31
GET http://localhost:3001/transactions/reports/account/ACC_456
GET http://localhost:3001/transactions/reports/account/EXT_999
```

**URL Parameters:**
- `accountId`: `ACC_123` | `ACC_456` | `EXT_999`

**Query Parameters (Optional):**
- `startDate`: `2024-01-01`
- `endDate`: `2024-12-31`

**Body:** None

---

### 3. Get Monthly Statistics

**URL:**
```
GET http://localhost:3001/transactions/reports/monthly
GET http://localhost:3001/transactions/reports/monthly?year=2024&month=1
GET http://localhost:3001/transactions/reports/monthly?year=2024&month=12
```

**Query Parameters (Optional):**
- `year`: `2024`
- `month`: `1` (January) to `12` (December)

**Body:** None

---

### 4. Get Transaction Trends

**URL:**
```
GET http://localhost:3001/transactions/reports/trends
GET http://localhost:3001/transactions/reports/trends?period=30
GET http://localhost:3001/transactions/reports/trends?period=7&type=deposit
GET http://localhost:3001/transactions/reports/trends?period=30&type=withdrawal
GET http://localhost:3001/transactions/reports/trends?period=90&type=internal_transfer
```

**Query Parameters (Optional):**
- `period`: `7` | `30` | `90` | `365` (default: `30`)
- `type`: `deposit` | `withdrawal` | `internal_transfer` | `interbank_transfer`

**Body:** None

---

## 📋 Copy-Paste Ready URLs

### Summary Endpoints
```
http://localhost:3001/transactions/reports/summary
http://localhost:3001/transactions/reports/summary?startDate=2024-01-01&endDate=2024-12-31
```

### Account Statistics Endpoints
```
http://localhost:3001/transactions/reports/account/ACC_123
http://localhost:3001/transactions/reports/account/ACC_456
http://localhost:3001/transactions/reports/account/EXT_999
http://localhost:3001/transactions/reports/account/ACC_123?startDate=2024-01-01&endDate=2024-12-31
```

### Monthly Statistics Endpoints
```
http://localhost:3001/transactions/reports/monthly
http://localhost:3001/transactions/reports/monthly?year=2024&month=1
http://localhost:3001/transactions/reports/monthly?year=2024&month=12
```

### Trends Endpoints
```
http://localhost:3001/transactions/reports/trends
http://localhost:3001/transactions/reports/trends?period=7
http://localhost:3001/transactions/reports/trends?period=30
http://localhost:3001/transactions/reports/trends?period=90
http://localhost:3001/transactions/reports/trends?period=30&type=deposit
http://localhost:3001/transactions/reports/trends?period=30&type=withdrawal
http://localhost:3001/transactions/reports/trends?period=30&type=internal_transfer
```

---

## 🎯 Postman Environment Variables

```
base_url = http://localhost:3001
account_id = ACC_123
start_date = 2024-01-01
end_date = 2024-12-31
year = 2024
month = 1
period = 30
```

**Usage:**
- `{{base_url}}/transactions/reports/summary?startDate={{start_date}}&endDate={{end_date}}`
- `{{base_url}}/transactions/reports/account/{{account_id}}`
- `{{base_url}}/transactions/reports/monthly?year={{year}}&month={{month}}`
- `{{base_url}}/transactions/reports/trends?period={{period}}`

---

## ✅ Quick Test Checklist

- [ ] `GET /reports/summary` - All time
- [ ] `GET /reports/summary?startDate=2024-01-01&endDate=2024-12-31` - Date range
- [ ] `GET /reports/account/ACC_123` - Account stats
- [ ] `GET /reports/account/ACC_123?startDate=2024-01-01&endDate=2024-12-31` - Account with date range
- [ ] `GET /reports/monthly` - Current month
- [ ] `GET /reports/monthly?year=2024&month=1` - January 2024
- [ ] `GET /reports/monthly?year=2024&month=12` - December 2024
- [ ] `GET /reports/trends` - Last 30 days
- [ ] `GET /reports/trends?period=7` - Last 7 days
- [ ] `GET /reports/trends?period=90` - Last 90 days
- [ ] `GET /reports/trends?period=30&type=deposit` - Deposits only
- [ ] `GET /reports/trends?period=30&type=withdrawal` - Withdrawals only

---

**All endpoints are GET requests - No request body needed!** 🚀

