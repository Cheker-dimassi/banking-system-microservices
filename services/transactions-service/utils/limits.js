const Transaction = require('../models/transaction');

const TRANSACTION_LIMITS = {
  DAILY_WITHDRAWAL: 5000,    // 5000 TND per day
  DAILY_TRANSFER: 10000,     // 10000 TND per day  
  SINGLE_TRANSACTION: 2000,  // 2000 TND per transaction
  MIN_TRANSACTION: 1         // 1 TND minimum
};

const MIN_ACCOUNT_BALANCE = 10; // 10 TND minimum

async function getDailyTransactionAmount(accountId, type, date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  const startOfDay = new Date(dateStr);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);

  let typeQuery = {};
  if (type === 'withdrawal') {
    typeQuery = { type: 'withdrawal' };
  } else if (type === 'transfer') {
    typeQuery = { type: { $in: ['internal_transfer', 'interbank_transfer'] } };
  }

  const transactions = await Transaction.find({
    $or: [{ fromAccount: accountId }, { toAccount: accountId }],
    timestamp: { $gte: startOfDay, $lte: endOfDay },
    status: 'completed',
    ...typeQuery
  });

  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

function checkDailyWithdrawalLimit(accountId, amount) {
  const dailyAmount = getDailyTransactionAmount(accountId, 'withdrawal');
  return (dailyAmount + amount) <= TRANSACTION_LIMITS.DAILY_WITHDRAWAL;
}

function checkDailyTransferLimit(accountId, amount) {
  const dailyAmount = getDailyTransactionAmount(accountId, 'transfer');
  return (dailyAmount + amount) <= TRANSACTION_LIMITS.DAILY_TRANSFER;
}

function checkSingleTransactionLimit(amount) {
  return amount <= TRANSACTION_LIMITS.SINGLE_TRANSACTION;
}

function checkMinTransactionLimit(amount) {
  return amount >= TRANSACTION_LIMITS.MIN_TRANSACTION;
}

function checkMinBalance(balance, amount) {
  return (balance - amount) >= MIN_ACCOUNT_BALANCE;
}

module.exports = {
  TRANSACTION_LIMITS,
  MIN_ACCOUNT_BALANCE,
  getDailyTransactionAmount,
  checkDailyWithdrawalLimit,
  checkDailyTransferLimit,
  checkSingleTransactionLimit,
  checkMinTransactionLimit,
  checkMinBalance
};

