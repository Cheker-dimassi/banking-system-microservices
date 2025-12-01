require('dotenv').config();
const mongoose = require('mongoose');

// Adjust paths because this script lives in services/transactions-service
const Account = require('./models/account');
const Category = require('../category-service/models/category');
const Budget = require('./models/budget');
const Transaction = require('./models/transaction');
const AutomationRule = require('./models/automationRule');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/transaction-service';

async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // -------------------- Accounts --------------------
    const accounts = [
        {
            accountId: 'ACC_123',
            balance: 5500.0,
            currency: 'TND',
            status: 'active',
            owner: 'User1',
            customLimits: { dailyWithdrawal: 8000, dailyTransfer: 15000, singleTransaction: 2000 },
        },
        { accountId: 'ACC_456', balance: 3000.0, currency: 'TND', status: 'active', owner: 'User2' },
        { accountId: 'EXT_999', balance: 1_000_000.0, currency: 'TND', status: 'active', owner: 'External Bank' },
    ];
    for (const acc of accounts) {
        const exists = await Account.findOne({ accountId: acc.accountId });
        if (!exists) await Account.create(acc);
    }
    console.log('🔹 Accounts seeded');

    // -------------------- Categories --------------------
    const categories = [
        { name: 'Salary', type: 'income', color: '#4CAF50', icon: 'attach_money', description: 'Monthly salary payments' },
        { name: 'Groceries', type: 'expense', color: '#FF9800', icon: 'shopping_cart', description: 'Food & grocery purchases' },
        { name: 'Rent', type: 'expense', color: '#F44336', icon: 'home', description: 'Monthly house rent' },
        { name: 'Entertainment', type: 'expense', color: '#9C27B0', icon: 'movie', description: 'Movies, concerts, streaming' },
        { name: 'Investment', type: 'income', color: '#2196F3', icon: 'trending_up', description: 'Dividends & investment returns' },
    ];
    for (const cat of categories) {
        const exists = await Category.findOne({ name: cat.name, type: cat.type });
        if (!exists) await Category.create(cat);
    }
    console.log('🔹 Categories seeded');

    // -------------------- Budgets --------------------
    const groceriesCat = await Category.findOne({ name: 'Groceries' });
    const entertainmentCat = await Category.findOne({ name: 'Entertainment' });
    const rentCat = await Category.findOne({ name: 'Rent' });

    const budgets = [
        {
            accountId: 'ACC_123',
            name: 'Monthly Groceries',
            amount: 400,
            period: 'monthly',
            categoryId: groceriesCat ? groceriesCat.categoryId : null,
            description: 'Limit for grocery spending each month',
        },
        {
            accountId: 'ACC_123',
            name: 'Monthly Entertainment',
            amount: 150,
            period: 'monthly',
            categoryId: entertainmentCat ? entertainmentCat.categoryId : null,
        },
        {
            accountId: 'ACC_456',
            name: 'Yearly Rent',
            amount: 12000,
            period: 'yearly',
            categoryId: rentCat ? rentCat.categoryId : null,
        },
        {
            accountId: 'ACC_123',
            name: 'Emergency Savings',
            amount: 2000,
            period: 'monthly',
            description: 'Set aside for emergencies',
        },
    ];
    for (const bud of budgets) {
        const exists = await Budget.findOne({ accountId: bud.accountId, name: bud.name });
        if (!exists) await Budget.create(bud);
    }
    console.log('🔹 Budgets seeded');

    // -------------------- Automation Rules --------------------
    const automationRules = [
        {
            accountId: 'ACC_123',
            name: 'Auto‑Save 10 % of Deposits',
            description: 'Save 10 % of each deposit into ACC_456',
            type: 'save_percentage',
            trigger: 'on_deposit',
            action: { targetAccount: 'ACC_456', percentage: 10 },
        },
        {
            accountId: 'ACC_123',
            name: 'Round‑Up Savings',
            description: 'Round up withdrawals to nearest 10 TND and save the diff',
            type: 'round_up',
            trigger: 'on_withdrawal',
            action: { targetAccount: 'ACC_456', roundUpTo: 10 },
            limits: { maxPerTransaction: 10, maxPerDay: 50 },
        },
        {
            accountId: 'ACC_123',
            name: 'Salary Day Transfer',
            description: 'When salary arrives, move 500 TND to savings',
            type: 'fixed_transfer',
            trigger: 'on_salary',
            conditions: { minAmount: 2000, descriptionContains: 'salary' },
            action: { targetAccount: 'ACC_456', fixedAmount: 500 },
        },
        {
            accountId: 'ACC_123',
            name: 'Gift Transfer',
            description: 'If a deposit contains “gift”, move 100 TND to ACC_456',
            type: 'conditional_transfer',
            trigger: 'on_deposit',
            conditions: { descriptionContains: 'gift' },
            action: { targetAccount: 'ACC_456', fixedAmount: 100 },
        },
        {
            accountId: 'ACC_123',
            name: 'Auto‑Invest 5 %',
            description: 'Invest 5 % of each internal transfer into ACC_456',
            type: 'auto_invest',
            trigger: 'on_transfer_in',
            action: { targetAccount: 'ACC_456', percentage: 5 },
        },
    ];
    for (const rule of automationRules) {
        const exists = await AutomationRule.findOne({ accountId: rule.accountId, name: rule.name });
        if (!exists) await AutomationRule.create(rule);
    }
    console.log('🔹 Automation rules seeded');

    // -------------------- Transactions --------------------
    const sampleTxns = [
        { type: 'deposit', toAccount: 'ACC_123', amount: 1200, description: 'Monthly salary' },
        { type: 'withdrawal', fromAccount: 'ACC_123', amount: 73, description: 'Grocery shopping' },
        { type: 'internal_transfer', fromAccount: 'ACC_123', toAccount: 'ACC_456', amount: 300, description: 'Transfer to savings' },
        { type: 'deposit', toAccount: 'ACC_123', amount: 250, description: 'Birthday gift' },
        { type: 'interbank_transfer', fromAccount: 'ACC_123', toAccount: 'EXT_999', amount: 1500, description: 'Pay supplier' },
    ];
    for (const tx of sampleTxns) {
        const exists = await Transaction.findOne({ type: tx.type, amount: tx.amount, description: tx.description });
        if (!exists) await Transaction.create(tx);
    }
    console.log('🔹 Transactions seeded');

    await mongoose.disconnect();
    console.log('✅ Seed complete');
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
