import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import LLMSlideshow from './LLMSlideshow';

function HomePage() {
  const { isAuthenticated } = useAuth();
  const { t, lang } = useLanguage();

  const features = [
    {
      icon: '🛡️',
      title: t('featureSecureTitle'),
      description: t('featureSecureDesc'),
    },
    {
      icon: '💳',
      title: t('featurePricingTitle'),
      description: t('featurePricingDesc'),
    },
    {
      icon: '🎧',
      title: t('featureSupportTitle'),
      description: t('featureSupportDesc'),
    },
    {
      icon: '⚡',
      title: t('featurePremiumTitle'),
      description: t('featurePremiumDesc'),
    },
  ];

  const stats = [
    { label: t('statsActiveUsers'), value: '10,000+' },
    { label: t('statsAIServices'), value: '50+' },
    { label: t('statsCountries'), value: '25+' },
    { label: t('statsUptime'), value: '99.9%' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">{t('heroBadge')}</div>
            <h1 className="hero-title">{t('heroTitle')}</h1>
            <p className="hero-description">{t('heroDescription')}</p>

            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary">
                  {t('goToDashboard')}
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary">
                    {t('getStarted')}
                  </Link>
                  <Link to="/services" className="btn btn-secondary">
                    {t('browseServices')}
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">{t('whyChooseTitle')}</h2>
            <p className="section-description">{t('whyChooseDescription')}</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LLM Menu Section */}
      <section className="llm-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">{t('llmServices')}</h2>
          </div>
          {/* Force component to remount with key to ensure proper initialization */}
          <LLMSlideshow key={`llm-slideshow-${lang}`} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">{t('ctaTitle')}</h2>
            <p className="cta-description">{t('ctaDescription')}</p>
            
            <div className="cta-buttons">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-light">
                  {t('ctaGoDashboard')}
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-light">
                    {t('ctaCreateAccount')}
                  </Link>
                  <Link to="/login" className="btn btn-outline">
                    {t('ctaSignIn')}
                  </Link>
                </>
              )}
            </div>

            <div className="cta-features">
              <div className="cta-feature">{t('ctaNoSetup')}</div>
              <div className="cta-feature">{t('ctaSecurePayments')}</div>
              <div className="cta-feature">{t('ctaSupport')}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;

