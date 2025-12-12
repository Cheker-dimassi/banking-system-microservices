import 'dotenv/config';
import mongoose from 'mongoose';
import { CompteBancaire } from '../models/CompteBancaire';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/transaction-service';

const seedAccounts = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');
        console.log('CompteBancaire model:', CompteBancaire);

        const accounts = [
            {
                numeroCompte: 'ACC_123',
                typeCompte: 'COURANT',
                solde: 5500.00,
                devise: 'TND',
                clientId: 'User1',
                email: 'user1@example.com',
                estActif: true
            },
            {
                numeroCompte: 'ACC_456',
                typeCompte: 'EPARGNE',
                solde: 3000.00,
                devise: 'TND',
                clientId: 'User2',
                email: 'user2@example.com',
                estActif: true
            },
            {
                numeroCompte: 'EXT_999',
                typeCompte: 'COURANT',
                solde: 1000000.00,
                devise: 'TND',
                clientId: 'External Bank',
                email: 'bank@external.com',
                estActif: true
            }
        ];

        for (const acc of accounts) {
            const exists = await CompteBancaire.findOne({ numeroCompte: acc.numeroCompte });
            if (!exists) {
                await CompteBancaire.create(acc);
                console.log(`+ Created account ${acc.numeroCompte}`);
            } else {
                console.log(`= Account ${acc.numeroCompte} already exists`);
            }
        }

        console.log('✓ Seeding complete');
        process.exit(0);
    } catch (error: any) {
        console.error('✗ Seeding failed:', error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        process.exit(1);
    }
};

seedAccounts();
