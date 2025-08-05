const express = require('express');
const { body, query, validationResult } = require('express-validator');

// Initialize Stripe only if the secret key is properly configured
let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY && 
      process.env.STRIPE_SECRET_KEY.startsWith('sk_') && 
      process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here') {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('Stripe initialized successfully');
  } else {
    console.log('Stripe not initialized - invalid or missing API key');
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error.message);
  stripe = null;
}

const Order = require('../Order');
const AIService = require('../AIService');
const User = require('../User');
const { protect, requireKYC } = require('../auth');
const { getExchangeRate } = require('../exchangeRate');
const { sendOrderConfirmationEmail } = require('../email');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (requires KYC)
router.post('/', protect, requireKYC, [
  body('serviceId').isMongoId().withMessage('Valid service ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentProvider').isIn(['stripe', 'paypal']).withMessage('Payment provider must be stripe or paypal')
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

    const { serviceId, quantity, paymentProvider } = req.body;

    // Get the service
    const service = await AIService.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Service not found or not available'
      });
    }

    // Check if service is orderable
    if (!service.isOrderable()) {
      return res.status(400).json({
        success: false,
        error: 'Service is currently not available for ordering'
      });
    }

    // Validate quantity limits
    if (quantity < service.pricing.minimumOrder) {
      return res.status(400).json({
        success: false,
        error: `Minimum order quantity is ${service.pricing.minimumOrder}`
      });
    }

    if (service.pricing.maximumOrder && quantity > service.pricing.maximumOrder) {
      return res.status(400).json({
        success: false,
        error: `Maximum order quantity is ${service.pricing.maximumOrder}`
      });
    }

    // Calculate pricing
    const unitPriceUSD = service.pricing.unitPrice;
    const totalUSD = unitPriceUSD * quantity;
    const exchangeRate = await getExchangeRate();
    const totalToman = Math.ceil(totalUSD * exchangeRate);

    // Create order
    const order = await Order.create({
      user: req.user.id,
      service: serviceId,
      quantity,
      pricing: {
        unitPriceUSD,
        totalUSD,
        exchangeRate,
        totalToman
      },
      payment: {
        provider: paymentProvider
      },
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    });

    // Create payment intent based on provider
    let paymentIntent;
    
    if (paymentProvider === 'stripe') {
      if (!stripe) {
        return res.status(500).json({
          success: false,
          error: 'Stripe payment is not configured. Please contact support.'
        });
      }
      
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalUSD * 100), // Stripe expects cents
        currency: 'usd',
        metadata: {
          orderId: order._id.toString(),
          userId: req.user.id.toString(),
          serviceId: serviceId.toString()
        },
        description: `Order for ${service.name} - ${quantity} ${service.pricing.unit}`
      });

      order.payment.paymentIntentId = paymentIntent.id;
      await order.save();
    }

    res.status(201).json({
      success: true,
      data: {
        order,
        paymentIntent: paymentProvider === 'stripe' ? {
          clientSecret: paymentIntent.client_secret,
          id: paymentIntent.id
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, [
  query('status').optional().isIn(['pending_payment', 'payment_processing', 'paid', 'processing', 'completed', 'cancelled', 'refunded', 'failed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('service', 'name description provider pricing')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('service', 'name description provider pricing features')
      .populate('user', 'email profile');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled in its current status'
      });
    }

    // Cancel payment intent if exists
    if (order.payment.paymentIntentId && order.payment.provider === 'stripe' && stripe) {
      try {
        await stripe.paymentIntents.cancel(order.payment.paymentIntentId);
      } catch (stripeError) {
        console.error('Failed to cancel Stripe payment intent:', stripeError);
        // Continue with order cancellation even if Stripe cancellation fails
      }
    }

    order.status = 'cancelled';
    await order.addTimelineEntry('cancelled', 'Order cancelled by user', req.user.id);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Stripe webhook handler
// @route   POST /api/orders/webhook/stripe
// @access  Public (webhook)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Helper function to handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const order = await Order.findOne({
      'payment.paymentIntentId': paymentIntent.id
    }).populate('user').populate('service');

    if (!order) {
      console.error('Order not found for payment intent:', paymentIntent.id);
      return;
    }

    order.status = 'paid';
    order.payment.transactionId = paymentIntent.id;
    order.payment.paidAt = new Date();
    order.payment.paymentMethod = paymentIntent.payment_method_types[0];

    await order.save();
    await order.addTimelineEntry('paid', 'Payment completed successfully');

    // Update service statistics
    await AIService.findByIdAndUpdate(order.service._id, {
      $inc: {
        'stats.totalOrders': 1,
        'stats.totalRevenue': order.pricing.totalUSD
      }
    });

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(order.user, order);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    console.log(`Payment successful for order ${order.orderNumber}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

// Helper function to handle failed payment
const handlePaymentFailure = async (paymentIntent) => {
  try {
    const order = await Order.findOne({
      'payment.paymentIntentId': paymentIntent.id
    });

    if (!order) {
      console.error('Order not found for payment intent:', paymentIntent.id);
      return;
    }

    order.status = 'failed';
    await order.save();
    await order.addTimelineEntry('failed', 'Payment failed');

    console.log(`Payment failed for order ${order.orderNumber}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};

module.exports = router;

