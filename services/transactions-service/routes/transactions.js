const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const reportsController = require('../controllers/reportsController');
const { validateTransaction, validateAccountId, validateTransactionId } = require('../middleware/validation');
const { validateAccountStatus, checkLimits, fraudCheck } = require('../middleware/security');
const { calculateFees } = require('../middleware/fees');

// ==================== MÉTIER 1: Core Transaction Processing ====================

// POST /transactions/deposit
router.post('/deposit',
  validateTransaction,
  validateAccountStatus,
  calculateFees,
  fraudCheck,
  transactionController.deposit
);

// POST /transactions/withdrawal
router.post('/withdrawal',
  validateTransaction,
  validateAccountStatus,
  checkLimits,
  calculateFees,
  fraudCheck,
  transactionController.withdrawal
);

// POST /transactions/internal-transfer
router.post('/internal-transfer',
  validateTransaction,
  validateAccountStatus,
  checkLimits,
  calculateFees,
  fraudCheck,
  transactionController.internalTransfer
);

// POST /transactions/interbank-transfer
router.post('/interbank-transfer',
  validateTransaction,
  validateAccountStatus,
  checkLimits,
  calculateFees,
  fraudCheck,
  transactionController.interbankTransfer
);

// GET /transactions (list all - must come before /:id)
router.get('/',
  transactionController.getAllTransactions
);

// GET /transactions/account/:accountId
router.get('/account/:accountId',
  validateAccountId,
  transactionController.getTransactionsByAccount
);

// ==================== MÉTIER 2: Security & Limits Management ====================

// POST /transactions/fraud-check (must come before /:id routes)
router.post('/fraud-check',
  validateTransaction,
  transactionController.fraudCheckEndpoint
);

// GET /transactions/limits/:accountId
router.get('/limits/:accountId',
  validateAccountId,
  transactionController.getLimits
);

// PUT /transactions/limits/:accountId
router.put('/limits/:accountId',
  validateAccountId,
  transactionController.updateLimits
);

// PUT /transactions/:id (update transaction) - keep after specific PUT routes
router.put('/:id',
  validateTransactionId,
  transactionController.updateTransaction
);

// POST /transactions/:id/reverse
router.post('/:id/reverse',
  validateTransactionId,
  transactionController.reverseTransactionEndpoint
);

// GET /transactions/suspicious/:accountId
router.get('/suspicious/:accountId',
  validateAccountId,
  transactionController.getSuspiciousTransactionsEndpoint
);

// ==================== MÉTIER 3: Fees & Commission System ====================

// POST /transactions/fees/calculate
router.post('/fees/calculate',
  validateTransaction,
  transactionController.calculateFeesEndpoint
);

// GET /transactions/commissions/:period
router.get('/commissions/:period',
  transactionController.getCommissions
);

// POST /transactions/fee-waiver/:accountId
router.post('/fee-waiver/:accountId',
  validateAccountId,
  transactionController.feeWaiver
);

// GET /transactions/currency-rates
router.get('/currency-rates',
  transactionController.getCurrencyRates
);

// POST /transactions/currency/convert
router.post('/currency/convert',
  transactionController.convertCurrency
);

// ==================== MÉTIER 4: Transaction Reports & Analytics ====================

// GET /transactions/reports/summary
router.get('/reports/summary',
  reportsController.getSummary
);

// GET /transactions/reports/account/:accountId
router.get('/reports/account/:accountId',
  validateAccountId,
  reportsController.getAccountStatistics
);

// GET /transactions/reports/monthly
router.get('/reports/monthly',
  reportsController.getMonthlyStatistics
);

// GET /transactions/reports/trends
router.get('/reports/trends',
  reportsController.getTrends
);

// DELETE /transactions/:id
router.delete('/:id',
  validateTransactionId,
  transactionController.deleteTransaction
);

// GET /transactions/:id (generic catch-all, must come last among GET routes)
router.get('/:id',
  validateTransactionId,
  transactionController.getTransactionById
);

module.exports = router;

