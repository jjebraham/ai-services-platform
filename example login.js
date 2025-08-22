import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

function OtpInput({ value, onChange, disabled }) {
  const vals = useMemo(() => (value || '').padEnd(6, ' ').slice(0,6).split(''), [value]);
  return (
    <div style={{display:'flex', gap:8}}>
      {vals.map((ch, i) => (
        <input key={i} inputMode="numeric" pattern="\d*" maxLength={1}
          value={ch.trim()} disabled={disabled}
          onChange={e => {
            const s = (value || '').split(''); s[i] = e.target.value.replace(/\D/g,'').slice(0,1);
            onChange(s.join('').slice(0,6));
          }}
          style={{width:42,height:48,textAlign:'center',fontSize:22,border:'1px solid #444',background:'#111',color:'#fff',borderRadius:8}}
        />
      ))}
    </div>
  );
}

function LoginPhone() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // phone | otp
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const validatePhone = () => {
    const e = {};
    const p = phone.replace(/\D/g,'');
    if (!/^09\d{9}$/.test(p)) e.phone = t('phoneInvalid') || 'Invalid phone (e.g. 09XXXXXXXXX)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const startOtp = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/otp/start', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone })
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.message || 'Failed to send OTP');
      setStep('otp');
      setResendIn(45);
      const iv = setInterval(() => setResendIn(x => { if (x<=1){clearInterval(iv); return 0;} return x-1; }), 1000);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 'phone') {
      if (!validatePhone()) return;
      await startOtp();
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ submit: t('codeInvalid') || 'Enter the 6-digit code' });
      return;
    }
    setIsLoading(true);
    try {
      const resp = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, code: otp })
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.message || 'Verification failed');

      login({
        id: data.user.id,
        phone: data.user.phone,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        role: data.user.role || 'user',
        balance: data.user.balance || 0
      });
      navigate('/dashboard');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const resend = async () => {
    if (resendIn > 0) return;
    await startOtp();
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">{t('welcomeBack')}</h1>
            <p className="login-subtitle">{t('signInSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {step === 'phone' && (
              <div className="form-group">
                <label htmlFor="phone" className="form-label">{t('phoneNumber') || 'Phone number'}</label>
                <input id="phone" name="phone" type="tel" inputMode="numeric"
                  value={phone} onChange={(e)=>{ setPhone(e.target.value); if(errors.phone) setErrors({}); }}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="مثلاً 09123456789" disabled={isLoading}/>
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            )}

            {step === 'otp' && (
              <div className="form-group">
                <label className="form-label">{t('enterOtp') || 'Enter the 6-digit code'}</label>
                <OtpInput value={otp} onChange={setOtp} disabled={isLoading}/>
                <div style={{marginTop:12, fontSize:13, color:'#888'}}>
                  {resendIn > 0
                    ? (t('resendIn') || 'Resend in') + ` ${resendIn}s`
                    : <button type="button" onClick={resend} className="link">{t('resendCode') || 'Resend code'}</button>}
                </div>
              </div>
            )}

            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

            <button type="submit" className={`login-button ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? '⏳' : (step === 'phone' ? t('sendVerificationCode') || 'Send code' : t('verifyAndLogin') || 'Verify & Login')}
            </button>
          </form>

          <div className="login-footer">
            <p className="signup-prompt">
              {t('noAccount')}{' '}
              <Link to="/register" className="signup-link">{t('signUpLink')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPhone;
