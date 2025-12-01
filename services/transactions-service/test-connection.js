const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/transaction-service';

console.log('Testing MongoDB connection...');
console.log('Connection string:', MONGODB_URI);
console.log('');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Successfully connected to MongoDB!');
    console.log('');
    
    // Check if database exists
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Check accounts
    const Account = require('./models/account');
    const accountCount = await Account.countDocuments();
    console.log('');
    console.log('👤 Accounts in database:', accountCount);
    
    if (accountCount > 0) {
      const accounts = await Account.find({});
      accounts.forEach(acc => {
        console.log(`   - ${acc.accountId}: ${acc.balance} ${acc.currency} (${acc.status})`);
      });
    }
    
    console.log('');
    console.log('✨ Connection test successful!');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed!');
    console.error('Error:', err.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Check if port 27017 is correct');
    console.log('   3. Try: net start MongoDB (Windows)');
    console.log('   4. Or: mongod --dbpath "C:\\data\\db"');
    process.exit(1);
  });

