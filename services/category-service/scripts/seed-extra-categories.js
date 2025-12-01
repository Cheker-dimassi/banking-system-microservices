const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/category-service';

const extraCategories = [
  { name: 'Travel', description: 'Flights, hotels, transport', type: 'expense', color: '#0EA5E9', icon: '✈️' },
  { name: 'Utilities', description: 'Electricity, water, internet', type: 'expense', color: '#F97316', icon: '💡' },
  { name: 'Charity', description: 'Donations and charity', type: 'expense', color: '#EC4899', icon: '🤝' },
  { name: 'Side Hustle', description: 'Freelance or side projects', type: 'income', color: '#22C55E', icon: '🛠️' },
  { name: 'Crypto', description: 'Crypto investments', type: 'income', color: '#8B5CF6', icon: '🪙' },
  { name: 'Kids', description: 'Kids expenses and allowances', type: 'expense', color: '#F43F5E', icon: '🧸' },
  { name: 'Subscriptions', description: 'Streaming and subscription services', type: 'expense', color: '#A855F7', icon: '📺' }
];

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const cat of extraCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`✅ Created category: ${cat.name}`);
        created++;
      } else {
        console.log(`⏭️  Skipped (exists): ${cat.name}`);
        skipped++;
      }
    }

    console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
  } catch (error) {
    console.error('❌ Error seeding extra categories:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();

