import { z } from 'zod';

export const CreateCompteSchema = z.object({
  typeCompte: z.enum(['COURANT', 'EPARGNE']),
  clientId: z.string().min(1, 'clientId est requis'),
  solde: z.number().min(0, 'Le solde ne peut pas être négatif').optional().default(0),
  devise: z.string().optional().default('EUR'),
  email: z.string().trim().toLowerCase().email('Email invalide'),
});

export const UpdateCompteSchema = z.object({
  typeCompte: z.enum(['COURANT', 'EPARGNE']).optional(),
  clientId: z.string().min(1, 'clientId est requis').optional(),
  solde: z.number().min(0).optional(),
  devise: z.string().optional(),
  estActif: z.boolean().optional(),
  email: z.string().trim().toLowerCase().email('Email invalide').optional(),
});

export const CreateMouvementSchema = z.object({
  compteId: z.string().min(1, 'compteId est requis'),
  typeMouvement: z.enum(['CREDIT', 'DEBIT']),
  montant: z.number().min(0.01, 'Le montant doit être positif'),
  description: z.string().min(1, 'Description requise'),
  referenceTransaction: z.string().optional(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export type CreateCompteInput = z.infer<typeof CreateCompteSchema>;
export type UpdateCompteInput = z.infer<typeof UpdateCompteSchema>;
export type CreateMouvementInput = z.infer<typeof CreateMouvementSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
