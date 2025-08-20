require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { errorHandler } = require('./errorHandler');
const { notFound } = require('./notFound');
const authRoutes = require('./routes/auth-routes');

const app = express();

console.log('Database: Using Supabase for authentication');

// Trust proxy (required when running behind Cloudflare/Nginx)
app.set('trust proxy', 1);

// 1) CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://kiani.exchange',
  'https://www.kiani.exchange',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true);
    },
    credentials: true,
  })
);

// 2) Security headers (CSP allows Supabase + Google + Stripe)
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: [
          "'self'",
          'https://accounts.google.com',
          'https://apis.google.com',
          'https://js.stripe.com',
        ],
        connectSrc: [
          "'self'",
          'https://api.stripe.com',
          'https://accounts.google.com',
          'https://apis.google.com',
          'https://*.supabase.co',
          'wss://*.supabase.co',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com', 'https://accounts.google.com'],
      },
    },
  })
);

// 3) Body parsing (must be before rate limiter)
app.use(
  express.json({
    type: ['application/json', 'application/*+json', 'text/plain'],
    limit: '10mb',
    strict: false,
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Normalize string bodies (fixes cases where body is a JSON string or quoted email)
app.use((req, _res, next) => {
  if (typeof req.body === 'string') {
    const raw = req.body;
    try {
      req.body = JSON.parse(raw);
    } catch {
      const m = raw.match(/^"(.+@.+)"$/);
      if (m) req.body = { email: m[1] };
    }
  }
  next();
});

// 4) Rate limiting (after parsing)
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// 5) Logging + compression
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 6) API routes
app.use('/api/auth', authRoutes);

// 7) Serve authentication pages
app.get(['/auth', '/auth/login', '/auth/register'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public/auth/index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/auth/dashboard.html'));
});

// 8) Static frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 9) Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

