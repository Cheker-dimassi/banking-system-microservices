import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ICompteBancaire } from '../types';

const compteBancaireSchema = new Schema<ICompteBancaire>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    numeroCompte: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    typeCompte: {
      type: String,
      enum: ['COURANT', 'EPARGNE'],
      required: true,
    },
    solde: {
      type: Number,
      required: true,
      default: 0,
    },
    devise: {
      type: String,
      default: 'EUR',
    },
    dateCreation: {
      type: Date,
      default: () => new Date(),
    },
    dateModification: {
      type: Date,
      default: () => new Date(),
    },
    clientId: {
      type: String,
      required: true,
      index: true,
    },
    estActif: {
      type: Boolean,
      default: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide'],
      index: true,
    },
    estGele: {
      type: Boolean,
      default: false,
      index: true,
    },
    raison_gel: {
      type: String,
      default: null,
    },
    limiteMoyenne: {
      type: Number,
      default: null,
    },
    listeBlanche: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
    timestamps: false,
  }
);

// Middleware pour mettre à jour dateModification
compteBancaireSchema.pre('save', function (next: any) {
  this.dateModification = new Date();
  next();
});

export const CompteBancaire = mongoose.model<ICompteBancaire>(
  'CompteBancaire',
  compteBancaireSchema
);

export default CompteBancaire;
