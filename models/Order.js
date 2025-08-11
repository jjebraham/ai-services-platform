const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIService',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricing: {
    unitPriceUSD: {
      type: Number,
      required: true
    },
    totalUSD: {
      type: Number,
      required: true
    },
    exchangeRate: {
      type: Number,
      required: true // USD to Toman rate at time of order
    },
    totalToman: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: [
      'pending_payment',
      'payment_processing',
      'paid',
      'processing',
      'completed',
      'cancelled',
      'refunded',
      'failed'
    ],
    default: 'pending_payment'
  },
  payment: {
    provider: {
      type: String,
      enum: ['stripe', 'paypal'],
      required: true
    },
    paymentIntentId: String, // Stripe Payment Intent ID or PayPal Order ID
    transactionId: String, // Final transaction ID after payment
    paymentMethod: String, // card, bank_transfer, etc.
    paidAt: Date,
    refundId: String,
    refundedAt: Date,
    refundAmount: Number
  },
  delivery: {
    method: {
      type: String,
      enum: ['api_access', 'email', 'dashboard'],
      default: 'dashboard'
    },
    deliveredAt: Date,
    accessCredentials: {
      apiKey: String,
      endpoint: String,
      expiresAt: Date
    },
    downloadLinks: [{
      name: String,
      url: String,
      expiresAt: Date
    }]
  },
  notes: {
    customerNote: String,
    adminNote: String,
    internalNote: String
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Find the last order of the day
    const lastOrder = await this.constructor.findOne({
      orderNumber: new RegExp(`^${year}${month}${day}`)
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to add timeline entry
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`
    });
  }
  next();
});

// Virtual for formatted total in Toman
orderSchema.virtual('formattedTotalToman').get(function() {
  return new Intl.NumberFormat('fa-IR', {
    style: 'currency',
    currency: 'IRR'
  }).format(this.pricing.totalToman);
});

// Virtual for formatted total in USD
orderSchema.virtual('formattedTotalUSD').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.pricing.totalUSD);
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending_payment', 'payment_processing'].includes(this.status);
};

// Method to check if order can be refunded
orderSchema.methods.canBeRefunded = function() {
  return ['paid', 'processing', 'completed'].includes(this.status) && !this.payment.refundedAt;
};

// Method to add timeline entry
orderSchema.methods.addTimelineEntry = function(status, note, updatedBy) {
  this.timeline.push({
    status,
    note,
    updatedBy,
    timestamp: new Date()
  });
  return this.save();
};

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ service: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.paymentIntentId': 1 });
orderSchema.index({ 'payment.transactionId': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.paidAt': -1 });

module.exports = mongoose.model('Order', orderSchema);

