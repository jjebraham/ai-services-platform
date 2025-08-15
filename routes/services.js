const express = require('express');
const { query, validationResult } = require('express-validator');
const AIService = require('../models/AIService');
const { optionalAuth, protect, authorize } = require('../middleware/auth');
const { getExchangeRate } = require('../utils/exchangeRate');

const router = express.Router();

// @desc    Get all services
// @route   GET /api/services
// @access  Public
router.get('/', optionalAuth, [
  query('category').optional().isIn(['language_model', 'image_generation', 'code_execution', 'data_analysis', 'other']),
  query('provider').optional().isString(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sortBy').optional().isIn(['name', 'price', 'provider', 'createdAt', 'popularity']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      category,
      provider,
      search,
      page = 1,
      limit = 10,
      sortBy = 'sortOrder',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (provider) {
      query.provider = new RegExp(provider, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort
    const sort = {};
    if (sortBy === 'price') {
      sort['pricing.unitPrice'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'popularity') {
      sort['stats.totalOrders'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const services = await AIService.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-apiKey'); // Don't expose API keys

    const total = await AIService.countDocuments(query);

    // Get exchange rate for price conversion
    const exchangeRate = await getExchangeRate();

    // Add Toman prices to services
    const servicesWithTomanPrices = services.map(service => {
      const serviceObj = service.toObject();
      serviceObj.pricing.tomanPrice = Math.ceil(serviceObj.pricing.unitPrice * exchangeRate);
      return serviceObj;
    });

    res.status(200).json({
      success: true,
      data: servicesWithTomanPrices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      exchangeRate
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get service by slug
// @route   GET /api/services/:slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const service = await AIService.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    }).select('-apiKey');

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Get exchange rate for price conversion
    const exchangeRate = await getExchangeRate();
    
    const serviceObj = service.toObject();
    serviceObj.pricing.tomanPrice = Math.ceil(serviceObj.pricing.unitPrice * exchangeRate);

    res.status(200).json({
      success: true,
      data: serviceObj,
      exchangeRate
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get service categories
// @route   GET /api/services/meta/categories
// @access  Public
router.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await AIService.distinct('category', { isActive: true });
    
    const categoryInfo = categories.map(category => {
      const displayName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        value: category,
        label: displayName
      };
    });

    res.status(200).json({
      success: true,
      data: categoryInfo
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get service providers
// @route   GET /api/services/meta/providers
// @access  Public
router.get('/meta/providers', async (req, res, next) => {
  try {
    const providers = await AIService.distinct('provider', { isActive: true });

    res.status(200).json({
      success: true,
      data: providers
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get service statistics
// @route   GET /api/services/meta/stats
// @access  Public
router.get('/meta/stats', async (req, res, next) => {
  try {
    const stats = await AIService.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          totalOrders: { $sum: '$stats.totalOrders' },
          totalRevenue: { $sum: '$stats.totalRevenue' },
          averagePrice: { $avg: '$pricing.unitPrice' }
        }
      }
    ]);

    const categoryStats = await AIService.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalOrders: { $sum: '$stats.totalOrders' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalServices: 0,
          totalOrders: 0,
          totalRevenue: 0,
          averagePrice: 0
        },
        categories: categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

