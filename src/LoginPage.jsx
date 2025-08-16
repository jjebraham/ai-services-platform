import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { authAPI } from '../apiClient';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Validation schemas
const emailLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Removed phone and OTP schemas - only email login supported

function LoginPage() {
  const { login, error, clearError } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Email login form
  const emailForm = useForm({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Removed phone and OTP forms - only email login supported

  // Clear errors on component mount
  useEffect(() => {
    clearError();
    setApiError('');
  }, [clearError]);

  const handleEmailLogin = async (data) => {
    setIsLoading(true);
    setApiError('');
    
    try {
      // Make direct API call to test
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      });

      const result = await response.json();

      if (result.success) {
        // Store user data and redirect
        await login(data.email, data.password);
        navigate('/dashboard');
      } else {
        setApiError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setApiError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setApiError('');

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store user data and redirect
        await login(data.user);
        navigate('/dashboard');
      } else {
        setApiError(data.error || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setApiError('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setApiError('Google login was cancelled or failed');
  };

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Initialize Google Sign-In
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
          callback: handleGoogleLogin,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render the Google Sign-In button
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular'
          }
        );
      }
    };
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="login-page">
      <div className="register-container">
        <div className="register-header">
          <h1 className="register-title">
            {t('login.title', 'Welcome Back')}
          </h1>
          <p className="register-subtitle">
            {t('login.subtitle', 'Sign in to your account')}
          </p>
        </div>

        {(error || apiError) && (
          <div className="form-error global-error">
            {error || apiError}
          </div>
        )}

        {/* Email login form */}
        <form onSubmit={emailForm.handleSubmit(handleEmailLogin)} className="register-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              {t('login.email', 'Email')}
            </label>
            <input
              {...emailForm.register('email')}
              type="email"
              id="email"
              className={`form-input ${emailForm.formState.errors.email ? 'error' : ''}`}
              placeholder={t('login.emailPlaceholder', 'Enter your email')}
            />
            {emailForm.formState.errors.email && (
              <div className="form-error">{emailForm.formState.errors.email.message}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t('login.password', 'Password')}
            </label>
            <input
              {...emailForm.register('password')}
              type="password"
              id="password"
              className={`form-input ${emailForm.formState.errors.password ? 'error' : ''}`}
              placeholder={t('login.passwordPlaceholder', 'Enter your password')}
            />
            {emailForm.formState.errors.password && (
              <div className="form-error">{emailForm.formState.errors.password.message}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="register-button"
          >
            {isLoading ? t('login.signingIn', 'Signing in...') : t('login.signIn', 'Sign In')}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span>{t('login.orContinueWith', 'Or continue with')}</span>
        </div>

        {/* Google Sign-in */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="google-button"
          disabled={isLoading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('login.continueWithGoogle', 'Continue with Google')}
        </button>

        <div className="register-links">
          <span>{t('login.noAccount', "Don't have an account?")}{' '}</span>
          <Link to="/register" className="link">
            {t('login.signUpLink', 'Sign up')}
          </Link>
        </div>

        {/* Demo credentials */}
        <div style={{marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.85rem'}}>
          <h3 style={{color: '#333', marginBottom: '0.5rem', fontWeight: '600'}}>Demo Credentials:</h3>
          <div style={{color: '#666'}}>
            <p><strong>Email:</strong> demo@aiservices.com</p>
            <p><strong>Password:</strong> demo123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

