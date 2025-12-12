const express = require('express');
const cors = require('cors');
require('dotenv').config();

const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');

const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/transaction-service';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    // Seed accounts if database is empty
    const Account = require('./models/account');
    const accountCount = await Account.countDocuments();
    if (accountCount === 0) {
      console.log('🌱 Seeding accounts...');
      const initialAccounts = [
        {
          accountId: "ACC_123",
          balance: 5500.00,
          currency: "TND",
          status: "active",
          owner: "User1",
          customLimits: {
            dailyWithdrawal: 8000,
            dailyTransfer: 15000,
            singleTransaction: 2000
          }
        },
        {
          accountId: "ACC_456",
          balance: 3000.00,
          currency: "TND",
          status: "active",
          owner: "User2"
        },
        {
          accountId: "EXT_999",
          balance: 1000000.00,
          currency: "TND",
          status: "active",
          owner: "External Bank"
        }
      ];
      await Account.insertMany(initialAccounts);
      console.log('✅ Accounts seeded successfully');
    }
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Transaction Service',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/transactions', transactionRoutes);
app.use('/budgets', budgetRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Transaction Management Microservice',
    developer: 'Chaker Allah Dimassi',
    team: 'TechWin',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      transactions: '/transactions',
      documentation: {
        'Métier 1 - Core Transaction Processing': {
          'POST /transactions/deposit': 'Create a deposit transaction',
          'POST /transactions/withdrawal': 'Create a withdrawal transaction',
          'POST /transactions/internal-transfer': 'Create an internal transfer',
          'POST /transactions/interbank-transfer': 'Create an interbank transfer',
          'GET /transactions/:id': 'Get transaction by ID',
          'GET /transactions/account/:accountId': 'Get all transactions for an account'
        },
        'Métier 2 - Security & Limits Management': {
          'GET /transactions/limits/:accountId': 'Get transaction limits for an account',
          'POST /transactions/limits/:accountId': 'Update transaction limits',
          'POST /transactions/fraud-check': 'Check transaction for fraud',
          'POST /transactions/:id/reverse': 'Reverse a transaction',
          'GET /transactions/suspicious/:accountId': 'Get suspicious transactions for an account'
        },
        'Métier 3 - Fees & Commission System': {
          'POST /transactions/fees/calculate': 'Calculate transaction fees',
          'GET /transactions/commissions/:period': 'Get commissions for a period',
          'POST /transactions/fee-waiver/:accountId': 'Apply fee waiver to an account',
          'GET /transactions/currency-rates': 'Get real-time currency exchange rates (from external API)',
          'POST /transactions/currency/convert': 'Convert amount between currencies'
        },
        'Métier 4 - Transaction Reports & Analytics': {
          'GET /transactions/reports/summary': 'Get overall transaction summary',
          'GET /transactions/reports/account/:accountId': 'Get account-specific statistics',
          'GET /transactions/reports/monthly': 'Get monthly transaction statistics',
          'GET /transactions/reports/trends': 'Get transaction trends over time'
        }
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Transaction Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  console.log(`\nService: Transaction Management Microservice`);
  console.log(`Developer: Chaker Allah Dimassi - TechWin Team\n`);

  // Register with service discovery
  try {
    const { ServiceRegistration } = require('../../shared/serviceRegistration');
    const registration = new ServiceRegistration('transactions-service', PORT);
    await registration.register();
  } catch (error) {
    console.warn('⚠️  Service discovery not available, continuing without it...');
  }
});

module.exports = app;

