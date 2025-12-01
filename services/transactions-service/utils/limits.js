const Transaction = require('../models/transaction');

const TRANSACTION_LIMITS = {
  DAILY_WITHDRAWAL: 50000,    // 50000 TND per day (increased for testing)
  DAILY_TRANSFER: 100000,     // 100000 TND per day (increased for testing)
  SINGLE_TRANSACTION: 20000,  // 20000 TND per transaction (increased for testing)
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
  }).lean().exec();

  // Ensure transactions is an array
  const transactionsArray = Array.isArray(transactions) ? transactions : [];
  
  return transactionsArray.reduce((sum, t) => {
    return sum + (t.amount || 0);
  }, 0);
}

async function checkDailyWithdrawalLimit(accountId, amount) {
  const dailyAmount = await getDailyTransactionAmount(accountId, 'withdrawal');
  return (dailyAmount + amount) <= TRANSACTION_LIMITS.DAILY_WITHDRAWAL;
}

async function checkDailyTransferLimit(accountId, amount) {
  const dailyAmount = await getDailyTransactionAmount(accountId, 'transfer');
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

