import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IMouvementCompte } from '../types';

const mouvementCompteSchema = new Schema<IMouvementCompte>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    compteId: {
      type: String,
      required: true,
      index: true,
    },
    typeMouvement: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true,
    },
    montant: {
      type: Number,
      required: true,
      min: 0,
    },
    soldeApresMouvement: {
      type: Number,
      required: true,
    },
    dateMouvement: {
      type: Date,
      default: () => new Date(),
    },
    description: {
      type: String,
      required: true,
    },
    referenceTransaction: {
      type: String,
      sparse: true,
      index: true,
    },
  },
  {
    _id: false,
    timestamps: false,
  }
);

export const MouvementCompte = mongoose.model<IMouvementCompte>(
  'MouvementCompte',
  mouvementCompteSchema
);

export default MouvementCompte;
