import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

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
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrength && passwordStrength.score < 3) {
      newErrors.password = 'Password is too weak';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms of Service';
    }

    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = 'You must accept the Privacy Policy';
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
      setErrors({ submit: 'Registration failed. Please try again.' });
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
          <h1>Create your account</h1>
          <p>Join thousands of users managing their finances</p>
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
              <label htmlFor="firstName" className="form-label">First name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter your first name"
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
              <label htmlFor="lastName" className="form-label">Last name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter your last name"
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
            <label htmlFor="email" className="form-label">Email address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
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
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
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
                        {check === 'length' && '8+ characters'}
                        {check === 'lowercase' && 'Lowercase'}
                        {check === 'uppercase' && 'Uppercase'}
                        {check === 'number' && 'Number'}
                        {check === 'special' && 'Special char'}
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
            <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
            <div className="password-input">
              <span className="input-icon">🔒</span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
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
                I agree to the{' '}
                <Link to="/terms" className="link">
                  Terms of Service
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
                I agree to the{' '}
                <Link to="/privacy" className="link">
                  Privacy Policy
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
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span>Or continue with</span>
        </div>

        {/* Google Signup */}
        <button
          type="button"
          className="google-button"
          onClick={handleGoogleSignup}
        >
          <span className="google-icon">🔍</span>
          Continue with Google
        </button>

        {/* Sign In Link */}
        <div className="register-links">
          <span>Already have an account? </span>
          <Link to="/login" className="link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

