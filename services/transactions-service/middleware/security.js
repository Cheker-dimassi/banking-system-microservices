const { getAccount } = require('../utils/atomicity');
const { 
  checkDailyWithdrawalLimit, 
  checkDailyTransferLimit, 
  checkMinBalance 
} = require('../utils/limits');
const { detectFraud } = require('../utils/fraudDetection');

const ALLOWED_ACCOUNT_STATUSES = ['active', 'approved'];
const BLOCKED_STATUSES = ['frozen', 'closed', 'suspended'];

async function validateAccountStatus(req, res, next) {
  const { fromAccount, toAccount, type } = req.body;

  try {
    if (fromAccount) {
      const account = await getAccount(fromAccount);
      if (!account) {
        return res.status(404).json({ success: false, error: `Account ${fromAccount} not found` });
      }
      if (BLOCKED_STATUSES.includes(account.status)) {
        return res.status(403).json({ 
          success: false, 
          error: `Account ${fromAccount} is ${account.status}` 
        });
      }
      if (!ALLOWED_ACCOUNT_STATUSES.includes(account.status)) {
        return res.status(403).json({ 
          success: false, 
          error: `Account ${fromAccount} is not in an allowed status` 
        });
      }
    }

    if (toAccount) {
      const account = await getAccount(toAccount);
      if (!account) {
        return res.status(404).json({ success: false, error: `Account ${toAccount} not found` });
      }
      if (BLOCKED_STATUSES.includes(account.status)) {
        return res.status(403).json({ 
          success: false, 
          error: `Account ${toAccount} is ${account.status}` 
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function checkLimits(req, res, next) {
  const { fromAccount, amount, type } = req.body;

  if (!fromAccount) {
    return next(); // No limits to check for deposits
  }

  try {
    const account = await getAccount(fromAccount);
    if (!account) {
      return res.status(404).json({ success: false, error: `Account ${fromAccount} not found` });
    }

    // Check balance
    if (['withdrawal', 'internal_transfer', 'interbank_transfer'].includes(type)) {
      if (!checkMinBalance(account.balance, amount)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Transaction would result in balance below minimum (10 TND)' 
        });
      }
    }

    // Check daily limits
    if (type === 'withdrawal') {
      if (!(await checkDailyWithdrawalLimit(fromAccount, amount))) {
        return res.status(400).json({ 
          success: false, 
          error: 'Daily withdrawal limit exceeded (50000 TND)' 
        });
      }
    }

    if (type === 'internal_transfer' || type === 'interbank_transfer') {
      if (!(await checkDailyTransferLimit(fromAccount, amount))) {
        return res.status(400).json({ 
          success: false, 
          error: 'Daily transfer limit exceeded (100000 TND)' 
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function fraudCheck(req, res, next) {
  const transactionData = req.body;

  try {
    const fraudResult = await detectFraud(transactionData);
    
    if (fraudResult.isFraud) {
      req.fraudCheck = {
        flagged: true,
        flags: fraudResult.flags,
        securityLevel: fraudResult.securityLevel
      };
    } else {
      req.fraudCheck = {
        flagged: false,
        securityLevel: fraudResult.securityLevel
      };
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  validateAccountStatus,
  checkLimits,
  fraudCheck
};

