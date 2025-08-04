const mongoose = require('mongoose');
const crypto = require('crypto');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array', 'encrypted'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'payment',
      'exchange_rate',
      'email',
      'security',
      'general',
      'notifications',
      'api_keys',
      'cms'
    ]
  },
  description: String,
  isPublic: {
    type: Boolean,
    default: false // Whether this setting can be accessed by frontend
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Encryption key for sensitive data
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || 'default-key-change-in-production';

// Method to encrypt sensitive values
settingsSchema.methods.encryptValue = function(value) {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(JSON.stringify(value), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// Method to decrypt sensitive values
settingsSchema.methods.decryptValue = function(encryptedValue) {
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error('Failed to decrypt value');
  }
};

// Pre-save middleware to handle encryption
settingsSchema.pre('save', function(next) {
  if (this.type === 'encrypted' && this.isModified('value')) {
    this.value = this.encryptValue(this.value);
  }
  next();
});

// Virtual to get decrypted value for encrypted settings
settingsSchema.virtual('decryptedValue').get(function() {
  if (this.type === 'encrypted') {
    return this.decryptValue(this.value);
  }
  return this.value;
});

// Static method to get setting value
settingsSchema.statics.getValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  if (!setting) return defaultValue;
  
  if (setting.type === 'encrypted') {
    return setting.decryptedValue;
  }
  return setting.value;
};

// Static method to set setting value
settingsSchema.statics.setValue = async function(key, value, type = 'string', category = 'general', userId = null) {
  const setting = await this.findOneAndUpdate(
    { key },
    {
      value,
      type,
      category,
      lastModifiedBy: userId
    },
    { upsert: true, new: true }
  );
  return setting;
};

// Static method to get all public settings
settingsSchema.statics.getPublicSettings = async function() {
  const settings = await this.find({ isPublic: true });
  const result = {};
  
  settings.forEach(setting => {
    result[setting.key] = setting.type === 'encrypted' ? setting.decryptedValue : setting.value;
  });
  
  return result;
};

// Static method to initialize default settings
settingsSchema.statics.initializeDefaults = async function() {
  const defaults = [
    // Payment settings
    {
      key: 'stripe_publishable_key',
      value: '',
      type: 'string',
      category: 'payment',
      description: 'Stripe publishable key',
      isPublic: true
    },
    {
      key: 'stripe_secret_key',
      value: '',
      type: 'encrypted',
      category: 'payment',
      description: 'Stripe secret key'
    },
    {
      key: 'paypal_client_id',
      value: '',
      type: 'string',
      category: 'payment',
      description: 'PayPal client ID',
      isPublic: true
    },
    {
      key: 'paypal_client_secret',
      value: '',
      type: 'encrypted',
      category: 'payment',
      description: 'PayPal client secret'
    },
    
    // Exchange rate settings
    {
      key: 'exchange_rate_api_key',
      value: '',
      type: 'encrypted',
      category: 'exchange_rate',
      description: 'API key for USD to Toman exchange rate'
    },
    {
      key: 'exchange_rate_api_url',
      value: 'https://api.exchangerate-api.com/v4/latest/USD',
      type: 'string',
      category: 'exchange_rate',
      description: 'API URL for exchange rate'
    },
    {
      key: 'exchange_rate_cache_duration',
      value: 300, // 5 minutes
      type: 'number',
      category: 'exchange_rate',
      description: 'Cache duration for exchange rate in seconds'
    },
    
    // Email settings
    {
      key: 'smtp_host',
      value: '',
      type: 'string',
      category: 'email',
      description: 'SMTP host'
    },
    {
      key: 'smtp_port',
      value: 587,
      type: 'number',
      category: 'email',
      description: 'SMTP port'
    },
    {
      key: 'smtp_username',
      value: '',
      type: 'string',
      category: 'email',
      description: 'SMTP username'
    },
    {
      key: 'smtp_password',
      value: '',
      type: 'encrypted',
      category: 'email',
      description: 'SMTP password'
    },
    {
      key: 'email_from_address',
      value: 'noreply@aiservices.com',
      type: 'string',
      category: 'email',
      description: 'From email address'
    },
    {
      key: 'email_from_name',
      value: 'AI Services Platform',
      type: 'string',
      category: 'email',
      description: 'From name'
    },
    
    // General settings
    {
      key: 'site_name',
      value: 'AI Services Platform',
      type: 'string',
      category: 'general',
      description: 'Site name',
      isPublic: true
    },
    {
      key: 'site_description',
      value: 'Access premium AI services through our platform',
      type: 'string',
      category: 'general',
      description: 'Site description',
      isPublic: true
    },
    {
      key: 'support_email',
      value: 'support@aiservices.com',
      type: 'string',
      category: 'general',
      description: 'Support email address',
      isPublic: true
    },
    {
      key: 'maintenance_mode',
      value: false,
      type: 'boolean',
      category: 'general',
      description: 'Maintenance mode',
      isPublic: true
    }
  ];
  
  for (const setting of defaults) {
    await this.findOneAndUpdate(
      { key: setting.key },
      setting,
      { upsert: true }
    );
  }
};

// Indexes
settingsSchema.index({ key: 1 });
settingsSchema.index({ category: 1 });
settingsSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Settings', settingsSchema);

