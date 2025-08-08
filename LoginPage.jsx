import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('emailInvalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('passwordMinLength');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Try to authenticate with backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include', // Include cookies
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Backend authentication successful
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name || data.user.email.split('@')[0],
          role: data.user.role || 'user',
          balance: data.user.balance || 0
        };
        
        login(userData);
        navigate('/dashboard');
      } else {
        // Backend authentication failed, check if it's a demo user
        const demoUsers = {
          'demo@aiservices.com': { password: 'demo123456', name: 'Demo User', role: 'user' },
          'demoadmin@aiservices.com': { password: 'demoadmin123456', name: 'Demo Admin', role: 'admin' },
          'admin@aiservices.com': { password: 'admin123456', name: 'System Administrator', role: 'admin' }
        };

        const demoUser = demoUsers[formData.email];
        if (demoUser && demoUser.password === formData.password) {
          // Demo user authentication
          const userData = {
            id: 'demo_' + Date.now(),
            email: formData.email,
            name: demoUser.name,
            role: demoUser.role,
            balance: 1250.75,
            isDemo: true
          };
          
          login(userData);
          navigate('/dashboard');
        } else {
          setErrors({ submit: data.message || 'Invalid email or password' });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to demo user authentication if backend is not available
      const demoUsers = {
        'demo@aiservices.com': { password: 'demo123456', name: 'Demo User', role: 'user' },
        'demoadmin@aiservices.com': { password: 'demoadmin123456', name: 'Demo Admin', role: 'admin' },
        'admin@aiservices.com': { password: 'admin123456', name: 'System Administrator', role: 'admin' }
      };

      const demoUser = demoUsers[formData.email];
      if (demoUser && demoUser.password === formData.password) {
        const userData = {
          id: 'demo_' + Date.now(),
          email: formData.email,
          name: demoUser.name,
          role: demoUser.role,
          balance: 1250.75,
          isDemo: true
        };
        
        login(userData);
        navigate('/dashboard');
      } else {
        setErrors({ submit: 'Login failed. Please check your credentials.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google OAuth
    alert('Google login will be implemented soon!');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">{t('welcomeBack')}</h1>
            <p className="login-subtitle">
              {t('signInSubtitle')}
            </p>
            
            {/* Demo Credentials */}
            <div className="demo-credentials">
              <h4 style={{ margin: '10px 0 5px 0', color: '#666', fontSize: '14px' }}>{t('demoCredentials')}</h4>
              <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
                <div><strong>{t('demoUser')}:</strong> demo@aiservices.com / demo123456</div>
                <div><strong>{t('demoAdmin')}:</strong> demoadmin@aiservices.com / demoadmin123456</div>
                <div><strong>{t('demoSuperAdmin')}:</strong> admin@aiservices.com / admin123456</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                {t('emailAddress')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder={t('enterEmail')}
                disabled={isLoading}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder={t('enterPassword')}
                disabled={isLoading}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-actions">
              <Link to="/forgot-password" className="forgot-password-link">
                {t('forgotPassword')}
              </Link>
            </div>

            {errors.submit && (
              <div className="error-message submit-error">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                t('signInButton')
              )}
            </button>
          </form>

          <div className="login-footer">
            <p className="signup-prompt">
              {t('noAccount')}{' '}
              <Link to="/register" className="signup-link">
                {t('signUpLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

