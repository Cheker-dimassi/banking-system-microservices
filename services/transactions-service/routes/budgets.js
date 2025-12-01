const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

// POST /budgets - create a budget
router.post('/', budgetController.createBudget);

// GET /budgets - get all budgets (optional ?accountId=...)
router.get('/', budgetController.getAllBudgets);

// GET /budgets/:id - get a specific budget
router.get('/:id', budgetController.getBudgetById);

// PUT /budgets/:id - update a budget
router.put('/:id', budgetController.updateBudget);

// DELETE /budgets/:id - delete a budget
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
