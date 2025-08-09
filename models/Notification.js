const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'order_created',
      'order_paid',
      'order_completed',
      'order_cancelled',
      'order_refunded',
      'kyc_submitted',
      'kyc_approved',
      'kyc_rejected',
      'ticket_created',
      'ticket_replied',
      'ticket_resolved',
      'account_suspended',
      'account_reactivated',
      'password_reset',
      'email_verification',
      'low_balance',
      'system_maintenance',
      'marketing'
    ]
  },
  channel: {
    type: String,
    enum: ['email', 'in_app', 'sms'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  htmlContent: String, // For rich email content
  data: {
    type: mongoose.Schema.Types.Mixed, // Additional data for the notification
    default: {}
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Order', 'SupportTicket', 'User', 'AIService']
    },
    entityId: mongoose.Schema.Types.ObjectId
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  failureReason: String,
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  metadata: {
    emailProvider: String, // 'nodemailer', 'sendgrid', etc.
    messageId: String, // Provider's message ID
    templateId: String,
    variables: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Pre-save middleware to set sent timestamp
notificationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }
  if (this.isModified('status') && this.status === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Method to retry sending
notificationSchema.methods.retry = function() {
  if (this.retryCount < this.maxRetries) {
    this.retryCount += 1;
    this.status = 'pending';
    this.failureReason = undefined;
    return this.save();
  }
  return Promise.reject(new Error('Maximum retry attempts reached'));
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  return new this(data).save();
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    channel: 'in_app',
    status: { $in: ['sent', 'delivered'] }
  });
};

// Indexes
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ channel: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });

module.exports = mongoose.model('Notification', notificationSchema);

