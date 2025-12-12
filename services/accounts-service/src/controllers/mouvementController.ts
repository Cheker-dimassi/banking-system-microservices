import { Request, Response } from 'express';
import mouvementService from '../services/mouvementService';
import compteService from '../services/compteService';
import pdfExportService from '../services/pdfExportService';
import transactionFilterService from '../services/transactionFilterService';
import accountSecurityService from '../services/accountSecurityService';
import notificationService from '../services/notificationService';
import { asyncHandler } from '../middleware/errorHandler';
import {
  CreateMouvementSchema,
  PaginationSchema,
} from '../middleware/validation';

export class MouvementController {
  createMouvement = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateMouvementSchema.parse(req.body);
    const mouvement = await mouvementService.createMouvement(data);
    res.status(201).json({
      success: true,
      message: 'Mouvement enregistré avec succès',
      data: mouvement,
    });
  });

  getMouvementById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const mouvement = await mouvementService.getMouvementById(id);
    res.status(200).json({
      success: true,
      data: mouvement,
    });
  });

  updateMouvement = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { montant, description } = req.body;
    const mouvement = await mouvementService.updateMouvement(id, { montant, description });
    res.status(200).json({
      success: true,
      message: 'Mouvement mis à jour avec succès',
      data: mouvement,
    });
  });

  deleteMouvement = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await mouvementService.deleteMouvement(id);
    res.status(200).json({
      success: true,
      message: 'Mouvement supprimé avec succès',
    });
  });

  getAllMouvements = asyncHandler(async (req: Request, res: Response) => {
    const pagination = PaginationSchema.parse(req.query);
    const result = await mouvementService.getAllMouvements(pagination);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  });

  getMouvementsByCompte = asyncHandler(async (req: Request, res: Response) => {
    const { compteId } = req.params;
    const pagination = PaginationSchema.parse(req.query);
    const result = await mouvementService.getMouvementsByCompteId(
      compteId,
      pagination
    );
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  });

  getMouvementsByReference = asyncHandler(
    async (req: Request, res: Response) => {
      const { reference } = req.params;
      const mouvements = await mouvementService.getMouvementsByReference(reference);
      res.status(200).json({
        success: true,
        data: mouvements,
        count: mouvements.length,
      });
    }
  );

  crediterCompte = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { montant, description } = req.body;
    if (!montant || !description) {
      throw new Error('montant et description sont requis');
    }
    const mouvement = await mouvementService.crediterCompte(
      id,
      montant,
      `[ADMIN] ${description}` // Mark as admin operation
    );

    // Admin audit logging
    console.log(`[ADMIN CREDIT] User: ${req.body.adminUser || 'system'}, Amount: ${montant} TND, Account: ${id}`);

    // Get account info to send email notification
    try {
      const compte = await compteService.getCompteById(id);
      if (compte) {
        await notificationService.sendEmail({
          operation: 'create',
          montant,
          description,
          date: new Date(),
          soldeMisAJour: compte.solde,
          email: compte.email,
          referenceTransaction: mouvement.referenceTransaction,
        });
      }
    } catch (emailError) {
      console.warn('[MouvementController] Email notification failed:', emailError);
      // Don't fail the transaction if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Compte crédité avec succès (Admin operation)',
      data: mouvement,
      audit: {
        operationType: 'ADMIN_CREDIT',
        performedBy: req.body.adminUser || 'system',
        timestamp: new Date()
      }
    });
  });

  debiterCompte = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { montant, description } = req.body;
    if (!montant || !description) {
      throw new Error('montant et description sont requis');
    }
    const mouvement = await mouvementService.debiterCompte(
      id,
      montant,
      `[ADMIN] ${description}` // Mark as admin operation
    );

    // Admin audit logging
    console.log(`[ADMIN DEBIT] User: ${req.body.adminUser || 'system'}, Amount: ${montant} TND, Account: ${id}`);

    // Get account info to send email notification
    try {
      const compte = await compteService.getCompteById(id);
      if (compte) {
        await notificationService.sendEmail({
          operation: 'create',
          montant,
          description,
          date: new Date(),
          soldeMisAJour: compte.solde,
          email: compte.email,
          referenceTransaction: mouvement.referenceTransaction,
        });
      }
    } catch (emailError) {
      console.warn('[MouvementController] Email notification failed:', emailError);
      // Don't fail the transaction if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Compte débité avec succès (Admin operation)',
      data: mouvement,
      audit: {
        operationType: 'ADMIN_DEBIT',
        performedBy: req.body.adminUser || 'system',
        timestamp: new Date()
      }
    });
  });

  getMouvementsByCompteNonPagine = asyncHandler(
    async (req: Request, res: Response) => {
      const { compteId } = req.params;
      const mouvements = await mouvementService.getMouvementsByCompte(compteId);
      res.status(200).json({
        success: true,
        data: mouvements,
        count: mouvements.length,
      });
    }
  );

  getMouvementByReference = asyncHandler(
    async (req: Request, res: Response) => {
      const { reference } = req.params;
      const mouvement = await mouvementService.getMouvementByReference(reference);
      if (!mouvement) {
        throw new Error('Mouvement non trouvé');
      }
      res.status(200).json({
        success: true,
        data: mouvement,
      });
    }
  );

  exportToPDF = asyncHandler(async (req: Request, res: Response) => {
    const { compteId } = req.params;
    const { dateFrom, dateTo } = req.query;
    const account = await compteService.getCompteById(compteId);
    if (!account) {
      res.status(404).json({
        success: false,
        message: 'Compte non trouvé',
      });
      return;
    }
    let transactions = await mouvementService.getMouvementsByCompte(compteId);
    if (dateFrom || dateTo) {
      const from = dateFrom ? new Date(dateFrom as string) : new Date(0);
      const to = dateTo ? new Date(dateTo as string) : new Date();
      transactions = transactions.filter((t) => {
        const txDate = new Date(t.dateMouvement);
        return txDate >= from && txDate <= to;
      });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="releve_${account.numeroCompte}_${new Date().toISOString().slice(0, 10)}.pdf"`
    );
    await pdfExportService.generateTransactionPDF(
      {
        account,
        transactions,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        generatedAt: new Date(),
      },
      res
    );
  });

  // ===== FEATURE 1: TRANSACTION FILTERING & SEARCH =====

  filterTransactions = asyncHandler(async (req: Request, res: Response) => {
    const { compteId } = req.params;
    const { dateFrom, dateTo, typeTransaction, minAmount, maxAmount, description } = req.query;

    const filters = {
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      typeTransaction: typeTransaction as 'CREDIT' | 'DEBIT' | undefined,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
      description: description as string,
    };

    const transactions = await transactionFilterService.filterTransactions(compteId, filters);
    res.status(200).json({
      success: true,
      message: 'Transactions filtrées avec succès',
      data: transactions,
    });
  });

  getMonthlyStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { compteId } = req.params;
    const stats = await transactionFilterService.getMonthlyStatistics(compteId);
    res.status(200).json({
      success: true,
      message: 'Statistiques mensuelles',
      data: stats,
    });
  });

  // ===== FEATURE 7: ACCOUNT FREEZE & SPENDING LIMITS =====

  freezeAccount = asyncHandler(async (req: Request, res: Response) => {
    const { compteId } = req.params;
    const { raison } = req.body;

    const updated = await accountSecurityService.freezeAccount(compteId, raison);
    res.status(200).json({
      success: true,
      message: 'Compte gelé avec succès',
      data: updated,
    });
  });

  unfreezeAccount = asyncHandler(async (req: Request, res: Response) => {
    const { compteId } = req.params;
    const updated = await accountSecurityService.unfreezeAccount(compteId);
    res.status(200).json({
      success: true,
      message: 'Compte dégelé avec succès',
      data: updated,
    });
  });

  setSpendingLimit = asyncHandler(async (req: Request, res: Response) => {
    const { compteId } = req.params;
    const { limiteMoyenne } = req.body;

    const updated = await accountSecurityService.setSpendingLimit(compteId, limiteMoyenne);
    res.status(200).json({
      success: true,
      message: 'Limite de dépense définie',
      data: updated,
    });
  });

  getSecurityStatus = asyncHandler(async (req: Request, res: Response) => {
    const { compteId } = req.params;
    const status = await accountSecurityService.getSecurityStatus(compteId);
    res.status(200).json({
      success: true,
      message: 'Statut de sécurité du compte',
      data: status,
    });
  });

  addToWhitelist = asyncHandler(async (req: Request, res: Response) => {
    const { compteId } = req.params;
    const { adresseDestinataire } = req.body;

    const updated = await accountSecurityService.addToWhitelist(compteId, adresseDestinataire);
    res.status(200).json({
      success: true,
      message: 'Adresse ajoutée à la liste blanche',
      data: updated,
    });
  });

  removeFromWhitelist = asyncHandler(async (req: Request, res: Response) => {
    const { compteId } = req.params;
    const { adresseDestinataire } = req.body;

    const updated = await accountSecurityService.removeFromWhitelist(compteId, adresseDestinataire);
    res.status(200).json({
      success: true,
      message: 'Adresse supprimée de la liste blanche',
      data: updated,
    });
  });
}

export default new MouvementController();
