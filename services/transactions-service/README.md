# Transaction Service - Banking Microsystem

**Service**: Transaction Management Microservice  
**Developer**: Chaker Allah Dimassi  
**Team**: TechWin (Dhafer Sellami, Aymen Somai, Chaker Allah Dimassi)  
**Architecture**: Microservices with Express.js

## Project Overview

This is a comprehensive transaction management microservice for a banking system, implementing 3 distinct business domains (métiers) with full transaction processing, security, and fee management capabilities.

## Installation

```bash
npm install
```

## Running the Service

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The service will run on `http://localhost:3000` by default.

## API Endpoints

### Métier 1: Core Transaction Processing

- `POST /transactions/deposit` - Create a deposit transaction
- `POST /transactions/withdrawal` - Create a withdrawal transaction
- `POST /transactions/internal-transfer` - Create an internal transfer
- `POST /transactions/interbank-transfer` - Create an interbank transfer
- `GET /transactions/:id` - Get transaction by ID
- `GET /transactions/account/:accountId` - Get all transactions for an account

### Métier 2: Security & Limits Management

- `GET /transactions/limits/:accountId` - Get transaction limits for an account
- `POST /transactions/limits/:accountId` - Update transaction limits
- `POST /transactions/fraud-check` - Check transaction for fraud
- `POST /transactions/:id/reverse` - Reverse a transaction
- `GET /transactions/suspicious/:accountId` - Get suspicious transactions for an account

### Métier 3: Fees & Commission System

- `POST /transactions/fees/calculate` - Calculate transaction fees
- `GET /transactions/commissions/:period` - Get commissions for a period
- `POST /transactions/fee-waiver/:accountId` - Apply fee waiver to an account
- `GET /transactions/currency-rates` - Get currency exchange rates

## Project Structure

```
transaction-service/
├── server.js                 # Main entry point
├── package.json              # Dependencies
├── data/
│   ├── transactions.json     # Transaction storage
│   ├── accounts.json         # Account data (simulated)
│   └── fees-config.json      # Fee configuration
├── routes/
│   └── transactions.js       # All transaction routes
├── controllers/
│   └── transactionController.js  # Business logic
├── middleware/
│   ├── validation.js         # Input validation
│   ├── security.js           # Security checks
│   └── fees.js               # Fee calculation
├── utils/
│   ├── atomicity.js          # Saga pattern implementation
│   ├── limits.js             # Transaction limits
│   └── fraudDetection.js     # Fraud detection
└── models/
    └── transaction.js        # Transaction model
```

## Banking Rules

### Transaction Limits
- Daily Withdrawal: 5000 TND
- Daily Transfer: 10000 TND
- Single Transaction: 2000 TND
- Minimum Transaction: 1 TND
- Minimum Account Balance: 10 TND

### Fee Structure
- Internal Transfer: 0.5%
- Interbank Transfer: 2%
- Currency Conversion: 1%
- Withdrawal (same bank): 0 TND
- Withdrawal (other bank): 5 TND

### Security Rules
- Suspicious Amount Threshold: 10000 TND
- Rapid Transactions: 5 per hour
- Business Hours: 8 AM - 6 PM

## Features

- ✅ Atomic transaction processing with Saga pattern
- ✅ Balance validation and updates
- ✅ Daily transaction limits enforcement
- ✅ Fraud detection and suspicious activity monitoring
- ✅ Transaction reversal capabilities
- ✅ Dynamic fee calculations
- ✅ Commission tracking
- ✅ Multi-level security authorization

## API Integration Points

This service is designed to integrate with:
1. **Account Service** - Account balance validation and updates
2. **Auth Service** - User authentication and JWT validation
3. **Notification Service** - Transaction alerts and notifications

## License

ISC

