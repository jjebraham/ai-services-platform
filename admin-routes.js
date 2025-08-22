const express = require('express');
const router = express.Router();
const supabaseConfig = require('../supabase-config');

// Admin middleware (simplified for demo)
const requireAdmin = (req, res, next) => {
  // In production, this should verify admin JWT token
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Get Supabase configuration status
router.get('/supabase/status', requireAdmin, async (req, res) => {
  try {
    const isConfigured = supabaseConfig.isConfigured();
    const connectionTest = await supabaseConfig.testConnection();

    res.json({
      success: true,
      configured: isConfigured,
      connection: connectionTest,
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
router.post('/supabase/configure', requireAdmin, async (req, res) => {
  try {
    const { supabaseUrl, supabaseAnonKey, supabaseServiceKey } = req.body;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(400).json({
        success: false,
        error: 'Supabase URL and Anon Key are required'
      });
    }

    // Update environment variables (in production, this should update .env file)
    process.env.SUPABASE_URL = supabaseUrl;
    process.env.SUPABASE_ANON_KEY = supabaseAnonKey;
    if (supabaseServiceKey) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = supabaseServiceKey;
    }

    // Reinitialize Supabase
    const initialized = supabaseConfig.initialize();

    if (initialized) {
      // Test connection
      const connectionTest = await supabaseConfig.testConnection();
      
      res.json({
        success: true,
        message: 'Supabase configured successfully',
        connection: connectionTest
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to initialize Supabase with provided credentials'
      });
    }

  } catch (error) {
    console.error('Supabase configuration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to configure Supabase'
    });
  }
});

// Initialize database tables
router.post('/supabase/init-tables', requireAdmin, async (req, res) => {
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

// Get all users (admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    if (!supabaseConfig.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Database not configured'
      });
    }

    const supabase = supabaseConfig.getClient();
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, role, created_at, last_login, is_active')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      users: users || [],
      count: users ? users.length : 0
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Update user status (admin only)
router.put('/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (!supabaseConfig.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Database not configured'
      });
    }

    const supabase = supabaseConfig.getClient();
    const { data: updatedUser, error } = await supabase
      .from('user_profiles')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
});

// Get system statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    if (!supabaseConfig.isConfigured()) {
      return res.json({
        success: true,
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          databaseConfigured: false
        }
      });
    }

    const supabase = supabaseConfig.getClient();
    
    // Get total users
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users
    const { count: activeUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        databaseConfigured: true
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;