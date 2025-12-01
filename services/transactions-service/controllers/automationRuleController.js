const AutomationRule = require('../models/automationRule');
const {
    validateAutomationRule,
    getRuleExecutionHistory,
    getRuleStatistics
} = require('../utils/automationRules');
const { getAccount } = require('../utils/atomicity');

/**
 * Create a new automation rule
 * POST /transactions/auto-rules
 */
async function createAutomationRule(req, res) {
    try {
        const ruleData = req.body;

        // Validate rule data
        const validation = validateAutomationRule(ruleData);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid automation rule data',
                errors: validation.errors
            });
        }

        // Verify that the account exists
        const account = await getAccount(ruleData.accountId);
        if (!account) {
            return res.status(404).json({
                success: false,
                error: `Account ${ruleData.accountId} not found`,
                hint: 'Make sure the account exists. Use ACC_123, ACC_456, or EXT_999 for testing.'
            });
        }

        // Verify that the target account exists
        const targetAccount = await getAccount(ruleData.action.targetAccount);
        if (!targetAccount) {
            return res.status(404).json({
                success: false,
                error: `Target account ${ruleData.action.targetAccount} not found`,
                hint: 'Make sure the target account exists.'
            });
        }

        // Create the automation rule
        const rule = await AutomationRule.create(ruleData);

        res.status(201).json({
            success: true,
            message: 'Automation rule created successfully',
            rule: {
                ruleId: rule.ruleId,
                accountId: rule.accountId,
                name: rule.name,
                description: rule.description,
                type: rule.type,
                trigger: rule.trigger,
                action: rule.action,
                conditions: rule.conditions,
                limits: rule.limits,
                isActive: rule.isActive,
                createdAt: rule.createdAt
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Get all automation rules for an account
 * GET /transactions/auto-rules/:accountId
 */
async function getAutomationRulesByAccount(req, res) {
    try {
        const { accountId } = req.params;

        // Verify account exists
        const account = await getAccount(accountId);
        if (!account) {
            return res.status(404).json({
                success: false,
                error: `Account ${accountId} not found`
            });
        }

        const rules = await AutomationRule.find({ accountId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            accountId,
            count: rules.length,
            rules: rules.map(rule => ({
                ruleId: rule.ruleId,
                name: rule.name,
                description: rule.description,
                type: rule.type,
                trigger: rule.trigger,
                action: rule.action,
                conditions: rule.conditions,
                limits: rule.limits,
                isActive: rule.isActive,
                executionCount: rule.executionCount,
                totalAmountProcessed: rule.totalAmountProcessed,
                lastExecuted: rule.lastExecuted,
                createdAt: rule.createdAt,
                updatedAt: rule.updatedAt
            }))
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Get a specific automation rule
 * GET /transactions/auto-rules/rule/:id
 */
async function getAutomationRuleById(req, res) {
    try {
        const { id } = req.params;

        const rule = await AutomationRule.findOne({ ruleId: id });

        if (!rule) {
            return res.status(404).json({
                success: false,
                error: 'Automation rule not found',
                hint: 'Use GET /transactions/auto-rules/:accountId to list all rules for an account'
            });
        }

        res.json({
            success: true,
            rule: {
                ruleId: rule.ruleId,
                accountId: rule.accountId,
                name: rule.name,
                description: rule.description,
                type: rule.type,
                trigger: rule.trigger,
                action: rule.action,
                conditions: rule.conditions,
                limits: rule.limits,
                isActive: rule.isActive,
                executionCount: rule.executionCount,
                totalAmountProcessed: rule.totalAmountProcessed,
                lastExecuted: rule.lastExecuted,
                createdAt: rule.createdAt,
                updatedAt: rule.updatedAt
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Update an automation rule
 * PUT /transactions/auto-rules/:id
 */
async function updateAutomationRule(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        const rule = await AutomationRule.findOne({ ruleId: id });

        if (!rule) {
            return res.status(404).json({
                success: false,
                error: 'Automation rule not found'
            });
        }

        // Prevent changing accountId and ruleId
        delete updates.accountId;
        delete updates.ruleId;

        // If updating the rule data, validate it
        const updatedRuleData = { ...rule.toObject(), ...updates };
        const validation = validateAutomationRule(updatedRuleData);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid automation rule data',
                errors: validation.errors
            });
        }

        // Update fields
        Object.assign(rule, updates);
        await rule.save();

        res.json({
            success: true,
            message: 'Automation rule updated successfully',
            rule: {
                ruleId: rule.ruleId,
                accountId: rule.accountId,
                name: rule.name,
                description: rule.description,
                type: rule.type,
                trigger: rule.trigger,
                action: rule.action,
                conditions: rule.conditions,
                limits: rule.limits,
                isActive: rule.isActive,
                executionCount: rule.executionCount,
                totalAmountProcessed: rule.totalAmountProcessed,
                lastExecuted: rule.lastExecuted,
                updatedAt: rule.updatedAt
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Delete an automation rule
 * DELETE /transactions/auto-rules/:id
 */
async function deleteAutomationRule(req, res) {
    try {
        const { id } = req.params;

        const rule = await AutomationRule.findOne({ ruleId: id });

        if (!rule) {
            return res.status(404).json({
                success: false,
                error: 'Automation rule not found'
            });
        }

        await AutomationRule.deleteOne({ ruleId: id });

        res.json({
            success: true,
            message: 'Automation rule deleted successfully',
            deletedRule: {
                ruleId: rule.ruleId,
                name: rule.name
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Toggle automation rule active status
 * PATCH /transactions/auto-rules/:id/toggle
 */
async function toggleAutomationRule(req, res) {
    try {
        const { id } = req.params;

        const rule = await AutomationRule.findOne({ ruleId: id });

        if (!rule) {
            return res.status(404).json({
                success: false,
                error: 'Automation rule not found'
            });
        }

        rule.isActive = !rule.isActive;
        await rule.save();

        res.json({
            success: true,
            message: `Automation rule ${rule.isActive ? 'activated' : 'deactivated'}`,
            rule: {
                ruleId: rule.ruleId,
                name: rule.name,
                isActive: rule.isActive
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Get execution history for a rule
 * GET /transactions/auto-rules/:id/history
 */
async function getAutomationRuleHistory(req, res) {
    try {
        const { id } = req.params;
        const { limit, startDate, endDate } = req.query;

        const rule = await AutomationRule.findOne({ ruleId: id });

        if (!rule) {
            return res.status(404).json({
                success: false,
                error: 'Automation rule not found'
            });
        }

        const history = await getRuleExecutionHistory(id, {
            limit: limit ? parseInt(limit) : 50,
            startDate,
            endDate
        });

        res.json({
            success: true,
            ruleId: id,
            ruleName: rule.name,
            count: history.length,
            transactions: history
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * Get statistics for a rule
 * GET /transactions/auto-rules/:id/statistics
 */
async function getAutomationRuleStatistics(req, res) {
    try {
        const { id } = req.params;

        const stats = await getRuleStatistics(id);

        res.json({
            success: true,
            statistics: stats
        });

    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    createAutomationRule,
    getAutomationRulesByAccount,
    getAutomationRuleById,
    updateAutomationRule,
    deleteAutomationRule,
    toggleAutomationRule,
    getAutomationRuleHistory,
    getAutomationRuleStatistics
};
