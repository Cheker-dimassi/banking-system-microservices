const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// POST /categories - Create a new category
router.post('/', categoryController.createCategory);

// GET /categories - Get all categories
router.get('/', categoryController.getAllCategories);

// GET /categories/:id - Get a specific category
router.get('/:id', categoryController.getCategoryById);

// PUT /categories/:id - Update a category
router.put('/:id', categoryController.updateCategory);

// DELETE /categories/:id - Delete a category
router.delete('/:id', categoryController.deleteCategory);

// PATCH /categories/:id/toggle - Toggle category active status
router.patch('/:id/toggle', categoryController.toggleCategory);

module.exports = router;
