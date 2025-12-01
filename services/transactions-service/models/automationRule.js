const mongoose = require('mongoose');

const automationRuleSchema = new mongoose.Schema({
    ruleId: {
        type: String,
        required: true,
        unique: true,
        default: () => `RULE_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    },
    accountId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'save_percentage',      // Save X% of transaction amount
            'round_up',             // Round up to nearest amount and save difference
            'fixed_transfer',       // Transfer fixed amount on trigger
            'conditional_transfer', // Transfer if conditions met
            'auto_invest'          // Automatically invest amount
        ]
    },
    trigger: {
        type: String,
        required: true,
        enum: [
            'on_deposit',           // Triggered when money comes in
            'on_withdrawal',        // Triggered on withdrawals
            'on_transfer_in',       // Only on incoming transfers
            'on_transfer_out',      // Only on outgoing transfers
            'on_any_transaction',   // Any completed transaction
            'on_salary'            // Specific for salary deposits (can check description/amount)
        ]
    },
    conditions: {
        minAmount: {
            type: Number,
            min: 0
        },
        maxAmount: {
            type: Number,
            min: 0
        },
        transactionTypes: [{
            type: String,
            enum: ['deposit', 'withdrawal', 'internal_transfer', 'interbank_transfer']
        }],
        // For more complex conditions
        descriptionContains: String,
        dayOfMonth: Number,       // Execute only on specific day
        dayOfWeek: Number         // Execute only on specific weekday (0-6)
    },
    action: {
        targetAccount: {
            type: String,
            required: true
        },
        actionType: {
            type: String,
            required: false,  // Optional - defaults based on rule type
            enum: ['transfer', 'save', 'invest'],
            default: 'save'
        },
        // For percentage-based rules
        percentage: {
            type: Number,
            min: 0,
            max: 100
        },
        // For fixed amount rules
        fixedAmount: {
            type: Number,
            min: 0
        },
        // For round-up rules
        roundUpTo: {
            type: Number,
            min: 1
        },
        description: {
            type: String,
            default: 'Automated transaction'
        }
    },
    limits: {
        maxPerTransaction: {
            type: Number,
            min: 0
        },
        maxPerDay: {
            type: Number,
            min: 0
        },
        maxPerMonth: {
            type: Number,
            min: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    executionCount: {
        type: Number,
        default: 0
    },
    totalAmountProcessed: {
        type: Number,
        default: 0
    },
    lastExecuted: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
automationRuleSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Method to check if rule should execute for a given transaction
automationRuleSchema.methods.shouldExecute = function (transaction) {
    if (!this.isActive) return false;

    // Check trigger match
    const triggerMatch = this.checkTrigger(transaction);
    if (!triggerMatch) return false;

    // Check conditions
    if (this.conditions) {
        // Amount conditions
        if (this.conditions.minAmount && transaction.amount < this.conditions.minAmount) {
            return false;
        }
        if (this.conditions.maxAmount && transaction.amount > this.conditions.maxAmount) {
            return false;
        }

        // Transaction type conditions
        if (this.conditions.transactionTypes && this.conditions.transactionTypes.length > 0) {
            if (!this.conditions.transactionTypes.includes(transaction.type)) {
                return false;
            }
        }

        // Description conditions
        if (this.conditions.descriptionContains) {
            const desc = (transaction.description || '').toLowerCase();
            const search = this.conditions.descriptionContains.toLowerCase();
            if (!desc.includes(search)) {
                return false;
            }
        }

        // Day conditions
        const transactionDate = new Date(transaction.timestamp);
        if (this.conditions.dayOfMonth && transactionDate.getDate() !== this.conditions.dayOfMonth) {
            return false;
        }
        if (this.conditions.dayOfWeek !== undefined && transactionDate.getDay() !== this.conditions.dayOfWeek) {
            return false;
        }
    }

    return true;
};

// Check if transaction matches trigger
automationRuleSchema.methods.checkTrigger = function (transaction) {
    switch (this.trigger) {
        case 'on_deposit':
            return transaction.type === 'deposit';
        case 'on_withdrawal':
            return transaction.type === 'withdrawal';
        case 'on_transfer_in':
            return (transaction.type === 'internal_transfer' || transaction.type === 'interbank_transfer')
                && transaction.toAccount === this.accountId;
        case 'on_transfer_out':
            return (transaction.type === 'internal_transfer' || transaction.type === 'interbank_transfer')
                && transaction.fromAccount === this.accountId;
        case 'on_any_transaction':
            return true;
        case 'on_salary':
            // Check if it's a deposit with "salary" or "salaire" in description
            if (transaction.type !== 'deposit') return false;
            const desc = (transaction.description || '').toLowerCase();
            return desc.includes('salary') || desc.includes('salaire') || desc.includes('paie');
        default:
            return false;
    }
};

// Calculate the amount to transfer based on rule type
automationRuleSchema.methods.calculateAmount = function (transaction) {
    switch (this.type) {
        case 'save_percentage':
            if (!this.action.percentage) return 0;
            return (transaction.amount * this.action.percentage) / 100;

        case 'fixed_transfer':
            return this.action.fixedAmount || 0;

        case 'round_up':
            if (!this.action.roundUpTo) return 0;
            const roundTo = this.action.roundUpTo;
            const rounded = Math.ceil(transaction.amount / roundTo) * roundTo;
            return rounded - transaction.amount;

        case 'conditional_transfer':
            // For conditional transfers, use fixed amount if conditions are met
            return this.action.fixedAmount || 0;

        case 'auto_invest':
            // Can use either percentage or fixed amount
            if (this.action.percentage) {
                return (transaction.amount * this.action.percentage) / 100;
            }
            return this.action.fixedAmount || 0;

        default:
            return 0;
    }
};

// Check if amount is within limits
automationRuleSchema.methods.checkLimits = async function (amount) {
    if (!this.limits) return true;

    // Check per-transaction limit
    if (this.limits.maxPerTransaction && amount > this.limits.maxPerTransaction) {
        return false;
    }

    // Check daily limit
    if (this.limits.maxPerDay) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const Transaction = mongoose.model('Transaction');
        const todayTotal = await Transaction.aggregate([
            {
                $match: {
                    fromAccount: this.accountId,
                    description: { $regex: new RegExp(this.ruleId, 'i') },
                    timestamp: { $gte: todayStart },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const currentDailyTotal = todayTotal.length > 0 ? todayTotal[0].total : 0;
        if (currentDailyTotal + amount > this.limits.maxPerDay) {
            return false;
        }
    }

    // Check monthly limit
    if (this.limits.maxPerMonth) {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const Transaction = mongoose.model('Transaction');
        const monthTotal = await Transaction.aggregate([
            {
                $match: {
                    fromAccount: this.accountId,
                    description: { $regex: new RegExp(this.ruleId, 'i') },
                    timestamp: { $gte: monthStart },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const currentMonthlyTotal = monthTotal.length > 0 ? monthTotal[0].total : 0;
        if (currentMonthlyTotal + amount > this.limits.maxPerMonth) {
            return false;
        }
    }

    return true;
};

// Static method to find active rules for an account
automationRuleSchema.statics.findActiveByAccount = function (accountId) {
    return this.find({ accountId, isActive: true });
};

const AutomationRule = mongoose.model('AutomationRule', automationRuleSchema);

module.exports = AutomationRule;
