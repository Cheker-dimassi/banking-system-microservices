const AutomationRule = require('../models/automationRule');
const { executeTransactionSaga } = require('./atomicity');

/**
 * Execute automation rules after a transaction is completed
 * @param {Object} transaction - The completed transaction
 * @returns {Promise<Array>} Array of executed rule results
 */
async function executeAutomationRules(transaction) {
    try {
        // Only execute rules for completed transactions
        if (transaction.status !== 'completed') {
            return [];
        }

        // Find the account(s) involved in the transaction
        const accountIds = [];
        if (transaction.fromAccount) accountIds.push(transaction.fromAccount);
        if (transaction.toAccount) accountIds.push(transaction.toAccount);

        if (accountIds.length === 0) {
            return [];
        }

        // Get all active automation rules for these accounts
        const rules = await AutomationRule.find({
            accountId: { $in: accountIds },
            isActive: true
        });

        if (rules.length === 0) {
            return [];
        }

        const results = [];

        // Execute each applicable rule
        for (const rule of rules) {
            try {
                // Check if this rule should execute
                if (!rule.shouldExecute(transaction)) {
                    continue;
                }

                // Calculate the amount to transfer
                const amount = rule.calculateAmount(transaction);

                if (amount <= 0) {
                    continue;
                }

                // Apply limits
                const withinLimits = await rule.checkLimits(amount);
                if (!withinLimits) {
                    results.push({
                        ruleId: rule.ruleId,
                        ruleName: rule.name,
                        executed: false,
                        reason: 'Amount exceeds configured limits',
                        amount: amount
                    });
                    continue;
                }

                // Execute the automated transaction
                const automatedTransactionData = {
                    type: 'internal_transfer',
                    fromAccount: rule.accountId,
                    toAccount: rule.action.targetAccount,
                    amount: amount,
                    currency: transaction.currency || 'TND',
                    description: `${rule.action.description} (Rule: ${rule.name})`,
                    metadata: {
                        automationRuleId: rule.ruleId,
                        triggeredBy: transaction.transactionId,
                        automated: true
                    },
                    fees: 0, // No fees for automated transfers
                    commission: 0
                };

                const result = await executeTransactionSaga(automatedTransactionData);

                if (result.success) {
                    // Update rule statistics
                    rule.executionCount += 1;
                    rule.totalAmountProcessed += amount;
                    rule.lastExecuted = new Date();
                    await rule.save();

                    results.push({
                        ruleId: rule.ruleId,
                        ruleName: rule.name,
                        executed: true,
                        amount: amount,
                        transaction: result.transaction
                    });

                    console.log(`✅ Automation rule executed: ${rule.name} - ${amount} transferred`);
                } else {
                    results.push({
                        ruleId: rule.ruleId,
                        ruleName: rule.name,
                        executed: false,
                        reason: result.error,
                        amount: amount
                    });

                    console.log(`❌ Automation rule failed: ${rule.name} - ${result.error}`);
                }

            } catch (error) {
                console.error(`Error executing automation rule ${rule.ruleId}:`, error);
                results.push({
                    ruleId: rule.ruleId,
                    ruleName: rule.name,
                    executed: false,
                    reason: error.message,
                    error: true
                });
            }
        }

        return results;

    } catch (error) {
        console.error('Error in executeAutomationRules:', error);
        return [];
    }
}

/**
 * Validate automation rule data
 * @param {Object} ruleData - The rule data to validate
 * @returns {Object} Validation result
 */
function validateAutomationRule(ruleData) {
    const errors = [];

    // Required fields
    if (!ruleData.accountId) {
        errors.push('accountId is required');
    }
    if (!ruleData.name || ruleData.name.trim() === '') {
        errors.push('name is required');
    }
    if (!ruleData.type) {
        errors.push('type is required');
    }
    if (!ruleData.trigger) {
        errors.push('trigger is required');
    }
    if (!ruleData.action || !ruleData.action.targetAccount) {
        errors.push('action.targetAccount is required');
    }

    // Validate type-specific requirements
    if (ruleData.type === 'save_percentage' && !ruleData.action?.percentage) {
        errors.push('action.percentage is required for save_percentage type');
    }
    if (ruleData.type === 'fixed_transfer' && !ruleData.action?.fixedAmount) {
        errors.push('action.fixedAmount is required for fixed_transfer type');
    }
    if (ruleData.type === 'round_up' && !ruleData.action?.roundUpTo) {
        errors.push('action.roundUpTo is required for round_up type');
    }

    // Validate percentage range
    if (ruleData.action?.percentage !== undefined) {
        if (ruleData.action.percentage < 0 || ruleData.action.percentage > 100) {
            errors.push('action.percentage must be between 0 and 100');
        }
    }

    // Validate amounts
    if (ruleData.action?.fixedAmount !== undefined && ruleData.action.fixedAmount < 0) {
        errors.push('action.fixedAmount must be positive');
    }

    // Validate that source and target accounts are different
    if (ruleData.accountId === ruleData.action?.targetAccount) {
        errors.push('Source and target accounts must be different');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Get execution history for a rule
 * @param {String} ruleId - The rule ID
 * @param {Object} options - Query options (limit, startDate, endDate)
 * @returns {Promise<Array>} Array of transactions executed by this rule
 */
async function getRuleExecutionHistory(ruleId, options = {}) {
    const Transaction = require('../models/transaction');

    const query = {
        description: { $regex: new RegExp(ruleId, 'i') },
        status: 'completed'
    };

    if (options.startDate) {
        query.timestamp = { $gte: new Date(options.startDate) };
    }
    if (options.endDate) {
        if (query.timestamp) {
            query.timestamp.$lte = new Date(options.endDate);
        } else {
            query.timestamp = { $lte: new Date(options.endDate) };
        }
    }

    const limit = options.limit || 50;

    const transactions = await Transaction.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

    return transactions;
}

/**
 * Get statistics for a rule
 * @param {String} ruleId - The rule ID
 * @returns {Promise<Object>} Rule statistics
 */
async function getRuleStatistics(ruleId) {
    const rule = await AutomationRule.findOne({ ruleId });

    if (!rule) {
        throw new Error('Automation rule not found');
    }

    const Transaction = require('../models/transaction');

    // Get today's transactions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayTransactions = await Transaction.aggregate([
        {
            $match: {
                description: { $regex: new RegExp(ruleId, 'i') },
                timestamp: { $gte: todayStart },
                status: 'completed'
            }
        },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
                total: { $sum: '$amount' }
            }
        }
    ]);

    // Get this month's transactions
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthTransactions = await Transaction.aggregate([
        {
            $match: {
                description: { $regex: new RegExp(ruleId, 'i') },
                timestamp: { $gte: monthStart },
                status: 'completed'
            }
        },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
                total: { $sum: '$amount' }
            }
        }
    ]);

    return {
        ruleId: rule.ruleId,
        ruleName: rule.name,
        isActive: rule.isActive,
        totalExecutions: rule.executionCount,
        totalAmountProcessed: rule.totalAmountProcessed,
        lastExecuted: rule.lastExecuted,
        today: {
            executions: todayTransactions.length > 0 ? todayTransactions[0].count : 0,
            amount: todayTransactions.length > 0 ? todayTransactions[0].total : 0
        },
        thisMonth: {
            executions: monthTransactions.length > 0 ? monthTransactions[0].count : 0,
            amount: monthTransactions.length > 0 ? monthTransactions[0].total : 0
        },
        limits: rule.limits,
        createdAt: rule.createdAt
    };
}

module.exports = {
    executeAutomationRules,
    validateAutomationRule,
    getRuleExecutionHistory,
    getRuleStatistics
};
