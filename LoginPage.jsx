import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { authAPI } from './api';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Validation schemas
const emailLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const phoneLoginSchema = z.object({
  phoneNumber: z.string().regex(/^(\+98|0)?9\d{9}$/, 'Invalid phone number format'),
});

const otpVerificationSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

function LoginPage() {
  const { login, error, clearError } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [step, setStep] = useState('login'); // 'login' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [apiError, setApiError] = useState('');

  // Email login form
  const emailForm = useForm({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Phone login form
  const phoneForm = useForm({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

  // OTP verification form
  const otpForm = useForm({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Clear errors when switching methods
  useEffect(() => {
    clearError();
    setApiError('');
  }, [loginMethod, clearError]);

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

  const handleSendOTP = async (data) => {
    setIsLoading(true);
    setApiError('');
    
    try {
      const response = await authAPI.sendOTP(data.phoneNumber);
      
      if (response.success) {
        setPhoneNumber(data.phoneNumber);
        setStep('otp');
        setOtpSent(true);
        setCountdown(300); // 5 minutes
      } else {
        setApiError(response.error || 'Failed to send OTP');
      }
    } catch (err) {
      setApiError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (data) => {
    setIsLoading(true);
    setApiError('');
    
    try {
      const response = await authAPI.verifyOTP(phoneNumber, data.otp);
      
      if (response.success) {
        // Update auth context with user data
        await login(null, null, response.user);
        navigate('/dashboard');
      } else {
        setApiError(response.error || 'Invalid OTP');
      }
    } catch (err) {
      setApiError(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setApiError('');
    
    try {
      const response = await authAPI.sendOTP(phoneNumber);
      
      if (response.success) {
        setCountdown(300); // 5 minutes
        setApiError('');
      } else {
        setApiError(response.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setApiError(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('login');
    setOtpSent(false);
    setCountdown(0);
    setApiError('');
    otpForm.reset();
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'otp' ? t('login.verifyOTP', 'Verify OTP') : t('login.title', 'Welcome Back')}
          </h1>
          <p className="text-gray-600">
            {step === 'otp' 
              ? t('login.otpSubtitle', `Enter the verification code sent to ${phoneNumber}`)
              : t('login.subtitle', 'Sign in to your account')
            }
          </p>
        </div>

        {(error || apiError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error || apiError}
          </div>
        )}

        {step === 'login' && (
          <>
            {/* Login method selector */}
            <div className="mb-6">
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'email'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('login.email', 'Email')}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'phone'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('login.phone', 'Phone')}
                </button>
              </div>
            </div>

            {/* Email login form */}
            {loginMethod === 'email' && (
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
            )}

            {/* Phone login form */}
            {loginMethod === 'phone' && (
              <form onSubmit={phoneForm.handleSubmit(handleSendOTP)} className="space-y-6">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('login.phoneNumber', 'Phone Number')}
                  </label>
                  <input
                    {...phoneForm.register('phoneNumber')}
                    type="tel"
                    id="phoneNumber"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('login.phonePlaceholder', '09123456789')}
                  />
                  {phoneForm.formState.errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{phoneForm.formState.errors.phoneNumber.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {isLoading ? t('login.sendingOTP', 'Sending...') : t('login.sendOTP', 'Send Verification Code')}
                </button>
              </form>
            )}
          </>
        )}

        {/* OTP verification form */}
        {step === 'otp' && (
          <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                {t('login.verificationCode', 'Verification Code')}
              </label>
              <input
                {...otpForm.register('otp')}
                type="text"
                id="otp"
                maxLength="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                placeholder="000000"
              />
              {otpForm.formState.errors.otp && (
                <p className="mt-1 text-sm text-red-600">{otpForm.formState.errors.otp.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isLoading ? t('login.verifying', 'Verifying...') : t('login.verify', 'Verify')}
            </button>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                onClick={handleBackToPhone}
                className="text-gray-600 hover:text-gray-900"
              >
                {t('login.backToPhone', 'Back to phone')}
              </button>
              
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || isLoading}
                className="text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {countdown > 0 
                  ? t('login.resendIn', `Resend in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`)
                  : t('login.resendOTP', 'Resend code')
                }
              </button>
            </div>
          </form>
        )}

        {step === 'login' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('login.noAccount', "Don't have an account?")}{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                {t('login.signUp', 'Sign up')}
              </Link>
            </p>
          </div>
        )}

        {/* Demo credentials - only show for email login */}
        {step === 'login' && loginMethod === 'email' && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Email:</strong> demo@example.com</p>
              <p><strong>Password:</strong> demo123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;

