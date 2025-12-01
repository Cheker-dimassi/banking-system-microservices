const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/category-service';

const defaultCategories = [
    // Income categories
    { name: 'Salary', description: 'Monthly salary income', type: 'income', color: '#10B981', icon: '💰', isDefault: true },
    { name: 'Freelance', description: 'Freelance work income', type: 'income', color: '#3B82F6', icon: '💼', isDefault: true },
    { name: 'Investment', description: 'Investment returns', type: 'income', color: '#8B5CF6', icon: '📈', isDefault: true },
    { name: 'Gift', description: 'Gifts received', type: 'income', color: '#F59E0B', icon: '🎁', isDefault: true },
    
    // Expense categories
    { name: 'Food', description: 'Food and groceries', type: 'expense', color: '#EF4444', icon: '🍔', isDefault: true },
    { name: 'Transport', description: 'Transportation costs', type: 'expense', color: '#06B6D4', icon: '🚗', isDefault: true },
    { name: 'Bills', description: 'Utility bills', type: 'expense', color: '#F97316', icon: '💡', isDefault: true },
    { name: 'Shopping', description: 'Shopping expenses', type: 'expense', color: '#EC4899', icon: '🛍️', isDefault: true },
    { name: 'Entertainment', description: 'Entertainment expenses', type: 'expense', color: '#A855F7', icon: '🎬', isDefault: true },
    { name: 'Healthcare', description: 'Medical expenses', type: 'expense', color: '#14B8A6', icon: '🏥', isDefault: true },
    { name: 'Education', description: 'Education expenses', type: 'expense', color: '#6366F1', icon: '📚', isDefault: true },
    
    // Transfer categories
    { name: 'Savings', description: 'Savings transfer', type: 'transfer', color: '#059669', icon: '💾', isDefault: true },
    { name: 'Loan Payment', description: 'Loan repayment', type: 'transfer', color: '#DC2626', icon: '📋', isDefault: true },
    
    // Other
    { name: 'Other', description: 'Other transactions', type: 'other', color: '#6B7280', icon: '📁', isDefault: true }
];

async function seedCategories() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        let created = 0;
        let skipped = 0;

        for (const catData of defaultCategories) {
            try {
                const exists = await Category.findOne({ name: catData.name });
                if (!exists) {
                    const newCategory = new Category(catData);
                    await newCategory.save();
                    created++;
                    console.log(`✅ Created category: ${catData.name}`);
                } else {
                    skipped++;
                    console.log(`⏭️  Skipped (exists): ${catData.name}`);
                }
            } catch (err) {
                console.error(`❌ Error creating ${catData.name}:`, err.message);
            }
        }

        console.log(`\n✅ Seeding complete!`);
        console.log(`   Created: ${created}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Total: ${defaultCategories.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedCategories();

