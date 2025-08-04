const mongoose = require('mongoose');

const aiServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  longDescription: {
    type: String // Markdown content for detailed description
  },
  category: {
    type: String,
    required: true,
    enum: ['language_model', 'image_generation', 'code_execution', 'data_analysis', 'other']
  },
  provider: {
    type: String,
    required: true // e.g., 'OpenAI', 'DeepSeek', 'Anthropic'
  },
  pricing: {
    unitPrice: {
      type: Number,
      required: true // Price in USD
    },
    unit: {
      type: String,
      required: true // e.g., 'per 1000 tokens', 'per request', 'per minute'
    },
    minimumOrder: {
      type: Number,
      default: 1
    },
    maximumOrder: {
      type: Number,
      default: null // null means no limit
    }
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'limited', 'unavailable', 'maintenance'],
      default: 'available'
    },
    statusMessage: String, // Optional message about availability
    estimatedRestoreTime: Date // For maintenance or unavailable services
  },
  features: [{
    name: String,
    description: String,
    included: { type: Boolean, default: true }
  }],
  apiEndpoint: {
    type: String,
    required: true
  },
  apiKey: String, // Encrypted API key for the service
  rateLimits: {
    requestsPerMinute: Number,
    requestsPerHour: Number,
    requestsPerDay: Number
  },
  metadata: {
    version: String,
    lastUpdated: Date,
    documentation: String, // URL to documentation
    supportContact: String
  },
  images: [{
    url: String,
    alt: String,
    type: { type: String, enum: ['logo', 'screenshot', 'demo'] }
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  stats: {
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Virtual for formatted price
aiServiceSchema.virtual('formattedPrice').get(function() {
  return `$${this.pricing.unitPrice.toFixed(2)} ${this.pricing.unit}`;
});

// Pre-save middleware to generate slug
aiServiceSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Method to check if service is orderable
aiServiceSchema.methods.isOrderable = function() {
  return this.isActive && this.availability.status === 'available';
};

// Method to calculate price in Toman
aiServiceSchema.methods.calculateTomanPrice = function(exchangeRate, quantity = 1) {
  const usdTotal = this.pricing.unitPrice * quantity;
  return Math.ceil(usdTotal * exchangeRate);
};

// Indexes
aiServiceSchema.index({ slug: 1 });
aiServiceSchema.index({ category: 1 });
aiServiceSchema.index({ provider: 1 });
aiServiceSchema.index({ 'availability.status': 1 });
aiServiceSchema.index({ isActive: 1 });
aiServiceSchema.index({ sortOrder: 1 });
aiServiceSchema.index({ tags: 1 });
aiServiceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AIService', aiServiceSchema);

