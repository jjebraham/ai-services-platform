import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

// Password strength checker
const checkPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;
  let strength = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return { checks, score, strength };
};

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = formData.password ? checkPasswordStrength(formData.password) : null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('firstNameRequired');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('lastNameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (passwordStrength && passwordStrength.score < 3) {
      newErrors.password = t('passwordWeak');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordsNotMatch');
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = t('termsRequired');
    }

    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = t('privacyRequired');
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful registration
      const userData = {
        id: Date.now(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        balance: 0
      };

      login(userData);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: t('registrationFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Mock Google signup
    const userData = {
      id: Date.now(),
      firstName: 'Google',
      lastName: 'User',
      email: 'user@gmail.com',
      balance: 0
    };
    login(userData);
    navigate('/dashboard');
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>{t('createAccount')}</h1>
          <p>{t('joinUsers')}</p>
        </div>

        {errors.submit && (
          <div className="form-error global-error">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {/* Name Fields */}
          <div className="name-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">{t('firstName')}</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder={t('enterFirstName')}
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              {errors.firstName && (
                <p className="form-error">{errors.firstName}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">{t('lastName')}</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder={t('enterLastName')}
                  className="form-input"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              {errors.lastName && (
                <p className="form-error">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">{t('emailAddress')}</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t('enterEmail')}
                className="form-input"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            {errors.email && (
              <p className="form-error">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">{t('password')}</label>
            <div className="password-input">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('createStrongPassword')}
                className="form-input"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && passwordStrength && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`strength-bar ${
                        level <= passwordStrength.score
                          ? passwordStrength.strength === 'weak'
                            ? 'weak'
                            : passwordStrength.strength === 'medium'
                            ? 'medium'
                            : 'strong'
                          : 'empty'
                      }`}
                    />
                  ))}
                </div>
                <div className="strength-checks">
                  {Object.entries(passwordStrength.checks).map(([check, passed]) => (
                    <div key={check} className="strength-check">
                      <span className={`check-icon ${passed ? 'passed' : 'failed'}`}>
                        {passed ? '✓' : '○'}
                      </span>
                      <span className={passed ? 'check-passed' : 'check-failed'}>
                        {check === 'length' && t('passwordLength')}
                        {check === 'lowercase' && t('passwordLowercase')}
                        {check === 'uppercase' && t('passwordUppercase')}
                        {check === 'number' && t('passwordNumber')}
                        {check === 'special' && t('passwordSpecial')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="form-error">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">{t('confirmPassword')}</label>
            <div className="password-input">
              <span className="input-icon">🔒</span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('confirmPasswordPlaceholder')}
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms and Privacy */}
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <label htmlFor="acceptTerms" className="checkbox-label">
                {t('agreeToTerms')}{' '}
                <Link to="/terms" className="link">
                  {t('termsOfService')}
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="form-error checkbox-error">{errors.acceptTerms}</p>
            )}

            <div className="checkbox-item">
              <input
                id="acceptPrivacy"
                name="acceptPrivacy"
                type="checkbox"
                checked={formData.acceptPrivacy}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <label htmlFor="acceptPrivacy" className="checkbox-label">
                {t('agreeToPrivacy')}{' '}
                <Link to="/privacy" className="link">
                  {t('privacyPolicy')}
                </Link>
              </label>
            </div>
            {errors.acceptPrivacy && (
              <p className="form-error checkbox-error">{errors.acceptPrivacy}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner">⏳</span>
                {t('creatingAccount')}
              </>
            ) : (
              t('createAccountButton')
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span>{t('orContinueWith')}</span>
        </div>

        {/* Google Signup */}
        <button
          type="button"
          className="google-button"
          onClick={handleGoogleSignup}
        >
          <span className="google-icon">🔍</span>
          {t('continueWithGoogle')}
        </button>

        {/* Sign In Link */}
        <div className="register-links">
          <span>{t('alreadyHaveAccount')} </span>
          <Link to="/login" className="link">
            {t('signInLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

