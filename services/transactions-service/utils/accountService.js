const axios = require('axios');

const ACCOUNTS_SERVICE_URL = process.env.ACCOUNTS_SERVICE_URL || 'http://localhost:3004';

/**
 * Get account by ID from accounts-service
 * @param {string} accountId - Account identifier (numeroCompte or accountId)
 * @returns {Promise<Object|null>} Account object or null if not found
 */
async function getAccount(accountId) {
  try {
    // Try direct lookup first (by UUID or numeroCompte)
    const directResponse = await axios.get(`${ACCOUNTS_SERVICE_URL}/api/comptes/${accountId}`, {
      timeout: 5000,
      validateStatus: (status) => status < 500 // Don't throw on 404
    });

    if (directResponse.status === 200 && directResponse.data) {
      return mapAccountFromAccountsService(directResponse.data);
    }

    // If direct lookup fails, search all accounts
    console.log(`[AccountService] Direct lookup failed for ${accountId}, searching all accounts...`);

    const allAccountsResponse = await axios.get(`${ACCOUNTS_SERVICE_URL}/api/comptes`, {
      timeout: 5000,
      validateStatus: (status) => status < 500
    });

    if (allAccountsResponse.status === 200 && allAccountsResponse.data && allAccountsResponse.data.data) {
      const accounts = allAccountsResponse.data.data;

      // Search for account by numeroCompte, _id, or any matching field
      const foundAccount = accounts.find(acc =>
        acc._id === accountId ||
        acc.numeroCompte === accountId ||
        acc.accountId === accountId
      );

      if (foundAccount) {
        console.log(`[AccountService] Found account ${accountId} via search`);
        return mapAccountFromAccountsService(foundAccount);
      }
    }

    // Not found in accounts-service, try local fallback
    console.warn(`[AccountService] Account ${accountId} not found in accounts-service, trying local DB...`);

    try {
      const Account = require('../models/account');
      const localAccount = await Account.findOne({ accountId });
      if (localAccount) {
        console.warn(`[AccountService] Using local account as fallback for ${accountId}`);
        return localAccount;
      }
    } catch (localError) {
      // Ignore local fallback errors
    }

    return null; // Account not found anywhere

  } catch (error) {
    console.error(`[AccountService] Error fetching account ${accountId}:`, error.message);

    // Last resort: try local database
    try {
      const Account = require('../models/account');
      const localAccount = await Account.findOne({ accountId });
      if (localAccount) {
        console.warn(`[AccountService] Using local account as fallback for ${accountId}`);
        return localAccount;
      }
    } catch (localError) {
      // Ignore
    }

    return null;
  }
}

/**
 * Update account balance via accounts-service API
 * @param {string} accountId - Account identifier
 * @param {number} amount - Amount to update
 * @param {string} operation - 'debit' or 'credit'
 * @returns {Promise\u003cObject\u003e} Updated account
 */
async function updateAccountBalance(accountId, amount, operation = 'debit') {
  try {
    // Get current account to get the UUID
    const account = await getAccount(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    // Get the actual UUID from the account (might be in _original)
    const accountUuid = account._original?._id || account.accountId;

    console.log(`[AccountService] Updating balance for ${accountId} (UUID: ${accountUuid}), operation: ${operation}, amount: ${amount}`);

    // Use mouvements API instead of PUT
    // This endpoint is specifically designed for balance updates
    const endpoint = operation === 'debit'
      ? `${ACCOUNTS_SERVICE_URL}/api/mouvements/debit/${accountUuid}`
      : `${ACCOUNTS_SERVICE_URL}/api/mouvements/credit/${accountUuid}`;

    const response = await axios.post(
      endpoint,
      {
        montant: amount,
        description: `Transaction ${operation} via transactions-service`,
        reference: `TXN_${Date.now()}`
      },
      {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 201 && response.data.success) {
      console.log(`[AccountService] Balance updated successfully via mouvements API`);
      // Return the updated account info
      return await getAccount(accountId);
    }

    throw new Error('Failed to update account balance via mouvements API');
  } catch (error) {
    console.error(`[AccountService] Error updating balance:`, error.message);
    if (error.response) {
      throw new Error(`Account service error: ${error.response.data?.error || error.response.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Map account from accounts-service format to transactions-service format
 * @param {Object} accountFromService - Account from accounts-service
 * @returns {Object} Account in transactions-service format
 */
function mapAccountFromAccountsService(accountFromService) {
  // accounts-service uses: numeroCompte, solde, typeCompte, clientId, estActif
  // transactions-service expects: accountId, balance, currency, status, owner

  return {
    accountId: accountFromService.numeroCompte || accountFromService._id || accountFromService.accountId,
    balance: accountFromService.solde || accountFromService.balance || 0,
    currency: accountFromService.devise || accountFromService.currency || 'TND',
    status: accountFromService.estActif ? 'active' : (accountFromService.status || 'inactive'),
    owner: accountFromService.clientId || accountFromService.owner || 'Unknown',
    typeCompte: accountFromService.typeCompte,
    // Keep original data for reference
    _original: accountFromService
  };
}

/**
 * Check if account exists and is active
 * @param {string} accountId - Account identifier
 * @returns {Promise<boolean>} True if account exists and is active
 */
async function isAccountActive(accountId) {
  try {
    const account = await getAccount(accountId);
    return account && (account.status === 'active' || account.estActif === true);
  } catch (error) {
    console.error(`[AccountService] Error checking account status for ${accountId}:`, error.message);
    return false;
  }
}

/**
 * Get account balance
 * @param {string} accountId - Account identifier
 * @returns {Promise<number>} Account balance
 */
async function getAccountBalance(accountId) {
  try {
    const account = await getAccount(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }
    return account.solde || account.balance || 0;
  } catch (error) {
    throw new Error(`Failed to get account balance: ${error.message}`);
  }
}

module.exports = {
  getAccount,
  updateAccountBalance,
  isAccountActive,
  getAccountBalance,
  mapAccountFromAccountsService
};

