import { Router } from 'express';
import mouvementController from '../controllers/mouvementController';

const router = Router();

// Routes SPÉCIFIQUES (avant les génériques!)
router.post('/credit/:id', mouvementController.crediterCompte);
router.post('/debit/:id', mouvementController.debiterCompte);
router.get('/compte/:compteId', mouvementController.getMouvementsByCompte);
router.get('/transaction/:reference', mouvementController.getMouvementsByReference);
router.get('/reference/:reference', mouvementController.getMouvementByReference);
router.get('/export/pdf/:compteId', mouvementController.exportToPDF);

// ===== FEATURE 1: TRANSACTION FILTERING & SEARCH =====
router.get('/filter/:compteId', mouvementController.filterTransactions);
router.get('/stats/:compteId', mouvementController.getMonthlyStatistics);

// ===== FEATURE 7: ACCOUNT FREEZE & SPENDING LIMITS =====
router.post('/security/freeze/:compteId', mouvementController.freezeAccount);
router.post('/security/unfreeze/:compteId', mouvementController.unfreezeAccount);
router.post('/security/limit/:compteId', mouvementController.setSpendingLimit);
router.get('/security/status/:compteId', mouvementController.getSecurityStatus);
router.post('/security/whitelist/add/:compteId', mouvementController.addToWhitelist);
router.post('/security/whitelist/remove/:compteId', mouvementController.removeFromWhitelist);

// Routes GÉNÉRIQUES (après les spécifiques)
router.post('/', mouvementController.createMouvement);
router.get('/', mouvementController.getAllMouvements);
router.get('/:id', mouvementController.getMouvementById);
router.put('/:id', mouvementController.updateMouvement);
router.delete('/:id', mouvementController.deleteMouvement);

export default router;
