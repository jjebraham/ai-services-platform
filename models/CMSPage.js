const mongoose = require('mongoose');

const cmsPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: true // Markdown content
  },
  excerpt: {
    type: String,
    maxlength: 500
  },
  metaTitle: {
    type: String,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  metaKeywords: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['page', 'post', 'faq', 'legal'],
    default: 'page'
  },
  template: {
    type: String,
    enum: ['default', 'full_width', 'sidebar', 'landing'],
    default: 'default'
  },
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  images: [{
    url: String,
    alt: String,
    caption: String,
    filename: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: Date,
  scheduledFor: Date,
  tags: [String],
  categories: [String],
  sortOrder: {
    type: Number,
    default: 0
  },
  isHomepage: {
    type: Boolean,
    default: false
  },
  showInMenu: {
    type: Boolean,
    default: false
  },
  menuOrder: {
    type: Number,
    default: 0
  },
  parentPage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CMSPage'
  },
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  seo: {
    canonicalUrl: String,
    noIndex: { type: Boolean, default: false },
    noFollow: { type: Boolean, default: false },
    openGraph: {
      title: String,
      description: String,
      image: String,
      type: { type: String, default: 'website' }
    },
    twitter: {
      card: { type: String, default: 'summary' },
      title: String,
      description: String,
      image: String
    }
  },
  analytics: {
    views: { type: Number, default: 0 },
    lastViewed: Date
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate slug
cmsPageSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Auto-generate meta title and description if not provided
  if (this.isModified('title') && !this.metaTitle) {
    this.metaTitle = this.title;
  }
  
  if (this.isModified('content') && !this.metaDescription && this.content) {
    // Extract first 160 characters from content (removing markdown)
    const plainText = this.content.replace(/[#*`_~\[\]()]/g, '').trim();
    this.metaDescription = plainText.substring(0, 160);
  }
  
  next();
});

// Pre-save middleware to ensure only one homepage
cmsPageSchema.pre('save', async function(next) {
  if (this.isHomepage && this.isModified('isHomepage')) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isHomepage: false }
    );
  }
  next();
});

// Virtual for URL
cmsPageSchema.virtual('url').get(function() {
  return `/${this.slug}`;
});

// Virtual for reading time (approximate)
cmsPageSchema.virtual('readingTime').get(function() {
  if (!this.content) return 0;
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Method to increment view count
cmsPageSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

// Method to publish page
cmsPageSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

// Method to unpublish page
cmsPageSchema.methods.unpublish = function() {
  this.status = 'draft';
  return this.save();
};

// Static method to get published pages
cmsPageSchema.statics.getPublished = function(type = null) {
  const query = { status: 'published' };
  if (type) query.type = type;
  return this.find(query).sort({ sortOrder: 1, createdAt: -1 });
};

// Static method to get menu pages
cmsPageSchema.statics.getMenuPages = function() {
  return this.find({
    status: 'published',
    showInMenu: true
  }).sort({ menuOrder: 1, title: 1 });
};

// Static method to initialize default pages
cmsPageSchema.statics.initializeDefaults = async function(adminUserId) {
  const defaultPages = [
    {
      title: 'About Us',
      slug: 'about',
      content: '# About Us\n\nWelcome to our AI Services Platform. We provide access to premium AI services from leading providers.',
      type: 'page',
      status: 'published',
      showInMenu: true,
      menuOrder: 1,
      author: adminUserId
    },
    {
      title: 'Terms of Service',
      slug: 'terms',
      content: '# Terms of Service\n\nPlease read these terms carefully before using our services.',
      type: 'legal',
      status: 'published',
      showInMenu: true,
      menuOrder: 2,
      author: adminUserId
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy',
      content: '# Privacy Policy\n\nYour privacy is important to us. This policy explains how we collect and use your data.',
      type: 'legal',
      status: 'published',
      showInMenu: true,
      menuOrder: 3,
      author: adminUserId
    },
    {
      title: 'FAQ',
      slug: 'faq',
      content: '# Frequently Asked Questions\n\n## How do I get started?\n\nSimply register for an account and complete the KYC process.',
      type: 'faq',
      status: 'published',
      showInMenu: true,
      menuOrder: 4,
      author: adminUserId
    },
    {
      title: 'Home',
      slug: 'home',
      content: '# Welcome to AI Services Platform\n\nAccess premium AI services from leading providers.',
      type: 'page',
      status: 'published',
      isHomepage: true,
      template: 'landing',
      author: adminUserId
    }
  ];
  
  for (const page of defaultPages) {
    await this.findOneAndUpdate(
      { slug: page.slug },
      page,
      { upsert: true }
    );
  }
};

// Indexes
cmsPageSchema.index({ slug: 1 });
cmsPageSchema.index({ status: 1 });
cmsPageSchema.index({ type: 1 });
cmsPageSchema.index({ publishedAt: -1 });
cmsPageSchema.index({ showInMenu: 1, menuOrder: 1 });
cmsPageSchema.index({ tags: 1 });
cmsPageSchema.index({ categories: 1 });

module.exports = mongoose.model('CMSPage', cmsPageSchema);

