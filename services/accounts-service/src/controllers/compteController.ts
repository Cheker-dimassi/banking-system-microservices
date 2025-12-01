import { Request, Response } from 'express';
import compteService from '../services/compteService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import {
  CreateCompteSchema,
  UpdateCompteSchema,
  PaginationSchema,
} from '../middleware/validation';

export class CompteController {
  /**
   * Créer un nouveau compte
   */
  createCompte = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateCompteSchema.parse(req.body);
    const compte = await compteService.createCompte(data);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: compte,
    });
  });

  /**
   * Récupérer un compte par ID
   */
  getCompteById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const compte = await compteService.getCompteById(id);

    res.status(200).json({
      success: true,
      data: compte,
    });
  });

  /**
   * Lister tous les comptes
   */
  getAllComptes = asyncHandler(async (req: Request, res: Response) => {
    const pagination = PaginationSchema.parse(req.query);
    const result = await compteService.getAllComptes(pagination);

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

  /**
   * Récupérer les comptes d'un client
   */
  getComptesByClient = asyncHandler(async (req: Request, res: Response) => {
    const { clientId } = req.params;
    const pagination = PaginationSchema.parse(req.query);
    const result = await compteService.getComptesByClientId(clientId, pagination);

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

  /**
   * Mettre à jour un compte
   */
  updateCompte = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = UpdateCompteSchema.parse(req.body);
    const compte = await compteService.updateCompte(id, data);

    res.status(200).json({
      success: true,
      message: 'Compte mis à jour avec succès',
      data: compte,
    });
  });

  /**
   * Supprimer (soft delete) un compte
   */
  deleteCompte = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await compteService.deleteCompte(id);

    res.status(200).json({
      success: true,
      message: 'Compte désactivé avec succès',
    });
  });

  /**
   * Auditer un compte : retourner compte complet + mouvements + métadonnées
   */
  auditerCompte = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const auditData = await compteService.auditerCompte(id);

    res.status(200).json({
      success: true,
      message: 'Audit du compte',
      data: auditData,
    });
  });
}

export default new CompteController();
