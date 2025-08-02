import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setDashboardData({
          totalOrders: 12,
          pendingOrders: 3,
          completedOrders: 9,
          accountBalance: 1250.50
        });
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome back, {user?.email || 'User'}!</h1>
        <p>Here's an overview of your account and recent activity.</p>
        {dashboardData && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '6px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>Account Balance</h3>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
              ${dashboardData.accountBalance?.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      {dashboardData && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Orders</div>
            <div className="stat-value">{dashboardData.totalOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Pending Orders</div>
            <div className="stat-value">{dashboardData.pendingOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Completed Orders</div>
            <div className="stat-value">{dashboardData.completedOrders}</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="welcome-section">
        <h2 style={{ marginBottom: '1.5rem' }}>Quick Actions</h2>
        <div className="actions-grid">
          <div className="action-button">
            <h3 style={{ margin: '0 0 0.5rem 0' }}>📦 New Order</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Place a new service order</p>
          </div>
          <div className="action-button">
            <h3 style={{ margin: '0 0 0.5rem 0' }}>👁️ View Orders</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Check your order history</p>
          </div>
          <div className="action-button">
            <h3 style={{ margin: '0 0 0.5rem 0' }}>💬 Support</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Get help and support</p>
          </div>
          <div className="action-button">
            <h3 style={{ margin: '0 0 0.5rem 0' }}>👤 Profile</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Manage your profile</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


