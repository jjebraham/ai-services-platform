import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, toggleLanguage, lang } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container" dir="ltr">
        <Link to="/" className="nav-brand">
          <img
            src={theme === 'dark' ? '/kiani-exchange-logo-white.svg' : '/kiani-exchange-logo-gray.svg'}
            alt={t('siteName')}
            className="h-2"
          />
        </Link>

        <div className="nav-links">
          {/* Main navigation links - always LTR for consistent layout */}
          <div className="main-links">
            <Link to="/" className="nav-link">{t('home')}</Link>
            <Link to="/services" className="nav-link">{t('services')}</Link>
            <Link to="/payments" className="nav-link">{t('payments')}</Link>
            {user && <Link to="/dashboard" className="nav-link">{t('dashboard')}</Link>}
          </div>
          
          {/* User-specific links */}
          <div className="user-links">
            {user ? (
              <>
                <Link to="/basket" className="nav-link basket-link">
                  🛒 {t('basket')}
                </Link>
                <Link to="/admin" className="nav-link">Admin</Link>
                <button onClick={handleLogout} className="nav-button logout">
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-button login">
                  {t('login')}
                </Link>
                <Link to="/register" className="nav-button register">
                  {t('signup')}
                </Link>
              </>
            )}
          </div>
          
          {/* Control buttons - always at the end */}
          <div className="control-buttons">
            <button onClick={toggleLanguage} className="nav-button lang-button">
              {lang === 'en' ? (<span role="img" aria-label="Persian flag">🇮🇷</span>) : (<span role="img" aria-label="US flag">🇺🇸</span>)}
              {lang === 'en' ? ' Persian' : ' English'}
            </button>
            <button onClick={toggleTheme} className="nav-button theme-button" aria-label="Toggle theme">
              {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;