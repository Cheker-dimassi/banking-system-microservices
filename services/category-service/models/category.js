const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryId: {
        type: String,
        required: true,
        unique: true,
        default: () => `CAT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
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
        enum: ['income', 'expense', 'transfer', 'other'],
        default: 'other'
    },
    color: {
        type: String,
        default: '#6B7280' // Default gray color
    },
    icon: {
        type: String,
        default: '📁'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageCount: {
        type: Number,
        default: 0
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

// Update updatedAt before saving
categorySchema.pre('save', function() {
    this.updatedAt = Date.now();
});

// Index for faster queries
categorySchema.index({ name: 1 });
categorySchema.index({ type: 1 });
categorySchema.index({ isActive: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
