const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    budgetId: {
        type: String,
        required: true,
        unique: true,
        default: () => `BUD_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`
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
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    period: {
        type: String,
        required: true,
        enum: ['monthly', 'yearly']
    },
    categoryId: {
        type: String,
        default: null
    },
    description: {
        type: String,
        trim: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

budgetSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

budgetSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Budget', budgetSchema);
