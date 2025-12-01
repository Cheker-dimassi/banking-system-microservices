const Transaction = require('../models/transaction');
const { executeTransactionSaga, reverseTransaction, getAccount } = require('../utils/atomicity');
const {
  getDailyTransactionAmount,
  TRANSACTION_LIMITS
} = require('../utils/limits');
const { detectFraud, getSuspiciousTransactions } = require('../utils/fraudDetection');
const { calculateFees, getFeesConfig } = require('../middleware/fees');
const { fetchCategory } = require('../utils/categoryService');

async function resolveCategoryDetails(categoryId) {
  if (!categoryId || typeof categoryId !== 'string' || categoryId.trim() === '') {
    return { categoryId: null, categoryName: null };
  }

  const trimmedId = categoryId.trim();

  try {
    const category = await fetchCategory(trimmedId);
    if (!category) {
      throw new Error(`Category '${trimmedId}' not found. Please create it first in the Category service.`);
    }
    return {
      categoryId: category.categoryId || trimmedId,
      categoryName: category.name || trimmedId
    };
  } catch (error) {
    if (error.message && error.message.includes('Unable to verify category')) {
      throw new Error(error.message);
    }
    throw new Error(`Category '${trimmedId}' not found. Please create it first in the Category service.`);
  }
}

// ==================== MÉTIER 1: Core Transaction Processing ====================

