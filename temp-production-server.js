import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import supabaseConfig from './supabase-config.js';
import authRoutes from './auth-routes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'https://kiani.exchange',
    'http://kiani.exchange',
    'https://34.169.105.176',
    'http://34.169.105.176',
    'https://34.169.105.176:3000',
    'http://34.169.105.176:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    supabase: supabaseConfig.isConfigured()
  });
});

// API endpoint to get exchange rates
app.get('/api/exchange-rates', (req, res) => {
  // Mock exchange rates - in production, fetch from a real API
  const rates = {
    USD: 1.0,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.0,
    IRR: 42000.0
  };
  
  res.json({
    success: true,
    rates,
    timestamp: new Date().toISOString()
  });
});

// Generate a 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP endpoints
app.post('/api/otp/start', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    console.log(`Generated OTP for ${phone}: ${verificationCode}`);
    
    // Store verification data temporarily (in production, use Redis or database)
    const tempData = {
      phone,
      verificationCode,
      timestamp: Date.now()
    };

    // In production, store in Redis with TTL
    global.verificationStore = global.verificationStore || {};
    global.verificationStore[phone] = tempData;

    // Import SMS service dynamically
    const smsService = await import('./services/sms-service.js').then(m => m.default);
    
    // Send SMS
    const smsResult = await smsService.sendOTP(phone, verificationCode);
    
    if (smsResult.success) {
      res.json({
        success: true,
        message: 'Verification code sent successfully',
        reference: smsResult.reference
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send verification code'
      });
    }

  } catch (error) {
    console.error('OTP start error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/otp/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and OTP are required'
      });
    }

    // Get stored verification data
    global.verificationStore = global.verificationStore || {};
    const storedData = global.verificationStore[phone];

    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: 'No verification request found for this phone number'
      });
    }

    // Check if OTP is expired (5 minutes)
    const isExpired = Date.now() - storedData.timestamp > 5 * 60 * 1000;
    if (isExpired) {
      delete global.verificationStore[phone];
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired'
      });
    }

    // Verify OTP
    if (storedData.verificationCode !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    // OTP is valid, clean up
    delete global.verificationStore[phone];

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      token: 'temp-' + Date.now() // Temporary token for registration completion
    });

  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// API routes for services, users, orders, etc.
app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    services: [
      {
        id: 1,
        name: 'AI Content Generation',
        description: 'Generate high-quality content using AI',
        price: 29.99,
        category: 'AI Services'
      },
      {
        id: 2,
        name: 'Data Analysis',
        description: 'Advanced data analysis and insights',
        price: 49.99,
        category: 'Analytics'
      },
      {
        id: 3,
        name: 'API Integration',
        description: 'Custom API integration services',
        price: 99.99,
        category: 'Development'
      }
    ]
  });
});

// Catch-all handler: send back React's index.html file for SPA routing
app.get('*', (req, res) => {
  // Check if it's an API request
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'API endpoint not found'
    });
  }
  
  // For all other routes, serve the React app
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  const publicIndex = path.join(__dirname, 'public', 'index.html');
  const rootIndex = path.join(__dirname, 'index.html');
  const fs = require('fs');

  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  if (fs.existsSync(publicIndex)) {
    return res.sendFile(publicIndex);
  }
  return res.sendFile(rootIndex);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation'
    });
  }
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Production server running on http://${HOST}:${PORT}`);
  console.log(`🌐 Domain: kiani.exchange`);
  console.log(`📍 IP: 34.169.105.176:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔐 Supabase configured: ${supabaseConfig.isConfigured()}`);
  if (process.send) {
    process.send('ready'); // Notify PM2 that app is ready when wait_ready is enabled
  }
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  // Force exit if server doesn't close within 5s
  setTimeout(() => {
    console.warn('Force exiting after timeout');
    process.exit(1);
  }, 5000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
// Allow PM2 to send shutdown message
process.on('message', (msg) => {
  if (msg === 'shutdown') shutdown('PM2 shutdown');
});