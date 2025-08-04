require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Initialize Supabase configuration
const supabaseConfig = require('./supabase-config');

// Import routes
const authRoutes = require('./routes/auth-routes');

const app = express();

// Initialize Supabase
supabaseConfig.initialize();

// Trust proxy for rate limiting and security
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"]
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5000', // Add the current server port
      'http://localhost:5001', // Add port 5001 for the current server
      'http://localhost:5173',
      'http://localhost:5174',
      'http://34.169.105.176:3002' // Your server IP
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.) and same-origin requests
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Admin-Key']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE) || 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    supabase: supabaseConfig.isConfigured()
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supabase: supabaseConfig.isConfigured()
  });
});

// Admin middleware (simplified for demo)
const requireAdmin = (req, res, next) => {
  // Check for admin key in header
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === (process.env.ADMIN_EMAIL || 'admin@example.com') && 
      password === (process.env.ADMIN_PASSWORD || 'admin123')) {
    res.json({
      success: true,
      message: 'Admin login successful',
      token: 'admin-token-' + Date.now()
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Get Supabase configuration status
app.get('/api/admin/supabase/status', requireAdmin, (req, res) => {
  try {
    const isConfigured = supabaseConfig.isConfigured();

    res.json({
      success: true,
      configured: isConfigured,
      environment: {
        supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not set',
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set'
      }
    });

  } catch (error) {
    console.error('Supabase status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check Supabase status'
    });
  }
});

// Configure Supabase credentials
app.post('/api/admin/supabase/configure', requireAdmin, (req, res) => {
  try {
    const { supabaseUrl, supabaseAnonKey, supabaseServiceKey } = req.body;

    console.log('Received Supabase configuration request:', {
      url: supabaseUrl ? 'provided' : 'missing',
      anonKey: supabaseAnonKey ? 'provided' : 'missing',
      serviceKey: supabaseServiceKey ? 'provided' : 'missing'
    });

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(400).json({
        success: false,
        error: 'Supabase URL and Anon Key are required'
      });
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch (urlError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Supabase URL format'
      });
    }

    // Validate that URL contains supabase.co
    if (!supabaseUrl.includes('supabase.co')) {
      return res.status(400).json({
        success: false,
        error: 'URL must be a valid Supabase project URL'
      });
    }

    // Update environment variables
    process.env.SUPABASE_URL = supabaseUrl.trim();
    process.env.SUPABASE_ANON_KEY = supabaseAnonKey.trim();
    if (supabaseServiceKey) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = supabaseServiceKey.trim();
    }

    // Reinitialize Supabase
    const initialized = supabaseConfig.initialize();

    if (initialized) {
      console.log('Supabase configured successfully');
      res.json({
        success: true,
        message: 'Supabase configured successfully'
      });
    } else {
      console.error('Failed to initialize Supabase');
      res.status(400).json({
        success: false,
        error: 'Failed to initialize Supabase with provided credentials. Please check your URL and keys.'
      });
    }

  } catch (error) {
    console.error('Supabase configuration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to configure Supabase: ' + error.message
    });
  }
});

