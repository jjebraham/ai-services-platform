import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { adminAPI } from './services/apiClient';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalTickets: 0
    },
    recentOrders: [],
    recentUsers: []
  });
  const [refreshing, setRefreshing] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState('checking');

  useEffect(() => {
    fetchDashboardData();
    checkSupabaseStatus();
  }, []);

  const checkSupabaseStatus = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/supabase/status');
      const data = await response.json();
      setSupabaseStatus(data.configured ? 'connected' : 'not_configured');
    } catch (error) {
      console.error('Error checking Supabase status:', error);
      setSupabaseStatus('error');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the real API
      const response = await adminAPI.getDashboard();
      
      if (response.success) {
        setDashboardData({
          overview: response.data.overview,
          recentOrders: response.data.recentOrders || [],
          recentUsers: response.data.recentUsers || []
        });
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      
      // Fallback to mock data if API fails
      setDashboardData({
        overview: {
          totalUsers: 1247,
          totalOrders: 856,
          totalRevenue: 125000000,
          totalTickets: 12
        },
        recentOrders: [
          {
            _id: '1',
            orderNumber: 'ORD-001',
            user: { name: 'John Doe' },
            service: { name: 'OpenAI GPT-4' },
            pricing: { totalUSD: 50000 },
            status: 'completed',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            orderNumber: 'ORD-002',
            user: { name: 'Jane Smith' },
            service: { name: 'DALL-E 3' },
            pricing: { totalUSD: 75000 },
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
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleSupabaseSetup = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/supabase/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Supabase tables initialized successfully!');
        await checkSupabaseStatus();
        await fetchDashboardData();
      } else {
        alert('Error initializing Supabase: ' + data.error);
      }
    } catch (error) {
      console.error('Error initializing Supabase:', error);
      alert('Error initializing Supabase. Please try again.');
    }
  };

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount / 100); // Assuming amount is in cents
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'status-badge status-completed',
      pending: 'status-badge status-pending',
      active: 'status-badge status-active',
      suspended: 'status-badge status-suspended',
      deactivated: 'status-badge status-deactivated',
      processing: 'status-badge status-processing',
      cancelled: 'status-badge status-cancelled'
    };
    return statusClasses[status] || 'status-badge';
  };

  const getSupabaseStatusBadge = () => {
    const statusConfig = {
      connected: { color: 'green', label: 'Connected', icon: '✅' },
      not_configured: { color: 'yellow', label: 'Not Configured', icon: '⚠️' },
      error: { color: 'red', label: 'Error', icon: '❌' },
      checking: { color: 'blue', label: 'Checking...', icon: '🔄' }
    };

    const config = statusConfig[supabaseStatus] || statusConfig.checking;
    
    return (
      <span className={`status-badge status-${config.color}`}>
        <span className="status-icon">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <div className="header-content">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Welcome back, {user?.profile?.firstName || user?.email}</p>
            </div>
            <div className="header-actions">
              <button 
                onClick={handleRefresh} 
                className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
                disabled={refreshing}
              >
                🔄 {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {/* Supabase Status */}
          <div className="supabase-status">
            <div className="status-info">
              <span>Supabase Status: </span>
              {getSupabaseStatusBadge()}
            </div>
            {supabaseStatus === 'not_configured' && (
              <button onClick={handleSupabaseSetup} className="setup-btn">
                Initialize Supabase Tables
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">
              <p>⚠️ API Error: {error}. Showing fallback data.</p>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <h3>Total Users</h3>
              <span className="stat-icon">👥</span>
            </div>
            <div className="stat-value">{dashboardData.overview.totalUsers.toLocaleString()}</div>
            <div className="stat-change">+12% from last month</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3>Total Orders</h3>
              <span className="stat-icon">📦</span>
            </div>
            <div className="stat-value">{dashboardData.overview.totalOrders.toLocaleString()}</div>
            <div className="stat-change">+8% from last month</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3>Total Revenue</h3>
              <span className="stat-icon">💰</span>
            </div>
            <div className="stat-value">{formatCurrency(dashboardData.overview.totalRevenue)}</div>
            <div className="stat-change">+15% from last month</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3>Support Tickets</h3>
              <span className="stat-icon">🎫</span>
            </div>
            <div className="stat-value">{dashboardData.overview.totalTickets}</div>
            <div className="stat-change">-5% from last month</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/admin/users" className="action-btn">
              <span className="btn-icon">👥</span>
              <div>
                <div className="btn-title">Manage Users</div>
                <div className="btn-subtitle">View and manage user accounts</div>
              </div>
            </Link>
            <Link to="/admin/orders" className="action-btn">
              <span className="btn-icon">📦</span>
              <div>
                <div className="btn-title">View Orders</div>
                <div className="btn-subtitle">Monitor order status and history</div>
              </div>
            </Link>
            <Link to="/admin/services" className="action-btn">
              <span className="btn-icon">⚙️</span>
              <div>
                <div className="btn-title">AI Services</div>
                <div className="btn-subtitle">Configure AI service offerings</div>
              </div>
            </Link>
            <Link to="/admin/settings" className="action-btn">
              <span className="btn-icon">🔧</span>
              <div>
                <div className="btn-title">Settings</div>
                <div className="btn-subtitle">System configuration and preferences</div>
              </div>
            </Link>
            <Link to="/admin/analytics" className="action-btn">
              <span className="btn-icon">📊</span>
              <div>
                <div className="btn-title">Analytics</div>
                <div className="btn-subtitle">View detailed reports and metrics</div>
              </div>
            </Link>
            <Link to="/admin/support" className="action-btn">
              <span className="btn-icon">💬</span>
              <div>
                <div className="btn-title">Support Tickets</div>
                <div className="btn-subtitle">Handle customer support requests</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Data Tables */}
        <div className="data-tables">
          <div className="table-section">
            <div className="table-header">
              <h2>Recent Orders</h2>
              <Link to="/admin/orders" className="view-all-link">View All →</Link>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>User</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentOrders.length > 0 ? (
                    dashboardData.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="order-number">{order.orderNumber}</td>
                        <td>{order.user?.profile?.firstName || order.user?.name || order.user?.email}</td>
                        <td>{order.service?.name || order.service}</td>
                        <td className="amount">{formatCurrency(order.pricing?.totalUSD || order.amount || 0)}</td>
                        <td>
                          <span className={getStatusBadge(order.status)}>
                            {order.status}
                          </span>
                        </td>
                        <td className="date">{formatDate(order.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No recent orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="table-section">
            <div className="table-header">
              <h2>Recent Users</h2>
              <Link to="/admin/users" className="view-all-link">View All →</Link>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentUsers.length > 0 ? (
                    dashboardData.recentUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.name}</td>
                        <td className="email">{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadge(user.accountStatus || user.status)}>
                            {user.accountStatus || user.status}
                          </span>
                        </td>
                        <td className="date">{formatDate(user.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No recent users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="system-health">
          <h2>System Health</h2>
          <div className="health-grid">
            <div className="health-card">
              <div className="health-icon">🗄️</div>
              <div className="health-info">
                <h3>Database</h3>
                <span className="health-status healthy">Operational</span>
              </div>
            </div>
            <div className="health-card">
              <div className="health-icon">🔐</div>
              <div className="health-info">
                <h3>Authentication</h3>
                <span className="health-status healthy">Operational</span>
              </div>
            </div>
            <div className="health-card">
              <div className="health-icon">🤖</div>
              <div className="health-info">
                <h3>AI Services</h3>
                <span className="health-status healthy">Operational</span>
              </div>
            </div>
            <div className="health-card">
              <div className="health-icon">💳</div>
              <div className="health-info">
                <h3>Payment System</h3>
                <span className="health-status healthy">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

