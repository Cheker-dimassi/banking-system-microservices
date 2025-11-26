const path = require('path');

// Load config once at startup
let feesConfig;
try {
  feesConfig = require('../data/fees-config.json');
} catch (error) {
  feesConfig = {
    INTERNAL_TRANSFER: 0.5,
    INTERBANK_TRANSFER: 2,
    CURRENCY_CONVERSION: 1,
    WITHDRAWAL: { sameBank: 0, otherBank: 5 }
  };
}

function getFeesConfig() {
  return feesConfig;
}

function calculateFees(req, res, next) {
  const { type, amount, fromAccount, toAccount } = req.body;
  const feesConfig = getFeesConfig();
  let fees = 0;
  let commission = 0;

  try {
    switch (type) {
      case 'deposit':
        fees = 0;
        commission = 0;
        break;

      case 'withdrawal':
        // Simplified: assume same bank for now
        fees = feesConfig.WITHDRAWAL.sameBank;
        commission = 0;
        break;

      case 'internal_transfer':
        fees = (amount * feesConfig.INTERNAL_TRANSFER) / 100;
        commission = fees * 0.5; // 50% of fees as commission
        break;

      case 'interbank_transfer':
        fees = (amount * feesConfig.INTERBANK_TRANSFER) / 100;
        commission = fees * 0.5; // 50% of fees as commission
        break;

      default:
        fees = 0;
        commission = 0;
    }

    req.calculatedFees = {
      fees: parseFloat(fees.toFixed(2)),
      commission: parseFloat(commission.toFixed(2))
    };

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  calculateFees,
  getFeesConfig
};

