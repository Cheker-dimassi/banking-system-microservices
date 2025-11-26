const Transaction = require('../models/transaction');

const SECURITY_RULES = {
  SUSPICIOUS_AMOUNT: 10000,
  RAPID_TRANSACTIONS: 5, // per hour
  BUSINESS_HOURS: { start: 8, end: 18 } // 8 AM - 6 PM
};

function checkSuspiciousAmount(amount) {
  return amount >= SECURITY_RULES.SUSPICIOUS_AMOUNT;
}

function checkRapidTransactions(accountId, hours = 1) {
  const transactions = Transaction.findByAccountId(accountId);
  const now = new Date();
  const hourAgo = new Date(now.getTime() - hours * 60 * 60 * 1000);
  
  const recentTransactions = transactions.filter(t => {
    const tDate = new Date(t.timestamp);
    return tDate >= hourAgo && t.status === 'completed';
  });
  
  return recentTransactions.length >= SECURITY_RULES.RAPID_TRANSACTIONS;
}

function checkBusinessHours() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= SECURITY_RULES.BUSINESS_HOURS.start && 
         hour < SECURITY_RULES.BUSINESS_HOURS.end;
}

function determineSecurityLevel(amount, accountId) {
  if (checkSuspiciousAmount(amount) || checkRapidTransactions(accountId)) {
    return 'high';
  } else if (amount >= 5000) {
    return 'medium';
  }
  return 'low';
}

function detectFraud(transaction) {
  const fraudFlags = [];
  
  if (checkSuspiciousAmount(transaction.amount)) {
    fraudFlags.push('SUSPICIOUS_AMOUNT');
  }
  
  if (checkRapidTransactions(transaction.fromAccount || transaction.toAccount)) {
    fraudFlags.push('RAPID_TRANSACTIONS');
  }
  
  if (!checkBusinessHours() && transaction.amount >= 5000) {
    fraudFlags.push('OUTSIDE_BUSINESS_HOURS');
  }
  
  return {
    isFraud: fraudFlags.length > 0,
    flags: fraudFlags,
    securityLevel: determineSecurityLevel(transaction.amount, transaction.fromAccount || transaction.toAccount)
  };
}

function getSuspiciousTransactions(accountId) {
  const transactions = Transaction.findByAccountId(accountId);
  return transactions.filter(t => t.fraudFlag === true || t.securityLevel === 'high');
}

module.exports = {
  SECURITY_RULES,
  checkSuspiciousAmount,
  checkRapidTransactions,
  checkBusinessHours,
  determineSecurityLevel,
  detectFraud,
  getSuspiciousTransactions
};

