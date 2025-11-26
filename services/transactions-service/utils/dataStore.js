const fs = require('fs');
const path = require('path');

const TRANSACTIONS_FILE = path.join(__dirname, '../data/transactions.json');
const ACCOUNTS_FILE = path.join(__dirname, '../data/accounts.json');

class DataStore {
    constructor() {
        this.transactions = [];
        this.accounts = [];
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            if (fs.existsSync(TRANSACTIONS_FILE)) {
                const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
                this.transactions = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.transactions = [];
        }

        try {
            if (fs.existsSync(ACCOUNTS_FILE)) {
                const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
                this.accounts = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
            this.accounts = [];
        }

        this.initialized = true;
        console.log(`DataStore initialized. Loaded ${this.transactions.length} transactions and ${this.accounts.length} accounts.`);
    }

    getTransactions() {
        return this.transactions;
    }

    getAccounts() {
        return this.accounts;
    }

    findTransactionById(id) {
        return this.transactions.find(t => t.transactionId === id);
    }

    findAccountById(id) {
        return this.accounts.find(a => a.accountId === id);
    }

    saveTransaction(transaction) {
        const index = this.transactions.findIndex(t => t.transactionId === transaction.transactionId);
        if (index >= 0) {
            this.transactions[index] = transaction;
        } else {
            this.transactions.push(transaction);
        }
        this.persistTransactions();
    }

    saveAccount(account) {
        const index = this.accounts.findIndex(a => a.accountId === account.accountId);
        if (index >= 0) {
            this.accounts[index] = account;
        } else {
            this.accounts.push(account);
        }
        this.persistAccounts();
    }

    deleteTransaction(transactionId) {
        const index = this.transactions.findIndex(t => t.transactionId === transactionId);
        if (index >= 0) {
            this.transactions.splice(index, 1);
            this.persistTransactions();
            return true;
        }
        return false;
    }

    persistTransactions() {
        try {
            fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(this.transactions, null, 2));
        } catch (error) {
            console.error('Error saving transactions:', error);
        }
    }

    persistAccounts() {
        try {
            fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(this.accounts, null, 2));
        } catch (error) {
            console.error('Error saving accounts:', error);
        }
    }
}

const store = new DataStore();
// Initialize immediately when module is loaded (synchronous load is okay at startup)
store.init();

module.exports = store;
