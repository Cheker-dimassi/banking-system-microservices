const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    accountId: {
        type: String,
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    currency: {
        type: String,
        default: 'TND'
    },
    status: {
        type: String,
        enum: ['active', 'frozen', 'closed', 'suspended'],
        default: 'active'
    },
    owner: {
        type: String,
        required: true
    },
    customLimits: {
        dailyWithdrawal: Number,
        dailyTransfer: Number,
        singleTransaction: Number
    }
});

// Ensure toJSON returns a clean object
accountSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Account', accountSchema);
