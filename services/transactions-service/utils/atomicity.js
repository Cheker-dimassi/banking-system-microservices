const Transaction = require('../models/transaction');
const Account = require('../models/account');

async function getAccount(accountId) {
  return await Account.findOne({ accountId });
}

async function updateAccountBalance(accountId, amount, operation = 'debit') {
  const account = await getAccount(accountId);

  if (!account) {
    throw new Error(`Account ${accountId} not found`);
  }

  if (operation === 'debit') {
    account.balance -= amount;
  } else if (operation === 'credit') {
    account.balance += amount;
  }

  await account.save();
  return account;
}

async function executeTransactionSaga(transactionData) {
  const steps = [];
  let transaction = null;

  try {
    // Step 1: Create pending transaction record
    transaction = await Transaction.create({
      ...transactionData,
      status: 'pending'
    });
    steps.push('created');

    // Step 2: Validate accounts
    if (transactionData.fromAccount) {
      const fromAccount = await getAccount(transactionData.fromAccount);
      if (!fromAccount) {
        throw new Error(`Source account ${transactionData.fromAccount} not found`);
      }
      if (fromAccount.status !== 'active') {
        throw new Error(`Source account ${transactionData.fromAccount} is not active`);
      }
    }

    if (transactionData.toAccount) {
      const toAccount = await getAccount(transactionData.toAccount);
      if (!toAccount) {
        throw new Error(`Destination account ${transactionData.toAccount} not found`);
      }
      if (toAccount.status !== 'active') {
        throw new Error(`Destination account ${transactionData.toAccount} is not active`);
      }
    }
    steps.push('validated');

    // Step 3: Process debit (if applicable)
    if (transactionData.fromAccount && ['withdrawal', 'internal_transfer', 'interbank_transfer'].includes(transactionData.type)) {
      const fromAccount = await getAccount(transactionData.fromAccount);
      const totalAmount = transactionData.amount + transactionData.fees;

      if (fromAccount.balance < totalAmount) {
        throw new Error('Insufficient balance');
      }

      await updateAccountBalance(transactionData.fromAccount, totalAmount, 'debit');
      steps.push('debited');
    }

    // Step 4: Process credit (if applicable)
    if (transactionData.toAccount && ['deposit', 'internal_transfer', 'interbank_transfer'].includes(transactionData.type)) {
      await updateAccountBalance(transactionData.toAccount, transactionData.amount, 'credit');
      steps.push('credited');
    }

    // Step 5: Commit transaction
    transaction.status = 'completed';
    await transaction.save();
    steps.push('committed');

    return {
      success: true,
      transaction: transaction.toJSON(),
      steps
    };

  } catch (error) {
    // Rollback: Compensating actions
    if (transaction) {
      try {
        // Reverse any debits
        if (steps.includes('debited') && transactionData.fromAccount) {
          await updateAccountBalance(transactionData.fromAccount, transactionData.amount + transactionData.fees, 'credit');
        }

        // Reverse any credits
        if (steps.includes('credited') && transactionData.toAccount) {
          await updateAccountBalance(transactionData.toAccount, transactionData.amount, 'debit');
        }

        transaction.status = 'failed';
        await transaction.save();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }

    return {
      success: false,
      error: error.message,
      steps,
      transaction: transaction ? transaction.toJSON() : null
    };
  }
}

async function reverseTransaction(transactionId) {
  const transaction = await Transaction.findOne({ transactionId });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.status !== 'completed') {
    throw new Error('Only completed transactions can be reversed');
  }

  if (transaction.status === 'reversed') {
    throw new Error('Transaction already reversed');
  }

  try {
    // Create reversal transaction
    const reversalData = {
      type: transaction.type,
      fromAccount: transaction.toAccount,
      toAccount: transaction.fromAccount,
      amount: transaction.amount,
      currency: transaction.currency,
      fees: 0,
      description: `Reversal of ${transaction.transactionId}`,
      reference: transaction.transactionId
    };

    const reversalResult = await executeTransactionSaga(reversalData);

    if (reversalResult.success) {
      transaction.status = 'reversed';
      await transaction.save();
      return {
        success: true,
        originalTransaction: transaction.toJSON(),
        reversalTransaction: reversalResult.transaction
      };
    } else {
      throw new Error(reversalResult.error);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  getAccount,
  updateAccountBalance,
  executeTransactionSaga,
  reverseTransaction
};
