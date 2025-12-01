import { Router } from 'express';
import compteController from '../controllers/compteController';

const router = Router();

// CRUD Comptes Bancaires
router.post('/', compteController.createCompte);
router.get('/', compteController.getAllComptes);
router.get('/audit/:id', compteController.auditerCompte);
router.get('/client/:clientId', compteController.getComptesByClient);
router.get('/:id', compteController.getCompteById);
router.put('/:id', compteController.updateCompte);
router.delete('/:id', compteController.deleteCompte);

export default router;
