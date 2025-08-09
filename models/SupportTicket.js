const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: [
      'technical_support',
      'billing',
      'account',
      'kyc',
      'order_issue',
      'feature_request',
      'bug_report',
      'general_inquiry',
      'other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'],
    default: 'open'
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin user
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  tags: [String],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderType: {
      type: String,
      enum: ['user', 'admin'],
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 5000
    },
    isInternal: {
      type: Boolean,
      default: false // Internal notes only visible to admins
    },
    attachments: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number
    }],
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: { type: Date, default: Date.now }
    }],
    timestamp: { type: Date, default: Date.now }
  }],
  resolution: {
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionNote: String,
    customerSatisfaction: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: String,
      submittedAt: Date
    }
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'email', 'api'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String,
    lastActivity: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate ticket number
supportTicketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Find the last ticket of the month
    const lastTicket = await this.constructor.findOne({
      ticketNumber: new RegExp(`^TK${year}${month}`)
    }).sort({ ticketNumber: -1 });
    
    let sequence = 1;
    if (lastTicket) {
      const lastSequence = parseInt(lastTicket.ticketNumber.slice(-5));
      sequence = lastSequence + 1;
    }
    
    this.ticketNumber = `TK${year}${month}${sequence.toString().padStart(5, '0')}`;
  }
  next();
});

// Pre-save middleware to update last activity
supportTicketSchema.pre('save', function(next) {
  if (this.isModified('messages') || this.isModified('status')) {
    this.metadata.lastActivity = new Date();
  }
  next();
});

// Virtual for unread messages count
supportTicketSchema.virtual('unreadCount').get(function() {
  // This would need to be calculated based on the current user
  return this.messages.filter(msg => 
    !msg.readBy.some(read => read.user.toString() === this.user.toString())
  ).length;
});

// Virtual for last message
supportTicketSchema.virtual('lastMessage').get(function() {
  return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
});

// Method to add a message
supportTicketSchema.methods.addMessage = function(senderId, senderType, message, isInternal = false, attachments = []) {
  this.messages.push({
    sender: senderId,
    senderType,
    message,
    isInternal,
    attachments,
    timestamp: new Date()
  });
  
  // Update status if it was resolved/closed and customer responds
  if (senderType === 'user' && ['resolved', 'closed'].includes(this.status)) {
    this.status = 'open';
  }
  
  return this.save();
};

// Method to mark messages as read
supportTicketSchema.methods.markAsRead = function(userId) {
  this.messages.forEach(message => {
    if (!message.readBy.some(read => read.user.toString() === userId.toString())) {
      message.readBy.push({ user: userId, readAt: new Date() });
    }
  });
  return this.save();
};

// Method to resolve ticket
supportTicketSchema.methods.resolve = function(resolvedBy, resolutionNote) {
  this.status = 'resolved';
  this.resolution.resolvedAt = new Date();
  this.resolution.resolvedBy = resolvedBy;
  this.resolution.resolutionNote = resolutionNote;
  return this.save();
};

// Indexes
supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ user: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ assignedTo: 1 });
supportTicketSchema.index({ relatedOrder: 1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ 'metadata.lastActivity': -1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);

