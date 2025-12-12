require('dotenv').config();
const mongoose = require('mongoose');
const Account = require('./models/account');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/transaction-service';

async function addAccounts() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const accounts = [
            {
                accountId: 'ACC_123',
                balance: 5500.0,
                currency: 'TND',
                status: 'active',
                owner: 'User1',
                accountType: 'checking',
                customLimits: { dailyWithdrawal: 8000, dailyTransfer: 15000, singleTransaction: 2000 },
            },
            {
                accountId: 'ACC_456',
                balance: 3000.0,
                currency: 'TND',
                status: 'active',
                owner: 'User2',
                accountType: 'savings'
            },
            {
                accountId: 'EXT_999',
                balance: 1_000_000.0,
                currency: 'TND',
                status: 'active',
                owner: 'External Bank',
                accountType: 'checking'
            },
        ];

        for (const acc of accounts) {
            const exists = await Account.findOne({ accountId: acc.accountId });
            if (exists) {
                console.log(`✓ Account ${acc.accountId} already exists`);
            } else {
                await Account.create(acc);
                console.log(`✓ Created account ${acc.accountId}`);
            }
        }

        console.log('\n✅ All accounts ready!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addAccounts();