async function deposit(req, res) {
  try {
    const { toAccount, amount, currency = 'TND', description = '', categoryId } = req.body;
    const fees = req.calculatedFees?.fees || 0;
    const fraudCheck = req.fraudCheck || { flagged: false, securityLevel: 'low' };

    let categoryInfo = { categoryId: null, categoryName: null };
    try {
      categoryInfo = await resolveCategoryDetails(categoryId);
    } catch (categoryError) {
      return res.status(400).json({ success: false, error: categoryError.message });
    }

    const transactionData = {
      type: 'deposit',
      toAccount,
      amount,
      currency,
      fees,
      commission: 0,
      description,
      securityLevel: fraudCheck.securityLevel,
      fraudFlag: fraudCheck.flagged,
      categoryId: categoryInfo.categoryId,
      categoryName: categoryInfo.categoryName
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
    const { fromAccount, amount, currency = 'TND', description = '', categoryId } = req.body;
    const fees = req.calculatedFees?.fees || 0;
    const fraudCheck = req.fraudCheck || { flagged: false, securityLevel: 'low' };

    let categoryInfo = { categoryId: null, categoryName: null };
    try {
      categoryInfo = await resolveCategoryDetails(categoryId);
    } catch (categoryError) {
      return res.status(400).json({ success: false, error: categoryError.message });
    }

    const transactionData = {
      type: 'withdrawal',
      fromAccount,
      amount,
      currency,
      fees,
      commission: 0,
      description,
      securityLevel: fraudCheck.securityLevel,
      fraudFlag: fraudCheck.flagged,
      categoryId: categoryInfo.categoryId,
      categoryName: categoryInfo.categoryName
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
    const { fromAccount, toAccount, amount, currency = 'TND', description = '', categoryId } = req.body;
    const fees = req.calculatedFees?.fees || 0;
    const commission = req.calculatedFees?.commission || 0;
    const fraudCheck = req.fraudCheck || { flagged: false, securityLevel: 'low' };

    let categoryInfo = { categoryId: null, categoryName: null };
    try {
      categoryInfo = await resolveCategoryDetails(categoryId);
    } catch (categoryError) {
      return res.status(400).json({ success: false, error: categoryError.message });
    }

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
      fraudFlag: fraudCheck.flagged,
      categoryId: categoryInfo.categoryId,
      categoryName: categoryInfo.categoryName
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
    const { fromAccount, toAccount, amount, currency = 'TND', description = '', categoryId } = req.body;
    const fees = req.calculatedFees?.fees || 0;
    const commission = req.calculatedFees?.commission || 0;
    const fraudCheck = req.fraudCheck || { flagged: false, securityLevel: 'low' };

    let categoryInfo = { categoryId: null, categoryName: null };
    try {
      categoryInfo = await resolveCategoryDetails(categoryId);
    } catch (categoryError) {
      return res.status(400).json({ success: false, error: categoryError.message });
    }

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
      fraudFlag: fraudCheck.flagged,
      categoryId: categoryInfo.categoryId,
      categoryName: categoryInfo.categoryName
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
    
    // Try to find by transactionId first, then by MongoDB _id
    let transaction = await Transaction.findOne({ transactionId: id });
    
    // If not found by transactionId, try MongoDB _id
    if (!transaction && id.match(/^[0-9a-fA-F]{24}$/)) {
      transaction = await Transaction.findById(id);
    }
    
    // If still not found, try as-is (might be partial match)
    if (!transaction) {
      transaction = await Transaction.findOne({ 
        $or: [
          { transactionId: id },
          { transactionId: { $regex: id, $options: 'i' } }
        ]
      });
    }

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found',
        hint: 'Make sure you are using the correct transactionId (e.g., TXN_XXXXXXXX)'
      });
    }

    res.json({ 
      success: true, 
      transaction: typeof transaction.toJSON === 'function' ? transaction.toJSON() : transaction 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find transaction
    let transaction = await Transaction.findOne({ transactionId: id });
    
    if (!transaction && id.match(/^[0-9a-fA-F]{24}$/)) {
      transaction = await Transaction.findById(id);
    }
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found',
        hint: 'Use GET /transactions to list all transactions'
      });
    }

    // Prevent updating immutable fields
    delete updates.transactionId;
    delete updates.type;
    delete updates.fromAccount;
    delete updates.toAccount;
    delete updates.amount;
    delete updates.createdAt;

    // Only allow updating certain fields
    const allowedFields = ['description', 'currency', 'status'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Validate status if being updated
    if (filteredUpdates.status) {
      const validStatuses = ['pending', 'completed', 'failed', 'cancelled', 'reversed'];
      if (!validStatuses.includes(filteredUpdates.status)) {
        return res.status(400).json({
          success: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
    }

    // Update transaction
    Object.assign(transaction, filteredUpdates);
    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: typeof transaction.toJSON === 'function' ? transaction.toJSON() : transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    
    // Try to find the transaction first to confirm it exists
    let transaction = await Transaction.findOne({ transactionId: id });
    
    // If not found by transactionId, try MongoDB _id
    if (!transaction && id.match(/^[0-9a-fA-F]{24}$/)) {
      transaction = await Transaction.findById(id);
    }
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found',
        hint: 'Make sure you are using the correct transactionId (e.g., TXN_XXXXXXXX)'
      });
    }
    
    // Delete using the found transaction's _id or transactionId
    const result = await Transaction.deleteOne({ 
      $or: [
        { transactionId: id },
        { _id: transaction._id }
      ]
    });

    if (result.deletedCount > 0) {
      res.json({ 
        success: true, 
        message: 'Transaction deleted successfully',
        deletedTransaction: transaction.transactionId
      });
    } else {
      res.status(404).json({ success: false, error: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getAllTransactions(req, res) {
  try {
    const { categoryId } = req.query;
    const filter = {};

    if (categoryId && typeof categoryId === 'string' && categoryId.trim() !== '') {
      filter.categoryId = categoryId.trim();
    }

    const transactions = await Transaction.find(filter).lean().exec();
    const transactionsArray = Array.isArray(transactions) ? transactions : [];

    res.json({
      success: true,
      count: transactionsArray.length,
      transactions: transactionsArray.map(t => ({
        transactionId: t.transactionId,
        type: t.type,
        amount: t.amount,
        status: t.status,
        fromAccount: t.fromAccount,
        toAccount: t.toAccount,
        timestamp: t.timestamp,
        categoryId: t.categoryId || null,
        categoryName: t.categoryName || null
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getTransactionsByAccount(req, res) {
  try {
    const { accountId } = req.params;
    const transactions = await Transaction.findByAccountId(accountId);

    // Ensure transactions is an array
    const transactionsArray = Array.isArray(transactions) ? transactions : [];
    
    if (!Array.isArray(transactionsArray)) {
      return res.status(500).json({ 
        success: false, 
        error: 'Invalid transactions data format' 
      });
    }

    res.json({
      success: true,
      accountId,
      count: transactionsArray.length,
      transactions: transactionsArray.map(t => {
        if (typeof t.toJSON === 'function') {
          return t.toJSON();
        }
        return t;
      })
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// ==================== MÉTIER 2: Security & Limits Management ====================

async function getLimits(req, res) {
  try {
    const { accountId } = req.params;
    const account = await getAccount(accountId);

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const dailyWithdrawal = await getDailyTransactionAmount(accountId, 'withdrawal');
    const dailyTransfer = await getDailyTransactionAmount(accountId, 'transfer');

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

    // Get account from MongoDB
    const Account = require('../models/account');
    const account = await Account.findOne({ accountId });

    if (!account) {
      return res.status(404).json({ 
        success: false, 
        error: `Account ${accountId} not found`,
        hint: 'Make sure the account exists. Use ACC_123, ACC_456, or EXT_999 for testing.'
      });
    }

    // Update account's custom limits in MongoDB
    if (dailyWithdrawal !== undefined) {
      if (!account.customLimits) {
        account.customLimits = {};
      }
      account.customLimits.dailyWithdrawal = dailyWithdrawal;
    }
    
    if (dailyTransfer !== undefined) {
      if (!account.customLimits) {
        account.customLimits = {};
      }
      account.customLimits.dailyTransfer = dailyTransfer;
    }
    
    if (singleTransaction !== undefined) {
      if (!account.customLimits) {
        account.customLimits = {};
      }
      account.customLimits.singleTransaction = singleTransaction;
    }

    // Save the account update to MongoDB
    await account.save();

    res.json({
      success: true,
      message: 'Account limits updated successfully',
      accountId,
      limits: {
        dailyWithdrawal: account.customLimits?.dailyWithdrawal || TRANSACTION_LIMITS.DAILY_WITHDRAWAL,
        dailyTransfer: account.customLimits?.dailyTransfer || TRANSACTION_LIMITS.DAILY_TRANSFER,
        singleTransaction: account.customLimits?.singleTransaction || TRANSACTION_LIMITS.SINGLE_TRANSACTION
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function fraudCheckEndpoint(req, res) {
  try {
    const transactionData = req.body;
    const fraudResult = await detectFraud(transactionData);

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
    
    // Validate that id is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID is required',
        hint: 'Use the transactionId from the transaction response (e.g., TXN_XXXXXXXX)'
      });
    }
    
    const result = await reverseTransaction(id);

    if (result.success) {
      res.json({
        success: true,
        message: 'Transaction reversed successfully',
        originalTransaction: result.originalTransaction,
        reversalTransaction: result.reversalTransaction
      });
    } else {
      // Check if it's a "not found" error
      if (result.error && result.error.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: result.error,
          hint: 'List all transactions with GET /transactions to see available transactionIds'
        });
      }
      
      // Check if it's a validation error (status not completed, already reversed, etc.)
      if (result.error && (result.error.includes('Only completed') || result.error.includes('already reversed'))) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
      // Other errors
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    // Handle thrown errors
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        hint: 'List all transactions with GET /transactions to see available transactionIds'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

async function getSuspiciousTransactionsEndpoint(req, res) {
  try {
    const { accountId } = req.params;
    const suspicious = await getSuspiciousTransactions(accountId);
    const suspiciousArray = Array.isArray(suspicious) ? suspicious : [];

    res.json({
      success: true,
      accountId,
      count: suspiciousArray.length,
      transactions: suspiciousArray.map(t => typeof t.toJSON === 'function' ? t.toJSON() : t)
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
    // Get all transactions from database
    const transactions = await Transaction.find({}).lean();

    // Ensure transactions is an array
    const transactionsArray = Array.isArray(transactions) ? transactions : [];
    
    if (!Array.isArray(transactionsArray)) {
      return res.status(500).json({ 
        success: false, 
        error: 'Invalid transactions data format' 
      });
    }
    
    let filteredTransactions = transactionsArray.filter(t => {
      return t && t.status === 'completed' && (t.commission || 0) > 0;
    });

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
    const account = await getAccount(accountId);

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
    const { baseCurrency = 'TND' } = req.query;
    const { fetchRealTimeRates } = require('../utils/currencyExchange');
    
    const rates = await fetchRealTimeRates(baseCurrency);
    
    res.json(rates);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function convertCurrency(req, res) {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;
    
    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, fromCurrency, toCurrency'
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      });
    }

    const { convertCurrency: convert } = require('../utils/currencyExchange');
    const result = await convert(amount, fromCurrency, toCurrency);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
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
  getAllTransactions,
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
  getCurrencyRates,
  convertCurrency,
  updateTransaction
};

