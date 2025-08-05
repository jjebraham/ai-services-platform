import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, toggleLanguage } = useLanguage();
  const { toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          AI Platform
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">{t('home')}</Link>
          <Link to="/services" className="nav-link">{t('services')}</Link>
          <Link to="/payments" className="nav-link">{t('payments')}</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">{t('dashboard')}</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
              <button onClick={handleLogout} className="nav-button logout">
                Logout
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
          <button onClick={toggleLanguage} className="nav-button">
            {t('toggle')}
          </button>
          <button onClick={toggleTheme} className="nav-button">
            Theme
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;