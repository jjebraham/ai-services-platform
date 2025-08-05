import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

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
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Sign in to your account to access premium AI services
            </p>
            
            {/* Demo Credentials */}
            <div className="demo-credentials">
              <h4 style={{ margin: '10px 0 5px 0', color: '#666', fontSize: '14px' }}>Demo Credentials:</h4>
              <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
                <div><strong>User:</strong> demo@aiservices.com / demo123456</div>
                <div><strong>Admin:</strong> demoadmin@aiservices.com / demoadmin123456</div>
                <div><strong>Super Admin:</strong> admin@aiservices.com / admin123456</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox" />
                <span className="checkbox-text">Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            {errors.submit && (
              <div className="submit-error">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="divider">
            <span className="divider-text">Or continue with</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="google-button"
          >
            <span className="google-icon">🔍</span>
            Continue with Google
          </button>

          <div className="login-footer">
            <p className="footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="footer-link">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        <div className="login-features">
          <div className="feature-item">
            <div className="feature-icon">🛡️</div>
            <div className="feature-content">
              <h3 className="feature-title">Secure & Safe</h3>
              <p className="feature-description">
                Your data is protected with enterprise-grade security
              </p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div className="feature-content">
              <h3 className="feature-title">Fast Access</h3>
              <p className="feature-description">
                Quick login to access all premium AI services instantly
              </p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">🎧</div>
            <div className="feature-content">
              <h3 className="feature-title">24/7 Support</h3>
              <p className="feature-description">
                Get help whenever you need it from our support team
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

