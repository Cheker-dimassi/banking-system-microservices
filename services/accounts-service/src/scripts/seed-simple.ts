import 'dotenv/config';
import mongoose, { Schema } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/transaction-service';

const seedSimple = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const simpleSchema = new Schema({
            numeroCompte: String,
            solde: Number
        });

        // Check if model exists before compiling
        const SimpleModel = mongoose.models.SimpleAccount || mongoose.model('SimpleAccount', simpleSchema);

        await SimpleModel.create({ numeroCompte: 'TEST_123', solde: 100 });
        console.log('✓ Created simple account');

        process.exit(0);
    } catch (error: any) {
        console.error('✗ Seeding failed:', error);
        process.exit(1);
    }
};

seedSimple();
