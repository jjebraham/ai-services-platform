import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { llmServices } from './llmData';

function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const features = [
    {
      icon: '🛡️',
      title: 'Secure & Verified',
      description: 'KYC verification and secure payment processing ensure your safety and compliance.',
    },
    {
      icon: '💳',
      title: 'Real-time Pricing',
      description: 'Live USD to Toman conversion with transparent pricing and no hidden fees.',
    },
    {
      icon: '🎧',
      title: '24/7 Support',
      description: 'Dedicated customer support team ready to help you with any questions.',
    },
    {
      icon: '⚡',
      title: 'Premium Services',
      description: 'Access to cutting-edge AI services from leading providers worldwide.',
    },
  ];

  const services = [
    {
      icon: '🧠',
      title: 'Language Models',
      description: 'Advanced AI language models for text generation, analysis, and conversation.',
      badge: 'Popular',
    },
    {
      icon: '🎨',
      title: 'Image Generation',
      description: 'Create stunning images and artwork using state-of-the-art AI models.',
      badge: 'New',
    },
    {
      icon: '💻',
      title: 'Code Execution',
      description: 'Run and execute code in various programming languages safely.',
      badge: null,
    },
    {
      icon: '📊',
      title: 'Data Analysis',
      description: 'Powerful data processing and analysis tools for insights and visualization.',
      badge: null,
    },
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+' },
    { label: 'AI Services', value: '50+' },
    { label: 'Countries', value: '25+' },
    { label: 'Uptime', value: '99.9%' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              ⚡ Trusted by 10,000+ users worldwide
            </div>
            <h1 className="hero-title">
              Access Premium <span className="hero-highlight">AI Services</span> with Confidence
            </h1>
            <p className="hero-description">
              Your gateway to cutting-edge AI tools and services. Secure payments, 
              verified providers, and dedicated support for all your AI needs.
            </p>

            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary">
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary">
                    Get Started Free →
                  </Link>
                  <Link to="/services" className="btn btn-secondary">
                    Browse Services
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
            <h2 className="section-title">Why Choose Our Platform?</h2>
            <p className="section-description">
              We provide a secure, reliable, and user-friendly platform for accessing 
              premium AI services from around the world.
            </p>
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

      {/* Services Section */}
      <section className="services-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Explore AI Services</h2>
            <p className="section-description">
              Discover a wide range of AI services from leading providers, 
              all available through our secure platform.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-header">
                  <div className="service-icon">{service.icon}</div>
                  {service.badge && (
                    <span className={`service-badge ${service.badge.toLowerCase()}`}>
                      {service.badge}
                    </span>
                  )}
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <button className="service-button">Learn More →</button>
              </div>
            ))}
          </div>

          <div className="section-cta">
            <Link to="/services" className="btn btn-secondary">
              View All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* LLM Menu Section */}
      <section className="llm-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">{t('llmServices')}</h2>
          </div>
          <ul className="llm-list">
            {llmServices.map(service => (
              <li key={service.id} className="llm-item">
                <Link to={`/llms/${service.id}`}>{service.name}</Link>
                <p>{service.intro}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-description">
              Join thousands of users who trust our platform for their AI service needs. 
              Start your journey today with our secure and reliable platform.
            </p>
            
            <div className="cta-buttons">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-light">
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-light">
                    Create Free Account →
                  </Link>
                  <Link to="/login" className="btn btn-outline">
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="cta-features">
              <div className="cta-feature">
                ✓ No setup fees
              </div>
              <div className="cta-feature">
                ✓ Secure payments
              </div>
              <div className="cta-feature">
                ✓ 24/7 support
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;

