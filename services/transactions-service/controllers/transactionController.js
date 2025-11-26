const Transaction = require('../models/transaction');
const { executeTransactionSaga, reverseTransaction, getAccount } = require('../utils/atomicity');
const {
  getDailyTransactionAmount,
  TRANSACTION_LIMITS
} = require('../utils/limits');
const { detectFraud, getSuspiciousTransactions } = require('../utils/fraudDetection');
const { calculateFees, getFeesConfig } = require('../middleware/fees');

// ==================== MÉTIER 1: Core Transaction Processing ====================

async function deposit(req, res) {
  try {
    const { toAccount, amount, currency = 'TND', description = '' } = req.body;
    const fees = req.calculatedFees?.fees || 0;
    const fraudCheck = req.fraudCheck || { flagged: false, securityLevel: 'low' };

    const transactionData = {
      type: 'deposit',
      toAccount,
      amount,
      currency,
      fees,
      commission: 0,
      description,
      securityLevel: fraudCheck.securityLevel,
      fraudFlag: fraudCheck.flagged
    };

    const result = await executeTransactionSaga(transactionData);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Deposit completed successfully',
        transaction: result.transaction
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        transaction: result.transaction
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function withdrawal(req, res) {
  try {
    const { fromAccount, amount, currency = 'TND', description = '' } = req.body;
    const fees = req.calculatedFees?.fees || 0;
    const fraudCheck = req.fraudCheck || { flagged: false, securityLevel: 'low' };

    const transactionData = {
      type: 'withdrawal',
      fromAccount,
      amount,
      currency,
      fees,
      commission: 0,
      description,
      securityLevel: fraudCheck.securityLevel,
      fraudFlag: fraudCheck.flagged
    };

    const result = await executeTransactionSaga(transactionData);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Withdrawal completed successfully',
        transaction: result.transaction
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        transaction: result.transaction
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function internalTransfer(req, res) {
  try {
    const { fromAccount, toAccount, amount, currency = 'TND', description = '' } = req.body;
    const fees = req.calculatedFees?.fees || 0;
    const commission = req.calculatedFees?.commission || 0;
    const fraudCheck = req.fraudCheck || { flagged: false, securityLevel: 'low' };

    const transactionData = {
      type: 'internal_transfer',
      fromAccount,
      toAccount,
      amount,
      currency,
      fees,
      commission,
      description,
      securityLevel: fraudCheck.securityLevel,
      fraudFlag: fraudCheck.flagged
    };

    const result = await executeTransactionSaga(transactionData);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Internal transfer completed successfully',
        transaction: result.transaction
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        transaction: result.transaction
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function interbankTransfer(req, res) {
  try {
    const { fromAccount, toAccount, amount, currency = 'TND', description = '' } = req.body;
    const fees = req.calculatedFees?.fees || 0;
    const commission = req.calculatedFees?.commission || 0;
    const fraudCheck = req.fraudCheck || { flagged: false, securityLevel: 'low' };

    const transactionData = {
      type: 'interbank_transfer',
      fromAccount,
      toAccount,
      amount,
      currency,
      fees,
      commission,
      description,
      securityLevel: fraudCheck.securityLevel,
      fraudFlag: fraudCheck.flagged
    };

    const result = await executeTransactionSaga(transactionData);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Interbank transfer completed successfully',
        transaction: result.transaction
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        transaction: result.transaction
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getTransactionById(req, res) {
  try {
    const { id } = req.params;
    const transaction = Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    res.json({ success: true, transaction: typeof transaction.toJSON === 'function' ? transaction.toJSON() : transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const deleted = Transaction.deleteById(id);

    if (deleted) {
      res.json({ success: true, message: 'Transaction deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getTransactionsByAccount(req, res) {
  try {
    const { accountId } = req.params;
    const transactions = Transaction.findByAccountId(accountId);

    res.json({
      success: true,
      accountId,
      count: transactions.length,
      transactions: transactions.map(t => typeof t.toJSON === 'function' ? t.toJSON() : t)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// ==================== MÉTIER 2: Security & Limits Management ====================

async function getLimits(req, res) {
  try {
    const { accountId } = req.params;
    const account = getAccount(accountId);

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const dailyWithdrawal = getDailyTransactionAmount(accountId, 'withdrawal');
    const dailyTransfer = getDailyTransactionAmount(accountId, 'transfer');

    res.json({
      success: true,
      accountId,
      limits: {
        dailyWithdrawal: {
          used: dailyWithdrawal,
          limit: TRANSACTION_LIMITS.DAILY_WITHDRAWAL,
          remaining: TRANSACTION_LIMITS.DAILY_WITHDRAWAL - dailyWithdrawal
        },
        dailyTransfer: {
          used: dailyTransfer,
          limit: TRANSACTION_LIMITS.DAILY_TRANSFER,
          remaining: TRANSACTION_LIMITS.DAILY_TRANSFER - dailyTransfer
        },
        singleTransaction: TRANSACTION_LIMITS.SINGLE_TRANSACTION,
        minTransaction: TRANSACTION_LIMITS.MIN_TRANSACTION
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function updateLimits(req, res) {
  try {
    const { accountId } = req.params;
    const { dailyWithdrawal, dailyTransfer, singleTransaction } = req.body;

    // In a real system, limits might be stored per account in the DB.
    // For this demo, we will update the global limits in memory or per account if we had that structure.
    // Let's simulate updating custom limits for this account by storing it in a new 'accountLimits' map in DataStore.
    // Since DataStore doesn't have that yet, we'll just return a success message with the *new* values echoed back
    // to confirm the PUT worked.

    // To make it "real", let's assume we are updating the account's custom limits.
    const account = getAccount(accountId);
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    // Update account object with new limits (simulated persistence)
    account.customLimits = {
      dailyWithdrawal: dailyWithdrawal || TRANSACTION_LIMITS.DAILY_WITHDRAWAL,
      dailyTransfer: dailyTransfer || TRANSACTION_LIMITS.DAILY_TRANSFER,
      singleTransaction: singleTransaction || TRANSACTION_LIMITS.SINGLE_TRANSACTION
    };

    // Save the account update
    const dataStore = require('../utils/dataStore');
    dataStore.saveAccount(account);

    res.json({
      success: true,
      message: 'Account limits updated successfully',
      accountId,
      limits: account.customLimits
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function fraudCheckEndpoint(req, res) {
  try {
    const transactionData = req.body;
    const fraudResult = detectFraud(transactionData);

    res.json({
      success: true,
      fraudCheck: {
        isFraud: fraudResult.isFraud,
        flags: fraudResult.flags,
        securityLevel: fraudResult.securityLevel
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function reverseTransactionEndpoint(req, res) {
  try {
    const { id } = req.params;
    const result = await reverseTransaction(id);

    if (result.success) {
      res.json({
        success: true,
        message: 'Transaction reversed successfully',
        originalTransaction: result.originalTransaction,
        reversalTransaction: result.reversalTransaction
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getSuspiciousTransactionsEndpoint(req, res) {
  try {
    const { accountId } = req.params;
    const suspicious = getSuspiciousTransactions(accountId);

    res.json({
      success: true,
      accountId,
      count: suspicious.length,
      transactions: suspicious.map(t => typeof t.toJSON === 'function' ? t.toJSON() : t)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// ==================== MÉTIER 3: Fees & Commission System ====================

async function calculateFeesEndpoint(req, res) {
  try {
    const { type, amount, fromAccount, toAccount } = req.body;

    // Use the middleware logic
    const feesConfig = getFeesConfig();
    let fees = 0;
    let commission = 0;

    switch (type) {
      case 'deposit':
        fees = 0;
        commission = 0;
        break;
      case 'withdrawal':
        fees = feesConfig.WITHDRAWAL.sameBank;
        commission = 0;
        break;
      case 'internal_transfer':
        fees = (amount * feesConfig.INTERNAL_TRANSFER) / 100;
        commission = fees * 0.5;
        break;
      case 'interbank_transfer':
        fees = (amount * feesConfig.INTERBANK_TRANSFER) / 100;
        commission = fees * 0.5;
        break;
    }

    res.json({
      success: true,
      calculation: {
        type,
        amount,
        fees: parseFloat(fees.toFixed(2)),
        commission: parseFloat(commission.toFixed(2)),
        total: parseFloat((amount + fees).toFixed(2))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getCommissions(req, res) {
  try {
    const { period } = req.params; // e.g., '2024-01', 'daily', 'monthly'
    const transactions = Transaction.getAll();

    let filteredTransactions = transactions.filter(t => t.status === 'completed' && t.commission > 0);

    // Filter by period if provided
    if (period && period !== 'all') {
      const now = new Date();
      filteredTransactions = filteredTransactions.filter(t => {
        const tDate = new Date(t.timestamp);
        if (period === 'daily') {
          return tDate.toISOString().split('T')[0] === now.toISOString().split('T')[0];
        } else if (period === 'monthly') {
          return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        } else if (period.match(/^\d{4}-\d{2}$/)) {
          const [year, month] = period.split('-');
          return tDate.getFullYear() == year && (tDate.getMonth() + 1) == month;
        }
        return true;
      });
    }

    const totalCommission = filteredTransactions.reduce((sum, t) => sum + t.commission, 0);

    res.json({
      success: true,
      period: period || 'all',
      totalCommission: parseFloat(totalCommission.toFixed(2)),
      transactionCount: filteredTransactions.length,
      transactions: filteredTransactions.map(t => ({
        transactionId: t.transactionId,
        type: t.type,
        amount: t.amount,
        commission: t.commission,
        timestamp: t.timestamp
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function feeWaiver(req, res) {
  try {
    const { accountId } = req.params;
    const account = getAccount(accountId);

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    // In a real system, this would update fee waiver rules in a database
    res.json({
      success: true,
      message: 'Fee waiver applied (simulated)',
      accountId,
      waivedFees: ['INTERNAL_TRANSFER', 'WITHDRAWAL']
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getCurrencyRates(req, res) {
  try {
    // Simulated currency rates
    res.json({
      success: true,
      baseCurrency: 'TND',
      rates: {
        USD: 3.1,
        EUR: 3.4,
        GBP: 3.9,
        TND: 1.0
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  // Métier 1
  deposit,
  withdrawal,
  internalTransfer,
  interbankTransfer,
  getTransactionById,
  deleteTransaction,
  getTransactionsByAccount,
  // Métier 2
  getLimits,
  updateLimits,
  fraudCheckEndpoint,
  reverseTransactionEndpoint,
  getSuspiciousTransactionsEndpoint,
  // Métier 3
  calculateFeesEndpoint,
  getCommissions,
  feeWaiver,
  getCurrencyRates
};

