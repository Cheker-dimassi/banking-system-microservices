const { checkMinTransactionLimit, checkSingleTransactionLimit } = require('../utils/limits');

function validateTransaction(req, res, next) {
  const { amount, type, fromAccount, toAccount } = req.body;
  const errors = [];

  // Validate amount
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.push('Amount must be a positive number');
  } else {
    if (!checkMinTransactionLimit(amount)) {
      errors.push(`Amount must be at least 1 TND`);
    }
    if (!checkSingleTransactionLimit(amount)) {
      errors.push(`Amount exceeds single transaction limit of 20000 TND`);
    }
  }

  // Validate type
  const validTypes = ['deposit', 'withdrawal', 'internal_transfer', 'interbank_transfer'];
  if (!type || !validTypes.includes(type)) {
    errors.push(`Type must be one of: ${validTypes.join(', ')}`);
  }

  // Validate accounts based on type
  if (type === 'deposit' && !toAccount) {
    errors.push('toAccount is required for deposit');
  }
  
  if (type === 'withdrawal' && !fromAccount) {
    errors.push('fromAccount is required for withdrawal');
  }
  
  if ((type === 'internal_transfer' || type === 'interbank_transfer') && (!fromAccount || !toAccount)) {
    errors.push('Both fromAccount and toAccount are required for transfers');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

function validateAccountId(req, res, next) {
  const { accountId } = req.params;
  
  if (!accountId) {
    return res.status(400).json({ success: false, error: 'Account ID is required' });
  }

  next();
}

function validateTransactionId(req, res, next) {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ success: false, error: 'Transaction ID is required' });
  }

  next();
}

module.exports = {
  validateTransaction,
  validateAccountId,
  validateTransactionId
};

