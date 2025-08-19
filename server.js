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

// Trust proxy
app.set('trust proxy', 1);

// 1. CORS first
app.use(cors({
  origin: ['https://kiani.exchange', 'https://www.kiani.exchange', 'http://localhost:3000'],
  credentials: true
}));

// 2. Security Headers with CSP allowing Supabase and required providers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://apis.google.com",
        "https://js.stripe.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://accounts.google.com",
        "https://apis.google.com",
        "https://*.supabase.co",
        "wss://*.supabase.co"
      ],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://accounts.google.com"
      ]
    }
  }
}));

// 3. BODY PARSING (MUST be before rate limiter!)
app.use(express.json({ 
  type: ['application/json', 'application/*+json', 'text/plain'], 
  limit: '10mb' 
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. Rate limiting (AFTER body parsing)
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
}));

// 5. Logging
app.use(compression());
app.use(morgan('combined'));

// 6. API Routes (Post body is parsed!)
app.use('/api/auth', authRoutes);

// 7. Back-compat redirects for old auth paths
app.get(['/auth/login', '/auth/register'], (req, res) => {
  res.redirect(301, req.path.replace('/auth/', '/'));
});

// 8. Frontend serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

// 9. Error handling (AFTER routes)
app.use(notFound);
app.use(errorHandler);

// Bind to ALL interfaces (CRITICAL!)
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('Server running at http://' + HOST + ':' + PORT);
});
