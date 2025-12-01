import { CompteBancaire } from '../models/CompteBancaire';
import { CreateCompteInput, UpdateCompteInput, PaginationInput } from '../middleware/validation';
import { ICompteBancaire, PaginatedResponse } from '../types';
import { v4 as uuidv4, validate as isUuid } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import { MouvementCompte } from '../models/MouvementCompte';

export class CompteService {
  /**
   * Génère un numéro de compte au format IBAN
   */
  private generateNumeroCompte(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 15);
    return `FR76${timestamp}${random}`.substring(0, 27);
  }

  /**
   * Créer un nouveau compte
   */
  async createCompte(data: CreateCompteInput): Promise<ICompteBancaire> {
    // Validation clientId UUID
    if (!isUuid(data.clientId)) {
      throw new AppError(400, 'clientId doit être un UUID valide');
    }

    // Générer un numero de compte unique (éviter doublons)
    let numeroCompte = this.generateNumeroCompte();
    // Assurer l'unicité en base
    while (await CompteBancaire.findOne({ numeroCompte })) {
      numeroCompte = this.generateNumeroCompte();
    }

    const nouveau = new CompteBancaire({
      _id: uuidv4(),
      numeroCompte,
      typeCompte: data.typeCompte,
      clientId: data.clientId,
      solde: data.solde || 0,
      devise: data.devise || 'EUR',
      estActif: true,
      email: data.email,
      dateCreation: new Date(),
      dateModification: new Date(),
    });

    return await nouveau.save();
  }

  /**
   * Récupérer un compte par ID
   */
  async getCompteById(id: string): Promise<ICompteBancaire | null> {
    const compte = await CompteBancaire.findById(id);
    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }
    return compte;
  }

  /**
   * Lister tous les comptes avec pagination
   */
  async getAllComptes(
    pagination: PaginationInput
  ): Promise<PaginatedResponse<ICompteBancaire>> {
    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      CompteBancaire.find({ estActif: true })
        .skip(skip)
        .limit(pagination.limit)
        .sort({ dateCreation: -1 }),
      CompteBancaire.countDocuments({ estActif: true }),
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
   * Récupérer les comptes d'un client
   */
  async getComptesByClientId(
    clientId: string,
    pagination: PaginationInput
  ): Promise<PaginatedResponse<ICompteBancaire>> {
    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      CompteBancaire.find({ clientId, estActif: true })
        .skip(skip)
        .limit(pagination.limit),
      CompteBancaire.countDocuments({ clientId, estActif: true }),
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
   * Mettre à jour un compte
   */
  async updateCompte(
    id: string,
    data: UpdateCompteInput
  ): Promise<ICompteBancaire> {
    // Validate id and clientId (if provided)
    if (!isUuid(id)) {
      throw new AppError(400, 'ID du compte invalide');
    }
    if (data.clientId && !isUuid(data.clientId)) {
      throw new AppError(400, 'clientId doit être un UUID valide');
    }

    console.log('DEBUG updateCompte - Input ID:', id);
    console.log('DEBUG updateCompte - Input data:', data);

    const compte = await CompteBancaire.findByIdAndUpdate(
      id,
      {
        ...data,
        dateModification: new Date(),
      },
      { new: true, runValidators: true }
    );

    console.log('DEBUG updateCompte - Result after update:', compte);

    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    return compte;
  }

  /**
   * Soft delete - désactiver un compte
   */
  async deleteCompte(id: string): Promise<void> {
    if (!isUuid(id)) {
      throw new AppError(400, 'ID du compte invalide');
    }

    const compte = await CompteBancaire.findByIdAndUpdate(
      id,
      {
        estActif: false,
        dateModification: new Date(),
      },
      { new: true }
    );

    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }
  }

  /**
   * Mettre à jour le solde d'un compte
   */
  async updateSolde(id: string, nouveauSolde: number): Promise<ICompteBancaire> {
    const compte = await CompteBancaire.findByIdAndUpdate(
      id,
      {
        solde: nouveauSolde,
        dateModification: new Date(),
      },
      { new: true }
    );

    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    return compte;
  }

  /**
   * Audit complet d'un compte : retourne le compte, ses mouvements et métadonnées
   */
  async auditerCompte(compteId: string) {
    if (!isUuid(compteId)) {
      throw new AppError(400, 'ID du compte invalide');
    }

    // Récupérer le compte
    const compte = await CompteBancaire.findById(compteId);
    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    // Récupérer tous les mouvements associés
    const mouvements = await MouvementCompte.find({ compteId }).sort({ dateMouvement: -1 });

    return {
      compte,
      mouvements,
      soldeActuel: compte.solde,
      dateCreation: compte.dateCreation,
      dateModification: compte.dateModification,
    };
  }
}

export default new CompteService();