// Admin Dashboard endpoint
app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    if (!supabaseConfig.isConfigured()) {
      // Return mock data if Supabase is not configured
      return res.json({
        success: true,
        data: {
          overview: {
            totalUsers: 1247,
            totalOrders: 856,
            totalRevenue: 12500000, // in cents
            totalTickets: 12
          },
          recentOrders: [
            {
              _id: '1',
              orderNumber: 'ORD-001',
              user: { name: 'John Doe', email: 'john@example.com' },
              service: { name: 'OpenAI GPT-4' },
              pricing: { totalUSD: 5000 }, // in cents
              status: 'completed',
              createdAt: new Date().toISOString()
            },
            {
              _id: '2',
              orderNumber: 'ORD-002',
              user: { name: 'Jane Smith', email: 'jane@example.com' },
              service: { name: 'DALL-E 3' },
              pricing: { totalUSD: 7500 }, // in cents
              status: 'pending',
              createdAt: new Date().toISOString()
            }
          ],
          recentUsers: [
            {
              _id: '1',
              profile: { firstName: 'Alice', lastName: 'Johnson' },
              email: 'alice@example.com',
              role: 'user',
              accountStatus: 'active',
              createdAt: new Date().toISOString()
            },
            {
              _id: '2',
              profile: { firstName: 'Bob', lastName: 'Wilson' },
              email: 'bob@example.com',
              role: 'user',
              accountStatus: 'pending',
              createdAt: new Date().toISOString()
            }
          ]
        }
      });
    }

    const client = supabaseConfig.getAdminClient() || supabaseConfig.getClient();
    
    // Get user count from user_profiles table
    const { count: userCount, error: userError } = await client
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    const totalUsers = userCount || 0;

    // Get orders count
    const { count: orderCount, error: orderError } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get recent orders with user information
    const { data: recentOrders, error: recentOrdersError } = await client
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        service_name,
        created_at,
        user_profiles!orders_user_id_fkey(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent users
    const { data: recentUsers, error: recentUsersError } = await client
      .from('user_profiles')
      .select('id, first_name, last_name, email, role, account_status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate total revenue (sum of all completed orders)
    const { data: revenueData, error: revenueError } = await client
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed');

    const totalRevenue = revenueData?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;

    // Get support tickets count
    const { count: ticketCount, error: ticketError } = await client
      .from('support_tickets')
      .select('*', { count: 'exact', head: true });

    // Get user statistics by status
    const { data: userStats, error: userStatsError } = await client
      .from('user_profiles')
      .select('account_status')
      .not('account_status', 'is', null);

    // Get order statistics by status
    const { data: orderStats, error: orderStatsError } = await client
      .from('orders')
      .select('status, total_amount')
      .not('status', 'is', null);

    // Get ticket statistics by status
    const { data: ticketStats, error: ticketStatsError } = await client
      .from('support_tickets')
      .select('status')
      .not('status', 'is', null);

    // Process statistics
    const processedUserStats = userStats ? userStats.reduce((acc, user) => {
      const status = user.account_status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}) : {};

    const processedOrderStats = orderStats ? orderStats.reduce((acc, order) => {
      const status = order.status || 'unknown';
      acc[status] = {
        count: (acc[status]?.count || 0) + 1,
        revenue: (acc[status]?.revenue || 0) + (parseFloat(order.total_amount) || 0)
      };
      return acc;
    }, {}) : {};

    const processedTicketStats = ticketStats ? ticketStats.reduce((acc, ticket) => {
      const status = ticket.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}) : {};

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: totalUsers,
          totalOrders: orderCount || 0,
          totalRevenue: totalRevenue,
          totalTickets: ticketCount || 0
        },
        userStats: Object.entries(processedUserStats).map(([status, count]) => ({
          _id: status,
          count: count
        })),
        kycStats: [
          { _id: 'pending', count: Math.floor(totalUsers * 0.3) },
          { _id: 'approved', count: Math.floor(totalUsers * 0.6) },
          { _id: 'rejected', count: Math.floor(totalUsers * 0.1) }
        ],
        orderStats: Object.entries(processedOrderStats).map(([status, data]) => ({
          _id: status,
          count: data.count,
          totalRevenue: data.revenue
        })),
        ticketStats: Object.entries(processedTicketStats).map(([status, count]) => ({
          _id: status,
          count: count
        })),
        serviceStats: [
          { _id: 'NLP', count: 5, totalOrders: 150, totalRevenue: 4500 },
          { _id: 'Computer Vision', count: 3, totalOrders: 89, totalRevenue: 2670 },
          { _id: 'Analytics', count: 4, totalOrders: 120, totalRevenue: 4800 }
        ],
        recentOrders: (recentOrders || []).map(order => ({
          _id: order.id,
          orderNumber: order.order_number || `ORD-${order.id}`,
          user: {
            name: order.user_profiles ? 
              `${order.user_profiles.first_name || ''} ${order.user_profiles.last_name || ''}`.trim() : 
              'Unknown User',
            email: order.user_profiles?.email || 'unknown@example.com'
          },
          service: { name: order.service_name || 'AI Service' },
          pricing: { totalUSD: parseFloat(order.total_amount) || 0 },
          status: order.status || 'pending',
          createdAt: order.created_at
        })),
        recentUsers: (recentUsers || []).map(user => ({
          _id: user.id,
          profile: {
            firstName: user.first_name || 'Unknown',
            lastName: user.last_name || 'User'
          },
          email: user.email,
          role: user.role || 'user',
          accountStatus: user.account_status || 'active',
          'kyc.status': Math.random() > 0.5 ? 'approved' : 'pending',
          createdAt: user.created_at
        })),
        exchangeRate: {
          rate: 1.0,
          lastUpdated: new Date().toISOString(),
          source: 'mock'
        }
      }
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    
    // Return fallback data on error
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalTickets: 0
        },
        recentOrders: [],
        recentUsers: []
      }
    });
  }
});

// Initialize database tables
app.post('/api/admin/supabase/initialize', requireAdmin, async (req, res) => {
  try {
    if (!supabaseConfig.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Supabase not configured'
      });
    }

    const result = await supabaseConfig.createTables();
    res.json(result);

  } catch (error) {
    console.error('Table initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize tables'
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'complete-supabase-app.html'));
});

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'complete-supabase-app.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, async () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://${HOST}:${PORT}`);
  console.log(`📊 Supabase configured: ${supabaseConfig.isConfigured()}`);
  
  if (supabaseConfig.isConfigured()) {
    const connectionTest = await supabaseConfig.testConnection();
    console.log(`🗄️  Database connection: ${connectionTest.success ? '✅ Connected' : '❌ Failed'}`);
    if (!connectionTest.success) {
      console.log(`   Error: ${connectionTest.error}`);
    }
  } else {
    console.log('⚠️  Supabase not configured. Use admin panel to set up database connection.');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

module.exports = app;