import { CompteBancaire } from '../models/CompteBancaire';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4, validate as isUuid } from 'uuid';

export interface FreezeAccountInput {
  raison: string;
}

export interface SetLimitInput {
  limiteMoyenne: number;
}

export interface WhitelistInput {
  adresse: string;
}

export class AccountSecurityService {
  /**
   * Freeze an account (prevent all transactions)
   */
  async freezeAccount(compteId: string, raison: string): Promise<any> {
    if (!raison || raison.trim().length === 0) {
      throw new AppError(400, 'La raison du gel est obligatoire');
    }

    const compte = await CompteBancaire.findByIdAndUpdate(
      compteId,
      {
        estGele: true,
        raison_gel: raison,
        dateModification: new Date(),
      },
      { new: true }
    );

    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    return {
      message: 'Compte gelé avec succès',
      compte: {
        id: compte._id,
        estGele: compte.estGele,
        raison_gel: compte.raison_gel,
      },
    };
  }

  /**
   * Unfreeze an account
   */
  async unfreezeAccount(compteId: string): Promise<any> {
    const compte = await CompteBancaire.findByIdAndUpdate(
      compteId,
      {
        estGele: false,
        raison_gel: null,
        dateModification: new Date(),
      },
      { new: true }
    );

    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    return {
      message: 'Compte dégelé avec succès',
      compte: {
        id: compte._id,
        estGele: compte.estGele,
      },
    };
  }

  /**
   * Set daily spending limit
   */
  async setSpendingLimit(compteId: string, limiteMoyenne: number): Promise<any> {
    if (limiteMoyenne <= 0) {
      throw new AppError(400, 'La limite doit être supérieure à 0');
    }

    const compte = await CompteBancaire.findByIdAndUpdate(
      compteId,
      {
        limiteMoyenne,
        dateModification: new Date(),
      },
      { new: true }
    );

    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    return {
      message: 'Limite de dépense définie',
      compte: {
        id: compte._id,
        limiteMoyenne: compte.limiteMoyenne,
      },
    };
  }

  /**
   * Check if transaction exceeds limit
   */
  async checkTransactionLimit(compteId: string, montant: number): Promise<boolean> {
    const compte = await CompteBancaire.findById(compteId);
    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    // Check if account is frozen
    if (compte.estGele) {
      throw new AppError(403, `Compte gelé. Raison: ${compte.raison_gel}`);
    }

    // Check daily limit
    if (compte.limiteMoyenne && montant > compte.limiteMoyenne) {
      return false;
    }

    return true;
  }

  /**
   * Add address to whitelist
   */
  async addToWhitelist(compteId: string, adresse: string): Promise<any> {
    if (!isUuid(compteId)) {
      throw new AppError(400, 'ID du compte invalide');
    }

    if (!adresse || adresse.trim().length === 0) {
      throw new AppError(400, 'Adresse invalide');
    }

    const compte = await CompteBancaire.findById(compteId);
    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    if (!compte.listeBlanche.includes(adresse)) {
      compte.listeBlanche.push(adresse);
      await compte.save();
    }

    return {
      message: 'Adresse ajoutée à la liste blanche',
      listeBlanche: compte.listeBlanche,
    };
  }

  /**
   * Remove address from whitelist
   */
  async removeFromWhitelist(compteId: string, adresse: string): Promise<any> {
    if (!isUuid(compteId)) {
      throw new AppError(400, 'ID du compte invalide');
    }

    const compte = await CompteBancaire.findById(compteId);
    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    compte.listeBlanche = compte.listeBlanche.filter((a) => a !== adresse);
    await compte.save();

    return {
      message: 'Adresse supprimée de la liste blanche',
      listeBlanche: compte.listeBlanche,
    };
  }

  /**
   * Check if address is whitelisted
   */
  async isWhitelisted(compteId: string, adresse: string): Promise<boolean> {
    const compte = await CompteBancaire.findById(compteId);
    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    return compte.listeBlanche.includes(adresse);
  }

  /**
   * Get account security status
   */
  async getSecurityStatus(compteId: string): Promise<any> {
    const compte = await CompteBancaire.findById(compteId);
    if (!compte) {
      throw new AppError(404, 'Compte non trouvé');
    }

    return {
      compteId: compte._id,
      estGele: compte.estGele,
      raison_gel: compte.raison_gel,
      limiteMoyenne: compte.limiteMoyenne,
      listeBlanche: compte.listeBlanche,
    };
  }

  /**
   * Update daily spending tracker
   */
  async updateDailySpending(compteId: string, montant: number): Promise<void> {
    // Placeholder for future implementation
    return;
  }
}

export default new AccountSecurityService();
