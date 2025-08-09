import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

// Simple 6-box OTP input
function OtpInput({ value, onChange, disabled }) {
  const vals = useMemo(() => (value || '').padEnd(6, ' ').slice(0, 6).split(''), [value]);
  const setAt = (i, ch) => {
    const cleaned = (value || '').split('');
    cleaned[i] = ch.replace(/\D/g, '').slice(0, 1);
    onChange(cleaned.join('').slice(0, 6));
  };
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {vals.map((ch, i) => (
        <input
          key={i}
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          disabled={disabled}
          value={ch.trim()}
          onChange={(e) => setAt(i, e.target.value)}
          style={{
            width: 42,
            height: 48,
            textAlign: 'center',
            fontSize: 22,
            border: '1px solid #444',
            background: '#111',
            color: '#fff',
            borderRadius: 8,
          }}
        />
      ))}
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState('form'); // form | otp
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false,
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = t('firstNameRequired');
    if (!formData.lastName.trim()) e.lastName = t('lastNameRequired');

    const phone = formData.phone.replace(/\D/g, '');
    if (!/^09\d{9}$/.test(phone)) e.phone = t('phoneInvalid') || 'Invalid phone (e.g. 09XXXXXXXXX)';

    if (!formData.password) e.password = t('passwordRequired');
    if (formData.password && formData.password.length < 8) e.password = t('passwordMinLength') || 'Min 8 chars';
    if (!formData.confirmPassword) e.confirmPassword = t('confirmPasswordRequired');
    if (formData.password !== formData.confirmPassword) e.confirmPassword = t('passwordsNotMatch');

    if (!formData.acceptTerms) e.acceptTerms = t('termsRequired');
    if (!formData.acceptPrivacy) e.acceptPrivacy = t('privacyRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const startOtp = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/otp/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: formData.phone }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.message || 'Failed to send OTP');
      setStep('otp');
      setResendIn(45);
      const iv = setInterval(
        () =>
          setResendIn((x) => {
            if (x <= 1) {
              clearInterval(iv);
              return 0;
            }
            return x - 1;
          }),
        1000,
      );
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 'form') {
      if (!validateForm()) return;
      await startOtp();
      return;
    }
    if (step === 'otp') {
      if (!/^\d{6}$/.test(otp)) {
        setErrors({ submit: t('codeInvalid') || 'Enter the 6-digit code' });
        return;
      }
      setIsLoading(true);
      try {
        const resp = await fetch('/api/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            phone: formData.phone,
            code: otp,
            profile: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              password: formData.password,
            },
          }),
        });
        const data = await resp.json();
        if (!resp.ok || !data.success) throw new Error(data.message || 'Verification failed');

        login({
          id: data.user.id,
          phone: data.user.phone,
          email: data.user.phone,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          role: data.user.role || 'user',
          balance: data.user.balance || 0,
        });
        navigate('/dashboard');
      } catch (err) {
        setErrors({ submit: err.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resend = async () => {
    if (resendIn > 0) return;
    await startOtp();
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>{t('createAccount')}</h1>
          <p>{t('joinUsers')}</p>
        </div>

        {errors.submit && <div className="form-error global-error">{errors.submit}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          {step === 'form' && (
            <>
              <div className="name-row">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    {t('firstName')}
                  </label>
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
                  {errors.firstName && <p className="form-error">{errors.firstName}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    {t('lastName')}
                  </label>
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
                  {errors.lastName && <p className="form-error">{errors.lastName}</p>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  {t('phoneNumber') || 'Phone number'}
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="مثلاً 09123456789"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.phone && <p className="form-error">{errors.phone}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  {t('password')}
                </label>
                <div className="password-input">
                  <span className="input-icon">🔒</span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t('createStrongPassword')}
                    className="form-input"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  {t('confirmPassword')}
                </label>
                <div className="password-input">
                  <span className="input-icon">🔒</span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder={t('confirmPasswordPlaceholder')}
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>

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
                {errors.acceptTerms && <p className="form-error checkbox-error">{errors.acceptTerms}</p>}

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
                {errors.acceptPrivacy && <p className="form-error checkbox-error">{errors.acceptPrivacy}</p>}
              </div>
            </>
          )}

          {step === 'otp' && (
            <div className="form-group">
              <label className="form-label">
                {t('enterOtp') || 'Enter the 6-digit code'}
              </label>
              <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
              <div style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
                {resendIn > 0 ? (
                  (t('resendIn') || 'Resend in') + ` ${resendIn}s`
                ) : (
                  <button type="button" onClick={resend} className="link">
                    {t('resendCode') || 'Resend code'}
                  </button>
                )}
              </div>
            </div>
          )}

          <button type="submit" className="register-button" disabled={isLoading}>
            {isLoading
              ? '⏳'
              : step === 'form'
              ? t('sendVerificationCode') || 'Send code'
              : t('verifyAndCreate') || 'Verify & Create'}
          </button>
        </form>

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

