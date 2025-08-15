import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Settings, 
  Save, 
  Eye,
  EyeOff,
  DollarSign,
  CreditCard,
  Mail,
  Globe,
  Shield,
  Bell,
  Database,
  Key,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const settingsSchema = z.object({
  // Exchange Rate Settings
  exchangeRateApiKey: z.string().optional(),
  exchangeRateProvider: z.enum(['fixer', 'exchangerate-api', 'currencyapi'], {
    required_error: 'Please select an exchange rate provider',
  }),
  
  // Payment Settings
  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  paypalClientId: z.string().optional(),
  paypalClientSecret: z.string().optional(),
  
  // Email Settings
  emailProvider: z.enum(['smtp', 'sendgrid', 'mailgun'], {
    required_error: 'Please select an email provider',
  }),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  sendgridApiKey: z.string().optional(),
  mailgunApiKey: z.string().optional(),
  mailgunDomain: z.string().optional(),
  
  // Platform Settings
  platformName: z.string().min(1, 'Platform name is required'),
  supportEmail: z.string().email('Must be a valid email'),
  maintenanceMode: z.boolean().default(false),
  registrationEnabled: z.boolean().default(true),
  kycRequired: z.boolean().default(true),
  
  // Security Settings
  jwtSecret: z.string().min(32, 'JWT secret must be at least 32 characters'),
  sessionTimeout: z.number().min(15).max(1440), // 15 minutes to 24 hours
  maxLoginAttempts: z.number().min(3).max(10),
  
  // Notification Settings
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
});

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});
  const [activeTab, setActiveTab] = useState('exchange');
  const [saveStatus, setSaveStatus] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      maintenanceMode: false,
      registrationEnabled: true,
      kycRequired: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      sessionTimeout: 60,
      maxLoginAttempts: 5
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      const settings = response.data;
      
      // Populate form with existing settings
      Object.keys(settings).forEach(key => {
        setValue(key, settings[key]);
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (data) => {
    setSaving(true);
    setSaveStatus(null);
    
    try {
      await api.put('/admin/settings', data);
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
      const response = await api.post('/admin/settings/test-exchange-rate', {
        provider: watchedValues.exchangeRateProvider,
        apiKey: watchedValues.exchangeRateApiKey
      });
      
      if (response.data.success) {
        alert(`Connection successful! Current USD to IRR rate: ${response.data.rate}`);
      } else {
        alert('Connection failed. Please check your API key and try again.');
      }
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
      const response = await api.post('/admin/settings/test-email', {
        provider: watchedValues.emailProvider,
        settings: {
          smtpHost: watchedValues.smtpHost,
          smtpPort: watchedValues.smtpPort,
          smtpUser: watchedValues.smtpUser,
          smtpPassword: watchedValues.smtpPassword,
          sendgridApiKey: watchedValues.sendgridApiKey,
          mailgunApiKey: watchedValues.mailgunApiKey,
          mailgunDomain: watchedValues.mailgunDomain
        }
      });
      
      if (response.data.success) {
        alert('Email connection test successful!');
      } else {
        alert('Email connection test failed. Please check your settings.');
      }
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
    <div className="relative">
      <input
        {...register(name)}
        type={showSecrets[name] ? 'text' : 'password'}
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        {...props}
      />
      <button
        type="button"
        onClick={() => toggleSecretVisibility(name)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        {showSecrets[name] ? (
          <EyeOff className="h-4 w-4 text-gray-400" />
        ) : (
          <Eye className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
  );

  const tabs = [
    { id: 'exchange', label: 'Exchange Rate', icon: DollarSign },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'platform', label: 'Platform', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
              <p className="text-gray-600 mt-2">
                Configure platform settings, integrations, and security
              </p>
            </div>
            {saveStatus && (
              <div className={`flex items-center px-4 py-2 rounded-md ${
                saveStatus === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {saveStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                {saveStatus === 'success' ? 'Settings saved successfully!' : 'Error saving settings'}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <form onSubmit={handleSubmit(handleSaveSettings)} className="space-y-8">
              {/* Exchange Rate Settings */}
              {activeTab === 'exchange' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Exchange Rate Settings</h2>
                    <button
                      type="button"
                      onClick={testExchangeRateConnection}
                      disabled={testingConnection}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      {testingConnection ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Test Connection
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exchange Rate Provider
                      </label>
                      <select
                        {...register('exchangeRateProvider')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="fixer">Fixer.io</option>
                        <option value="exchangerate-api">ExchangeRate-API</option>
                        <option value="currencyapi">CurrencyAPI</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <SecretInput
                        name="exchangeRateApiKey"
                        placeholder="Enter your exchange rate API key"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Payment Gateway Settings</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Stripe Configuration</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Publishable Key
                          </label>
                          <input
                            {...register('stripePublishableKey')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="pk_test_..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secret Key
                          </label>
                          <SecretInput
                            name="stripeSecretKey"
                            placeholder="sk_test_..."
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">PayPal Configuration</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client ID
                          </label>
                          <input
                            {...register('paypalClientId')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="PayPal Client ID"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client Secret
                          </label>
                          <SecretInput
                            name="paypalClientSecret"
                            placeholder="PayPal Client Secret"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === 'email' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Email Settings</h2>
                    <button
                      type="button"
                      onClick={testEmailConnection}
                      disabled={testingConnection}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      {testingConnection ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Test Connection
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Provider
                      </label>
                      <select
                        {...register('emailProvider')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="smtp">SMTP</option>
                        <option value="sendgrid">SendGrid</option>
                        <option value="mailgun">Mailgun</option>
                      </select>
                    </div>

                    {watchedValues.emailProvider === 'smtp' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SMTP Host
                            </label>
                            <input
                              {...register('smtpHost')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="smtp.gmail.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SMTP Port
                            </label>
                            <input
                              {...register('smtpPort', { valueAsNumber: true })}
                              type="number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="587"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Username
                          </label>
                          <input
                            {...register('smtpUser')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="your-email@gmail.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Password
                          </label>
                          <SecretInput
                            name="smtpPassword"
                            placeholder="Your email password or app password"
                          />
                        </div>
                      </div>
                    )}

                    {watchedValues.emailProvider === 'sendgrid' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SendGrid API Key
                        </label>
                        <SecretInput
                          name="sendgridApiKey"
                          placeholder="SG...."
                        />
                      </div>
                    )}

                    {watchedValues.emailProvider === 'mailgun' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mailgun API Key
                          </label>
                          <SecretInput
                            name="mailgunApiKey"
                            placeholder="key-..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mailgun Domain
                          </label>
                          <input
                            {...register('mailgunDomain')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="mg.yourdomain.com"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Platform Settings */}
              {activeTab === 'platform' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Platform Settings</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform Name
                      </label>
                      <input
                        {...register('platformName')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="AI Services Platform"
                      />
                      {errors.platformName && (
                        <p className="mt-1 text-sm text-red-600">{errors.platformName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Email
                      </label>
                      <input
                        {...register('supportEmail')}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="support@yourplatform.com"
                      />
                      {errors.supportEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.supportEmail.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          {...register('maintenanceMode')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Maintenance Mode
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          {...register('registrationEnabled')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Allow New User Registration
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          {...register('kycRequired')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Require KYC Verification
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        JWT Secret Key
                      </label>
                      <SecretInput
                        name="jwtSecret"
                        placeholder="Enter a secure JWT secret (min 32 characters)"
                      />
                      {errors.jwtSecret && (
                        <p className="mt-1 text-sm text-red-600">{errors.jwtSecret.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <input
                          {...register('sessionTimeout', { valueAsNumber: true })}
                          type="number"
                          min="15"
                          max="1440"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.sessionTimeout && (
                          <p className="mt-1 text-sm text-red-600">{errors.sessionTimeout.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Login Attempts
                        </label>
                        <input
                          {...register('maxLoginAttempts', { valueAsNumber: true })}
                          type="number"
                          min="3"
                          max="10"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.maxLoginAttempts && (
                          <p className="mt-1 text-sm text-red-600">{errors.maxLoginAttempts.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Notification Settings</h2>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        {...register('emailNotifications')}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Enable Email Notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('smsNotifications')}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Enable SMS Notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('pushNotifications')}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Enable Push Notifications
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
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

