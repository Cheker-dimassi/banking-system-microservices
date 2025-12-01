import mongoose from 'mongoose';

const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/servicebank';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongodbUri);
    console.log('✓ Connecté à MongoDB');
  } catch (error) {
    console.error('✗ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✓ Déconnecté de MongoDB');
  } catch (error) {
    console.error('✗ Erreur de déconnexion MongoDB:', error);
  }
};

export default mongoose;
