const mongoose = require('mongoose');
const Account = require('./models/account');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/transaction-service';

const initialAccounts = [
    {
        accountId: "ACC_123",
        balance: 5000.00,
        currency: "TND",
        status: "active",
        owner: "User1"
    },
    {
        accountId: "ACC_456",
        balance: 3000.00,
        currency: "TND",
        status: "active",
        owner: "User2"
    },
    {
        accountId: "EXT_999",
        balance: 1000000.00,
        currency: "TND",
        status: "active",
        owner: "External Bank"
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing accounts to avoid duplicates
        await Account.deleteMany({});
        console.log('🧹 Cleared existing accounts');

        // Insert new accounts
        await Account.insertMany(initialAccounts);
        console.log('🌱 Seeded accounts successfully');

        console.log('Accounts created:');
        initialAccounts.forEach(acc => {
            console.log(`- ${acc.accountId} (${acc.owner}): ${acc.balance} ${acc.currency}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
