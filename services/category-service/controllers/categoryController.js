const mongoose = require('mongoose');
const Category = require('../models/category');

function buildCategoryQuery(rawId) {
    const trimmedId = (rawId || '').trim();

    if (!trimmedId) {
        return { trimmedId: '', conditions: [] };
    }

    const conditions = [{ categoryId: trimmedId }];

    if (mongoose.Types.ObjectId.isValid(trimmedId)) {
        conditions.push({ _id: trimmedId });
    }

    return { trimmedId, conditions };
}

/**
 * Create a new category
 * POST /categories
 */
async function createCategory(req, res) {
    try {
        const { name, description, type, color, icon } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Category name is required'
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(409).json({
                success: false,
                error: `Category '${name}' already exists`
            });
        }

        // Validate type if provided
        const validTypes = ['income', 'expense', 'transfer', 'other'];
        if (type && !validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                error: `Type must be one of: ${validTypes.join(', ')}`
            });
        }

        // Create category
        const category = await Category.create({
            name: name.trim(),
            description: description?.trim() || '',
            type: type || 'other',
            color: color || '#6B7280',
            icon: icon || '📁'
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category: {
                categoryId: category.categoryId,
                name: category.name,
                description: category.description,
                type: category.type,
                color: category.color,
                icon: category.icon,
                isDefault: category.isDefault,
                isActive: category.isActive,
                usageCount: category.usageCount,
                createdAt: category.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Get all categories
 * GET /categories
 */
async function getAllCategories(req, res) {
    try {
        const { type, isActive } = req.query;

        // Build filter
        const filter = {};
        if (type) filter.type = type;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const categories = await Category.find(filter).sort({ name: 1 });

        res.json({
            success: true,
            count: categories.length,
            categories: categories.map(cat => ({
                categoryId: cat.categoryId,
                name: cat.name,
                description: cat.description,
                type: cat.type,
                color: cat.color,
                icon: cat.icon,
                isDefault: cat.isDefault,
                isActive: cat.isActive,
                usageCount: cat.usageCount,
                createdAt: cat.createdAt,
                updatedAt: cat.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Get a specific category by ID
 * GET /categories/:id
 */
async function getCategoryById(req, res) {
    try {
        const { id } = req.params;
        const { trimmedId, conditions } = buildCategoryQuery(id);

        if (!trimmedId) {
            return res.status(400).json({
                success: false,
                error: 'Category ID is required'
            });
        }

        const category = await Category.findOne({ $or: conditions.length ? conditions : [{ categoryId: trimmedId }] });

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found',
                hint: 'Use GET /categories to list all categories'
            });
        }

        res.json({
            success: true,
            category: {
                categoryId: category.categoryId,
                name: category.name,
                description: category.description,
                type: category.type,
                color: category.color,
                icon: category.icon,
                isDefault: category.isDefault,
                isActive: category.isActive,
                usageCount: category.usageCount,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Update a category
 * PUT /categories/:id
 */
async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { trimmedId, conditions } = buildCategoryQuery(id);

        if (!trimmedId) {
            return res.status(400).json({
                success: false,
                error: 'Category ID is required'
            });
        }

        const category = await Category.findOne({ $or: conditions.length ? conditions : [{ categoryId: trimmedId }] });

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        // Prevent changing categoryId
        delete updates.categoryId;

        // Validate type if provided
        if (updates.type) {
            const validTypes = ['income', 'expense', 'transfer', 'other'];
            if (!validTypes.includes(updates.type)) {
                return res.status(400).json({
                    success: false,
                    error: `Type must be one of: ${validTypes.join(', ')}`
                });
            }
        }

        // Check if name is being changed and if it already exists
        if (updates.name && updates.name.trim() !== category.name) {
            const existingCategory = await Category.findOne({ 
                name: updates.name.trim(),
                _id: { $ne: category._id }
            });
            if (existingCategory) {
                return res.status(409).json({
                    success: false,
                    error: `Category '${updates.name}' already exists`
                });
            }
            updates.name = updates.name.trim();
        }

        // Update fields
        Object.assign(category, updates);
        await category.save();

        res.json({
            success: true,
            message: 'Category updated successfully',
            category: {
                categoryId: category.categoryId,
                name: category.name,
                description: category.description,
                type: category.type,
                color: category.color,
                icon: category.icon,
                isDefault: category.isDefault,
                isActive: category.isActive,
                usageCount: category.usageCount,
                updatedAt: category.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Delete a category
 * DELETE /categories/:id
 */
async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        const { trimmedId, conditions } = buildCategoryQuery(id);

        if (!trimmedId) {
            return res.status(400).json({
                success: false,
                error: 'Category ID is required'
            });
        }

        const category = await Category.findOne({ $or: conditions.length ? conditions : [{ categoryId: trimmedId }] });

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        // Prevent deleting default categories
        if (category.isDefault) {
            return res.status(403).json({
                success: false,
                error: 'Cannot delete default category'
            });
        }

        await Category.deleteOne({ _id: category._id });

        res.json({
            success: true,
            message: 'Category deleted successfully',
            deletedCategory: {
                categoryId: category.categoryId,
                name: category.name
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Toggle category active status
 * PATCH /categories/:id/toggle
 */
async function toggleCategory(req, res) {
    try {
        const { id } = req.params;
        const { trimmedId, conditions } = buildCategoryQuery(id);

        if (!trimmedId) {
            return res.status(400).json({
                success: false,
                error: 'Category ID is required'
            });
        }

        const category = await Category.findOne({ $or: conditions.length ? conditions : [{ categoryId: trimmedId }] });

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        category.isActive = !category.isActive;
        await category.save();

        res.json({
            success: true,
            message: `Category ${category.isActive ? 'activated' : 'deactivated'}`,
            category: {
                categoryId: category.categoryId,
                name: category.name,
                isActive: category.isActive
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    toggleCategory
};
