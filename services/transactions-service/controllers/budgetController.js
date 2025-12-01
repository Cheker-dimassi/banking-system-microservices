const Budget = require('../models/budget');

// Create a new budget
exports.createBudget = async (req, res, next) => {
    try {
        const { accountId, name, amount, period, categoryId, description } = req.body;
        if (!accountId || !name || !amount || !period) {
            return res.status(400).json({
                success: false,
                error: 'accountId, name, amount and period are required'
            });
        }
        const budget = await Budget.create({
            accountId,
            name,
            amount,
            period,
            categoryId,
            description
        });
        res.status(201).json({
            success: true,
            message: 'Budget created successfully',
            budget
        });
    } catch (error) {
        next(error);
    }
};

// Get all budgets (optionally filter by accountId)
exports.getAllBudgets = async (req, res, next) => {
    try {
        const { accountId } = req.query;
        const filter = accountId ? { accountId } : {};
        const budgets = await Budget.find(filter).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: budgets.length,
            budgets
        });
    } catch (error) {
        next(error);
    }
};

// Get a single budget by ID
exports.getBudgetById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findOne({ budgetId: id });
        if (!budget) {
            return res.status(404).json({
                success: false,
                error: 'Budget not found'
            });
        }
        res.json({
            success: true,
            budget
        });
    } catch (error) {
        next(error);
    }
};

// Update a budget
exports.updateBudget = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const budget = await Budget.findOne({ budgetId: id });
        if (!budget) {
            return res.status(404).json({
                success: false,
                error: 'Budget not found'
            });
        }
        // Prevent immutable fields
        delete updates.budgetId;
        delete updates.accountId;
        delete updates.createdAt;
        Object.assign(budget, updates);
        await budget.save();
        res.json({
            success: true,
            message: 'Budget updated successfully',
            budget
        });
    } catch (error) {
        next(error);
    }
};

// Delete a budget
exports.deleteBudget = async (req, res, next) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findOne({ budgetId: id });
        if (!budget) {
            return res.status(404).json({
                success: false,
                error: 'Budget not found'
            });
        }
        await Budget.deleteOne({ budgetId: id });
        res.json({
            success: true,
            message: 'Budget deleted successfully',
            deletedBudget: budget
        });
    } catch (error) {
        next(error);
    }
};
