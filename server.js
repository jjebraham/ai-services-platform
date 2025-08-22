require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import middleware
const { errorHandler } = require('./errorHandler');
const { notFound } = require('./notFound');

// Import routes
const authRoutes = require('./routes/auth-routes');
const adminRoutes = require('./admin-routes');

const app = express();

console.log('💾 Database: Using Supabase for authentication');

// Trust proxy for rate limiting and security (essential for services like Cloudflare/nginx)
app.set('trust proxy', 1);

// --- Middleware Configuration (Correct Order) ---

// 1. CORS (Cross-Origin Resource Sharing)
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://kiani.exchange',
      'https://www.kiani.exchange'
    ];
    
    // Debug logging
    console.log('CORS check - Origin:', origin);
    console.log('CORS check - Allowed origins:', allowedOrigins);
    
    // Allow requests with no origin (e.g., mobile apps, Postman)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      callback(null, true);
      return;
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Allowing origin:', origin);
      callback(null, true);
      return;
    }
    
    // More permissive check - allow any origin that contains kiani.exchange
    if (origin.includes('kiani.exchange') || origin.includes('localhost')) {
      console.log('CORS: Allowing similar origin:', origin);
      callback(null, true);
      return;
    }
    
    console.log('CORS: Blocking origin:', origin);
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};
app.use(cors(corsOptions));

// 2. Security Headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://accounts.google.com", "https://apis.google.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://accounts.google.com", "https://apis.google.com", process.env.SUPABASE_URL],
      frameSrc: ["'self'", "https://js.stripe.com", "https://accounts.google.com"]
    }
  }
}));

// 3. Body Parsing Middleware (CRITICAL: MUST be before routes and rate limiter)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. Rate Limiting (Applied after body is parsed)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// 5. Compression and Logging
app.use(compression());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Root route for development
app.get('/', (req, res) => {
  res.json({
    message: 'AI Services Platform API',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// --- Frontend Serving (for Production) ---
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  
  // Legacy auth path redirects
  app.get(['/auth/login', '/auth/register'], (req, res) => {
    const target = req.path.includes('login') ? '/login' : '/register';
    res.redirect(301, target);
  });

  app.get('*', (req, res) => {
    // Do not swallow API routes with SPA catch-all
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Server Startup ---
const PORT = process.env.PORT || 3000; // Ensure port is 3000
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on http://${HOST}:${PORT}`);
  console.log('✅ Application ready - Supabase authentication enabled');
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;

