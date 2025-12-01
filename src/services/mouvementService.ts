import { MouvementCompte } from '../models/MouvementCompte';
import { CreateMouvementInput, PaginationInput } from '../middleware/validation';
import { IMouvementCompte, PaginatedResponse } from '../types';
import { v4 as uuidv4, validate as isUuid } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import compteService from './compteService';

export class MouvementService {
  /**
   * Créer un mouvement (débit ou crédit)
   */
  async createMouvement(data: CreateMouvementInput): Promise<IMouvementCompte> {
    // Validations de base
    if (!isUuid(data.compteId)) {
      throw new AppError(400, 'compteId doit être un UUID valide');
    }
    if (data.referenceTransaction && !isUuid(data.referenceTransaction)) {
      throw new AppError(400, 'referenceTransaction doit être un UUID valide');
    }
    if (typeof data.montant !== 'number' || data.montant <= 0) {
      throw new AppError(400, 'Le montant doit être un nombre strictement supérieur à 0');
    }

    // Vérifier que le compte existe
    const compte = await compteService.getCompteById(data.compteId);
    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    // Calculer le nouveau solde
    const nouveauSolde =
      data.typeMouvement === 'CREDIT'
        ? compte.solde + data.montant
        : compte.solde - data.montant;

    // Vérifier qu'on ne va pas en découvert pour un débit
    if (nouveauSolde < 0) {
      throw new AppError(400, 'Solde insuffisant');
    }

    // Créer le mouvement
    const mouvement = new MouvementCompte({
      _id: uuidv4(),
      compteId: data.compteId,
      typeMouvement: data.typeMouvement,
      montant: data.montant,
      soldeApresMouvement: nouveauSolde,
      description: data.description,
      referenceTransaction: data.referenceTransaction || uuidv4(),
      dateMouvement: new Date(),
    });

    // Sauvegarder le mouvement
    await mouvement.save();

    // Mettre à jour le solde du compte (et dateModification)
    const compteMaj = await compteService.updateSolde(data.compteId, nouveauSolde);

    return mouvement;
  }

  /**
   * Récupérer un mouvement par ID
   */
  async getMouvementById(id: string): Promise<IMouvementCompte> {
    const mouvement = await MouvementCompte.findById(id);
    if (!mouvement) {
      throw new AppError(404, 'Mouvement non trouvé');
    }
    return mouvement;
  }

