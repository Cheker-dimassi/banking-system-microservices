const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/transaction-service';

async function deleteAutomationRulesCollection() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        // Check if AutomationRule collection exists
        const automationRuleCollection = collections.find(
            col => col.name === 'automationrules' || col.name === 'automation_rules'
        );

        if (automationRuleCollection) {
            console.log(`🗑️  Found collection: ${automationRuleCollection.name}`);
            await db.collection(automationRuleCollection.name).drop();
            console.log(`✅ Successfully deleted collection: ${automationRuleCollection.name}`);
        } else {
            console.log('ℹ️  No AutomationRule collection found. It may have already been deleted.');
        }

        // Also try to delete using mongoose model name
        try {
            const AutomationRule = mongoose.model('AutomationRule');
            await AutomationRule.collection.drop();
            console.log('✅ Also deleted via mongoose model');
        } catch (err) {
            // Model might not exist, that's okay
            if (err.message.includes('ns not found')) {
                console.log('ℹ️  Collection already deleted or never existed');
            } else {
                console.log('ℹ️  Model not found (expected after code removal)');
            }
        }

        console.log('✅ Cleanup complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

deleteAutomationRulesCollection();

