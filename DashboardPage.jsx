import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
        <h2>{t('loadingDashboard')}</h2>
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
        <h1>{t('welcomeBack').replace('{email}', user?.email || 'User')}</h1>
        <p>{t('dashboardIntro')}</p>
        {dashboardData && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '6px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>{t('accountBalance')}</h3>
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
            <div className="stat-title">{t('totalOrders')}</div>
            <div className="stat-value">{dashboardData.totalOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">{t('pendingOrders')}</div>
            <div className="stat-value">{dashboardData.pendingOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">{t('completedOrders')}</div>
            <div className="stat-value">{dashboardData.completedOrders}</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="welcome-section">
        <h2 style={{ marginBottom: '1.5rem' }}>{t('quickActions')}</h2>
        <div className="actions-grid">
          <div className="action-button">
            <h3 style={{ margin: '0 0 0.5rem 0' }}>📦 {t('newOrder')}</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{t('placeNewOrder')}</p>
          </div>
          <div className="action-button">
            <h3 style={{ margin: '0 0 0.5rem 0' }}>👁️ {t('viewOrders')}</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{t('checkOrderHistory')}</p>
          </div>
          <div className="action-button">
            <h3 style={{ margin: '0 0 0.5rem 0' }}>💬 {t('support')}</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{t('getHelpSupport')}</p>
          </div>
          <div className="action-button">
            <h3 style={{ margin: '0 0 0.5rem 0' }}>👤 {t('profile')}</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{t('manageProfile')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


