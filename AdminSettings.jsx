import React, { useState, useEffect } from 'react';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});
  const [activeTab, setActiveTab] = useState('exchange');
  const [saveStatus, setSaveStatus] = useState(null);
  const [formData, setFormData] = useState({
    // Exchange Rate Settings
    exchangeRateApiKey: '',
    exchangeRateProvider: 'fixer',
    
    // Payment Settings
    stripePublishableKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    paypalClientSecret: '',
    
    // Email Settings
    emailProvider: 'smtp',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    sendgridApiKey: '',
    mailgunApiKey: '',
    mailgunDomain: '',
    
    // Platform Settings
    platformName: 'AI Services Platform',
    supportEmail: 'support@example.com',
    maintenanceMode: false,
    registrationEnabled: true,
    kycRequired: true,
    
    // Security Settings
    jwtSecret: '',
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Mock data for demonstration
      setFormData(prev => ({
        ...prev,
        platformName: 'AI Services Platform',
        supportEmail: 'support@aiservices.com',
        exchangeRateProvider: 'fixer',
        emailProvider: 'smtp',
        sessionTimeout: 60,
        maxLoginAttempts: 5
      }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.platformName.trim()) {
      newErrors.platformName = 'Platform name is required';
    }

    if (!formData.supportEmail.trim()) {
      newErrors.supportEmail = 'Support email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.supportEmail)) {
      newErrors.supportEmail = 'Must be a valid email';
    }

    if (formData.jwtSecret && formData.jwtSecret.length < 32) {
      newErrors.jwtSecret = 'JWT secret must be at least 32 characters';
    }

    if (formData.sessionTimeout < 15 || formData.sessionTimeout > 1440) {
      newErrors.sessionTimeout = 'Session timeout must be between 15 and 1440 minutes';
    }

    if (formData.maxLoginAttempts < 3 || formData.maxLoginAttempts > 10) {
      newErrors.maxLoginAttempts = 'Max login attempts must be between 3 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setSaveStatus(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const testExchangeRateConnection = async () => {
    setTestingConnection(true);
    try {
      // Mock test
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Connection successful! Current USD to IRR rate: 42,500`);
    } catch (error) {
      console.error('Error testing exchange rate connection:', error);
      alert('Connection test failed. Please check your settings.');
    } finally {
      setTestingConnection(false);
    }
  };

  const testEmailConnection = async () => {
    setTestingConnection(true);
    try {
      // Mock test
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Email connection test successful!');
    } catch (error) {
      console.error('Error testing email connection:', error);
      alert('Email connection test failed. Please check your settings.');
    } finally {
      setTestingConnection(false);
    }
  };

  const toggleSecretVisibility = (field) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const SecretInput = ({ name, placeholder, ...props }) => (
    <div className="secret-input-wrapper">
      <input
        type={showSecrets[name] ? 'text' : 'password'}
        value={formData[name] || ''}
        onChange={(e) => handleInputChange(name, e.target.value)}
        className="form-input"
        placeholder={placeholder}
        {...props}
      />
      <button
        type="button"
        onClick={() => toggleSecretVisibility(name)}
        className="secret-toggle-btn"
      >
        {showSecrets[name] ? '🙈' : '👁️'}
      </button>
    </div>
  );

  const tabs = [
    { id: 'exchange', label: 'Exchange Rate', icon: '💱' },
    { id: 'payment', label: 'Payment', icon: '💳' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'platform', label: 'Platform', icon: '🌐' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  if (loading) {
    return (
      <div className="admin-settings">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Platform Settings</h1>
              <p>Configure platform settings, integrations, and security</p>
            </div>
            {saveStatus && (
              <div className={`save-status ${saveStatus}`}>
                <span className="status-icon">
                  {saveStatus === 'success' ? '✅' : '❌'}
                </span>
                {saveStatus === 'success' ? 'Settings saved successfully!' : 'Error saving settings'}
              </div>
            )}
          </div>
        </div>

        <div className="settings-layout">
          {/* Sidebar */}
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="settings-content">
            <form onSubmit={handleSaveSettings} className="settings-form">
              {/* Exchange Rate Settings */}
              {activeTab === 'exchange' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>Exchange Rate Settings</h2>
                    <button
                      type="button"
                      onClick={testExchangeRateConnection}
                      disabled={testingConnection}
                      className="btn btn-secondary"
                    >
                      {testingConnection ? (
                        <>⏳ Testing...</>
                      ) : (
                        <>🔄 Test Connection</>
                      )}
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Exchange Rate Provider</label>
                    <select
                      value={formData.exchangeRateProvider}
                      onChange={(e) => handleInputChange('exchangeRateProvider', e.target.value)}
                      className="form-select"
                    >
                      <option value="fixer">Fixer.io</option>
                      <option value="exchangerate-api">ExchangeRate-API</option>
                      <option value="currencyapi">CurrencyAPI</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">API Key</label>
                    <SecretInput
                      name="exchangeRateApiKey"
                      placeholder="Enter your exchange rate API key"
                    />
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <div className="settings-section">
                  <h2>Payment Gateway Settings</h2>

                  <div className="subsection">
                    <h3>Stripe Configuration</h3>
                    <div className="form-group">
                      <label className="form-label">Publishable Key</label>
                      <input
                        type="text"
                        value={formData.stripePublishableKey}
                        onChange={(e) => handleInputChange('stripePublishableKey', e.target.value)}
                        className="form-input"
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Secret Key</label>
                      <SecretInput
                        name="stripeSecretKey"
                        placeholder="sk_test_..."
                      />
                    </div>
                  </div>

                  <div className="subsection">
                    <h3>PayPal Configuration</h3>
                    <div className="form-group">
                      <label className="form-label">Client ID</label>
                      <input
                        type="text"
                        value={formData.paypalClientId}
                        onChange={(e) => handleInputChange('paypalClientId', e.target.value)}
                        className="form-input"
                        placeholder="PayPal Client ID"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Client Secret</label>
                      <SecretInput
                        name="paypalClientSecret"
                        placeholder="PayPal Client Secret"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === 'email' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>Email Settings</h2>
                    <button
                      type="button"
                      onClick={testEmailConnection}
                      disabled={testingConnection}
                      className="btn btn-secondary"
                    >
                      {testingConnection ? (
                        <>⏳ Testing...</>
                      ) : (
                        <>🔄 Test Connection</>
                      )}
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Provider</label>
                    <select
                      value={formData.emailProvider}
                      onChange={(e) => handleInputChange('emailProvider', e.target.value)}
                      className="form-select"
                    >
                      <option value="smtp">SMTP</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="mailgun">Mailgun</option>
                    </select>
                  </div>

                  {formData.emailProvider === 'smtp' && (
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">SMTP Host</label>
                        <input
                          type="text"
                          value={formData.smtpHost}
                          onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                          className="form-input"
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">SMTP Port</label>
                        <input
                          type="number"
                          value={formData.smtpPort}
                          onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                          className="form-input"
                          placeholder="587"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">SMTP Username</label>
                        <input
                          type="text"
                          value={formData.smtpUser}
                          onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                          className="form-input"
                          placeholder="your-email@gmail.com"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">SMTP Password</label>
                        <SecretInput
                          name="smtpPassword"
                          placeholder="Your email password or app password"
                        />
                      </div>
                    </div>
                  )}

                  {formData.emailProvider === 'sendgrid' && (
                    <div className="form-group">
                      <label className="form-label">SendGrid API Key</label>
                      <SecretInput
                        name="sendgridApiKey"
                        placeholder="SG...."
                      />
                    </div>
                  )}

                  {formData.emailProvider === 'mailgun' && (
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Mailgun API Key</label>
                        <SecretInput
                          name="mailgunApiKey"
                          placeholder="key-..."
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mailgun Domain</label>
                        <input
                          type="text"
                          value={formData.mailgunDomain}
                          onChange={(e) => handleInputChange('mailgunDomain', e.target.value)}
                          className="form-input"
                          placeholder="mg.yourdomain.com"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Platform Settings */}
              {activeTab === 'platform' && (
                <div className="settings-section">
                  <h2>Platform Settings</h2>

                  <div className="form-group">
                    <label className="form-label">Platform Name</label>
                    <input
                      type="text"
                      value={formData.platformName}
                      onChange={(e) => handleInputChange('platformName', e.target.value)}
                      className="form-input"
                      placeholder="AI Services Platform"
                    />
                    {errors.platformName && (
                      <p className="error-message">{errors.platformName}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Support Email</label>
                    <input
                      type="email"
                      value={formData.supportEmail}
                      onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                      className="form-input"
                      placeholder="support@yourplatform.com"
                    />
                    {errors.supportEmail && (
                      <p className="error-message">{errors.supportEmail}</p>
                    )}
                  </div>

                  <div className="checkbox-group">
                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        checked={formData.maintenanceMode}
                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                        className="form-checkbox"
                      />
                      <label htmlFor="maintenanceMode" className="checkbox-label">
                        Maintenance Mode
                      </label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="registrationEnabled"
                        checked={formData.registrationEnabled}
                        onChange={(e) => handleInputChange('registrationEnabled', e.target.checked)}
                        className="form-checkbox"
                      />
                      <label htmlFor="registrationEnabled" className="checkbox-label">
                        Allow New User Registration
                      </label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="kycRequired"
                        checked={formData.kycRequired}
                        onChange={(e) => handleInputChange('kycRequired', e.target.checked)}
                        className="form-checkbox"
                      />
                      <label htmlFor="kycRequired" className="checkbox-label">
                        Require KYC Verification
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="settings-section">
                  <h2>Security Settings</h2>

                  <div className="form-group">
                    <label className="form-label">JWT Secret Key</label>
                    <SecretInput
                      name="jwtSecret"
                      placeholder="Enter a secure JWT secret (min 32 characters)"
                    />
                    {errors.jwtSecret && (
                      <p className="error-message">{errors.jwtSecret}</p>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        min="15"
                        max="1440"
                        value={formData.sessionTimeout}
                        onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                        className="form-input"
                      />
                      {errors.sessionTimeout && (
                        <p className="error-message">{errors.sessionTimeout}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Max Login Attempts</label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={formData.maxLoginAttempts}
                        onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
                        className="form-input"
                      />
                      {errors.maxLoginAttempts && (
                        <p className="error-message">{errors.maxLoginAttempts}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="settings-section">
                  <h2>Notification Settings</h2>

                  <div className="checkbox-group">
                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={formData.emailNotifications}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        className="form-checkbox"
                      />
                      <label htmlFor="emailNotifications" className="checkbox-label">
                        Enable Email Notifications
                      </label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        checked={formData.smsNotifications}
                        onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                        className="form-checkbox"
                      />
                      <label htmlFor="smsNotifications" className="checkbox-label">
                        Enable SMS Notifications
                      </label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="pushNotifications"
                        checked={formData.pushNotifications}
                        onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                        className="form-checkbox"
                      />
                      <label htmlFor="pushNotifications" className="checkbox-label">
                        Enable Push Notifications
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? (
                    <>
                      <span className="btn-icon">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">💾</span>
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

