const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: () => `TXN_${uuidv4().substring(0, 8).toUpperCase()}`
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'internal_transfer', 'interbank_transfer']
  },
  fromAccount: {
    type: String,
    default: null
  },
  toAccount: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'TND'
  },
  fees: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  },
  reference: {
    type: String,
    default: null
  },
  securityLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  fraudFlag: {
    type: Boolean,
    default: false
  }
});

// Add static methods to match previous interface where possible
transactionSchema.statics.findByAccountId = function (accountId) {
  return this.find({
    $or: [{ fromAccount: accountId }, { toAccount: accountId }]
  });
};

transactionSchema.statics.deleteById = function (transactionId) {
  return this.deleteOne({ transactionId });
};

// Ensure toJSON returns a clean object
transactionSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