  /**
   * Lister tous les mouvements avec pagination
   */
  async getAllMouvements(
    pagination: PaginationInput
  ): Promise<PaginatedResponse<IMouvementCompte>> {
    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      MouvementCompte.find()
        .skip(skip)
        .limit(pagination.limit)
        .sort({ dateMouvement: -1 }),
      MouvementCompte.countDocuments(),
    ]);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  /**
   * Récupérer les mouvements d'un compte
   */
  async getMouvementsByCompteId(
    compteId: string,
    pagination: PaginationInput
  ): Promise<PaginatedResponse<IMouvementCompte>> {
    // Vérifier que le compte existe
    await compteService.getCompteById(compteId);

    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      MouvementCompte.find({ compteId })
        .skip(skip)
        .limit(pagination.limit)
        .sort({ dateMouvement: -1 }),
      MouvementCompte.countDocuments({ compteId }),
    ]);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  /**
   * Récupérer les mouvements par référence de transaction
   */
  async getMouvementsByReference(
    reference: string
  ): Promise<IMouvementCompte[]> {
    return await MouvementCompte.find({ referenceTransaction: reference }).sort({
      dateMouvement: -1,
    });
  }

  /**
   * Crédite un compte : crée un mouvement CREDIT et met à jour le solde
   */
  async crediterCompte(
    compteId: string,
    montant: number,
    description: string,
    referenceTransaction?: string
  ): Promise<IMouvementCompte> {
    const payload: CreateMouvementInput = {
      compteId,
      typeMouvement: 'CREDIT',
      montant,
      description,
      referenceTransaction,
    } as CreateMouvementInput;

    return await this.createMouvement(payload);
  }

  /**
   * Débite un compte : crée un mouvement DEBIT après validation du solde
   */
  async debiterCompte(
    compteId: string,
    montant: number,
    description: string,
    referenceTransaction?: string
  ): Promise<IMouvementCompte> {
    const payload: CreateMouvementInput = {
      compteId,
      typeMouvement: 'DEBIT',
      montant,
      description,
      referenceTransaction,
    } as CreateMouvementInput;

    return await this.createMouvement(payload);
  }

  /**
   * Récupérer tous les mouvements d'un compte (non paginés)
   */
  async getMouvementsByCompte(compteId: string): Promise<IMouvementCompte[]> {
    // Vérifier que le compte existe
    await compteService.getCompteById(compteId);
    return await MouvementCompte.find({ compteId }).sort({ dateMouvement: -1 });
  }

  /**
   * Récupérer un mouvement par référence de transaction (premier trouvé)
   */
  async getMouvementByReference(reference: string): Promise<IMouvementCompte | null> {
    return await MouvementCompte.findOne({ referenceTransaction: reference });
  }

  // Mise à jour d'un mouvement existant (montant et/ou description)
  async updateMouvement(
    id: string,
    updates: Partial<Pick<IMouvementCompte, 'montant' | 'description'>>
  ): Promise<IMouvementCompte> {
    const mouvement = await MouvementCompte.findById(id);
    if (!mouvement) {
      throw new AppError(404, 'Mouvement non trouvé');
    }

    const compte = await compteService.getCompteById(mouvement.compteId);
    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    // Recalcul du solde si montant change
    if (typeof updates.montant === 'number') {
      if (updates.montant <= 0) {
        throw new AppError(400, 'Le montant doit être strictement positif');
      }
      const ajustement =
        mouvement.typeMouvement === 'CREDIT'
          ? updates.montant - mouvement.montant
          : mouvement.montant - updates.montant;
      const nouveauSolde = compte.solde + ajustement;
      if (nouveauSolde < 0) {
        throw new AppError(400, 'Solde insuffisant après mise à jour');
      }
      await compteService.updateSolde(compte._id, nouveauSolde);
      mouvement.soldeApresMouvement = nouveauSolde;
      mouvement.montant = updates.montant;
    }

    if (typeof updates.description === 'string') {
      mouvement.description = updates.description;
    }

    await mouvement.save();

    // Email disabled - SMS alert to be added here
    // try {
    //   if (!compte.email) {
    //     console.warn('Compte sans email, notification non envoyée');
    //   }
    // } catch (err) {
    //   console.error('Erreur envoi notification:', err);
    // }

    return mouvement as IMouvementCompte;
  }

  // Suppression d'un mouvement
  async deleteMouvement(id: string): Promise<void> {
    const mouvement = await MouvementCompte.findById(id);
    if (!mouvement) {
      throw new AppError(404, 'Mouvement non trouvé');
    }

    const compte = await compteService.getCompteById(mouvement.compteId);
    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    // Annule l'effet du mouvement sur le solde
    const nouveauSolde =
      mouvement.typeMouvement === 'CREDIT'
        ? compte.solde - mouvement.montant
        : compte.solde + mouvement.montant;
    if (nouveauSolde < 0) {
      throw new AppError(400, 'Suppression invalide: solde deviendrait négatif');
    }
    await compteService.updateSolde(compte._id, nouveauSolde);

    await MouvementCompte.findByIdAndDelete(id);

    // Email disabled - SMS alert to be added here
    // try {
    //   if (!compte.email) {
    //     console.warn('Compte sans email, notification non envoyée');
    //   }
    // } catch (err) {
    //   console.error('Erreur envoi notification:', err);
    // }
  }
}

export default new MouvementService();
