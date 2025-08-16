import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

// Validation schema for registration
const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

function RegisterPage() {
  const { register: registerUser, error, clearError } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    clearError();
    setApiError('');
  }, [clearError]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');
    try {
      const result = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      if (result.success) {
        navigate('/login');
      } else {
        setApiError(result.error || 'Registration failed');
      }
    } catch (err) {
      setApiError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>{t('createAccount') || 'Create Account'}</h1>
          <p>{t('joinUsers') || 'Join thousands of users'}</p>
        </div>

        {(error || apiError) && (
          <div className="form-error global-error">{error || apiError}</div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="register-form">
          <div className="name-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                {t('firstName') || 'First Name'}
              </label>
              <input
                id="firstName"
                type="text"
                {...form.register('firstName')}
                className={`form-input ${form.formState.errors.firstName ? 'error' : ''}`}
                disabled={isLoading}
              />
              {form.formState.errors.firstName && (
                <div className="form-error">{form.formState.errors.firstName.message}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                {t('lastName') || 'Last Name'}
              </label>
              <input
                id="lastName"
                type="text"
                {...form.register('lastName')}
                className={`form-input ${form.formState.errors.lastName ? 'error' : ''}`}
                disabled={isLoading}
              />
              {form.formState.errors.lastName && (
                <div className="form-error">{form.formState.errors.lastName.message}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              {t('email') || 'Email'}
            </label>
            <input
              id="email"
              type="email"
              {...form.register('email')}
              className={`form-input ${form.formState.errors.email ? 'error' : ''}`}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <div className="form-error">{form.formState.errors.email.message}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t('password') || 'Password'}
            </label>
            <input
              id="password"
              type="password"
              {...form.register('password')}
              className={`form-input ${form.formState.errors.password ? 'error' : ''}`}
              disabled={isLoading}
            />
            {form.formState.errors.password && (
              <div className="form-error">{form.formState.errors.password.message}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              {t('confirmPassword') || 'Confirm Password'}
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...form.register('confirmPassword')}
              className={`form-input ${form.formState.errors.confirmPassword ? 'error' : ''}`}
              disabled={isLoading}
            />
            {form.formState.errors.confirmPassword && (
              <div className="form-error">{form.formState.errors.confirmPassword.message}</div>
            )}
          </div>

          <button type="submit" className="register-button" disabled={isLoading}>
            {isLoading ? '⏳' : t('signUp') || 'Sign Up'}
          </button>
        </form>

        <div className="register-links">
          <span>{t('alreadyHaveAccount') || 'Already have an account?'} </span>
          <Link to="/login" className="link">
            {t('signInLink') || 'Sign in'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

