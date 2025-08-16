import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { authAPI } from './services/apiClient';
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
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('login.title', 'Welcome Back')}
          </h1>
          <p className="text-gray-600">
            {t('login.subtitle', 'Sign in to your account')}
          </p>
        </div>

        {(error || apiError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error || apiError}
          </div>
        )}

        {/* Email login form */}
        <form onSubmit={emailForm.handleSubmit(handleEmailLogin)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('login.email', 'Email')}
            </label>
            <input
              {...emailForm.register('email')}
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('login.emailPlaceholder', 'Enter your email')}
            />
            {emailForm.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">{emailForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('login.password', 'Password')}
            </label>
            <input
              {...emailForm.register('password')}
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('login.passwordPlaceholder', 'Enter your password')}
            />
            {emailForm.formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">{emailForm.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isLoading ? t('login.signingIn', 'Signing in...') : t('login.signIn', 'Sign In')}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {t('login.orContinueWith', 'Or continue with')}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div id="google-signin-button" className="w-full flex justify-center"></div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('login.noAccount', "Don't have an account?")}{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              {t('login.signUpLink', 'Sign up')}
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Email:</strong> demo@example.com</p>
            <p><strong>Password:</strong> demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

