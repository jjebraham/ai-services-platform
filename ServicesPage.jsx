import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { llmServices } from './llmData';

function ServicesPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [basket, setBasket] = useState([]);

  const sortOptions = [
    { value: 'name', label: t('sortByName') },
    { value: 'price', label: t('sortByPrice') },
  ];

  useEffect(() => {
    loadServices();
    fetchExchangeRate();
  }, [lang]); // Add lang dependency

  useEffect(() => {
    filterAndSortServices();
  }, [services, searchQuery, sortBy, lang]);

  const loadServices = async () => {
    try {
      // Transform LLM services data to match component structure
      const transformedServices = llmServices.map(service => ({
        _id: service.id,
        name: service.name[lang] || service.name.en,
        description: service.details[lang] || service.details.en,
        intro: service.intro[lang] || service.intro.en,
        priceUSD: service.priceUSD,
        unit: service.unit[lang] || service.unit.en || service.unit,
        isActive: true,
        rating: service.rating,
        popularity: service.popularity,
        features: service.features[lang] || service.features.en || service.features || [],
        pros: service.pros[lang] || service.pros.en || service.pros || [],
        bestFor: service.bestFor[lang] || service.bestFor.en || service.bestFor || '',
        provider: service.provider[lang] || service.provider.en || service.provider,
        responseTime: service.responseTime[lang] || service.responseTime.en || service.responseTime,
        image: service.icon
      }));
      
      // Use LLM services data
      setServices(transformedServices);
    } catch (error) {
      console.error('Failed to load services:', error);
      // Use LLM services as fallback
      const transformedServices = llmServices.map(service => ({
        _id: service.id,
        name: service.name[lang] || service.name.en,
        description: service.details[lang] || service.details.en,
        intro: service.intro[lang] || service.intro.en,
        priceUSD: service.priceUSD,
        unit: service.unit[lang] || service.unit.en || service.unit,
        isActive: true,
        rating: service.rating,
        popularity: service.popularity,
        features: service.features[lang] || service.features.en || service.features || [],
        pros: service.pros[lang] || service.pros.en || service.pros || [],
        bestFor: service.bestFor[lang] || service.bestFor.en || service.bestFor || '',
        provider: service.provider[lang] || service.provider.en || service.provider,
        responseTime: service.responseTime[lang] || service.responseTime.en || service.responseTime,
        image: service.icon
      }));
      setServices(transformedServices);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      // Mock exchange rate for demonstration
      setExchangeRate(42000); // 1 USD = 42,000 Toman
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      setExchangeRate(42000); // Fallback rate
    }
  };

  const filterAndSortServices = () => {
    let filtered = services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && service.isActive;
    });

    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.priceUSD - b.priceUSD;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredServices(filtered);
  };

  const formatPrice = (priceUSD, unit) => {
    if (!exchangeRate) return `$${priceUSD} ${unit}`;
    const priceIRR = Math.round(priceUSD * exchangeRate);
    return `${priceIRR.toLocaleString()} ﷼ ${unit}`;
  };



  const handleAddToBasket = (service) => {
    if (!user) {
      alert(t('loginToOrder'));
      return;
    }
    setBasket(prev => [...prev, service]);
  };

  const subtotal = basket.reduce((sum, item) => sum + item.priceUSD, 0);
  const taxAmount = subtotal * 0.05;
  const vatAmount = subtotal * 0.09;
  const totalAmount = subtotal + taxAmount + vatAmount;

  if (isLoading) {
    return (
      <div className={`services-page ${lang === 'fa' ? 'rtl' : ''}`}>
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>{t('loadingServices')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`services-page ${lang === 'fa' ? 'rtl' : ''}`}>
      <div className="services-container">
        {/* Header */}
        <div className="services-header">
          <h1>{t('llmModelsTitle')}</h1>
          <p>
            {t('llmModelsDescription')}
          </p>
          {exchangeRate && (
            <div className="exchange-rate">
              <span>💱</span>
              <span>{t('exchangeRate').replace('{rate}', exchangeRate.toLocaleString())}</span>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="services-filters">
          <div className="filters-row">
            {/* Search */}
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Sort */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="results-count">
            <p>{t('showingResults').replace('{count}', filteredServices.length).replace('{total}', services.length)}</p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {filteredServices.map((service) => (
            <div key={service._id} className="service-card">
              <div className="service-header">
                <div className="service-info">
                  <div className="service-icon">
                    <span className="category-icon">{service.image}</span>
                  </div>
                  <div className="service-details">
                    <h3 className="service-name">{service.name}</h3>
                    <p className="service-provider">{service.provider}</p>
                  </div>
                </div>
                <div className="service-category">
                  {t('languageModel')}
                </div>
              </div>

              <div className="service-description">
                {service.intro}
              </div>

              <div className="service-content">
                {/* Pros */}
                {service.pros && service.pros.length > 0 && (
                  <div className="service-pros">
                    <h4>{t('pros') || 'Pros'}</h4>
                    <div className="pros-list">
                      {service.pros.slice(0, 3).map((pro, index) => (
                        <div key={index} className="pro-item">
                          <span className="pro-icon">✅</span>
                          <span className="pro-text">{pro}</span>
                        </div>
                      ))}
                      {service.pros.length > 3 && (
                        <div className="pro-item more">
                          <span className="pro-icon">➕</span>
                          <span className="pro-text">{t('morePros') || `+${service.pros.length - 3} more`}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Best For */}
                {service.bestFor && (
                  <div className="service-best-for">
                    <h4>{t('bestFor') || 'Best For'}</h4>
                    <p className="best-for-text">{service.bestFor}</p>
                  </div>
                )}

                {/* Features */}
                <div className="service-features">
                  <h4>{t('keyFeatures')}</h4>
                  <div className="features-list">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                    {service.features.length > 3 && (
                      <span className="feature-tag more">
                        {t('moreFeatures').replace('{count}', service.features.length - 3)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="service-stats">
                  <div className="stat">
                    <div className="stat-value">
                      <span>⏱️</span>
                      <span>{service.responseTime}</span>
                    </div>
                    <p className="stat-label">{t('response')}</p>
                  </div>
                </div>

                {/* Pricing and Action */}
                <div className="service-pricing">
                  <div className="price-display">
                    <div className="price-main">
                      {formatPrice(service.priceUSD, service.unit)}
                    </div>
                    {exchangeRate && (
                      <div className="price-usd">
                        ${service.priceUSD} {service.unit}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToBasket(service)}
                    className="order-button"
                  >
                    {t('addToBasket')}
                    <span>{lang === 'fa' ? '←' : '→'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Basket */}
        <div className="basket">
          <h2>{t('basket')}</h2>
          {basket.length === 0 ? (
            <p>{t('emptyBasket')}</p>
          ) : (
            <div>
              {basket.map((item, idx) => (
                <div key={idx} className="basket-item">
                  <span>{item.name}</span>
                  <span>${item.priceUSD.toFixed(2)}</span>
                </div>
              ))}
              <div className="basket-summary">
                <div>{t('subtotal')}: ${subtotal.toFixed(2)}</div>
                <div>{t('tax')}: ${taxAmount.toFixed(2)}</div>
                <div>{t('vat')}: ${vatAmount.toFixed(2)}</div>
                <div>{t('total')}: ${totalAmount.toFixed(2)}</div>
              </div>
              <button className="pay-button">{t('pay')}</button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>{t('noModelsFound')}</h3>
            <p>
              {t('noModelsDescription')}
            </p>
            <button 
              className="clear-filters-button"
              onClick={() => {
                setSearchQuery('');
              }}
            >
              {t('clearSearch')}
            </button>
          </div>
        )}

        {/* Information Section */}
        <div className="services-info">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">🔒</div>
              <h3>{t('secureReliableTitle')}</h3>
              <p>{t('secureReliableDesc')}</p>
            </div>
            <div className="info-card">
              <div className="info-icon">💰</div>
              <h3>{t('transparentPricingTitle')}</h3>
              <p>{t('transparentPricingDesc')}</p>
            </div>
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <h3>{t('fastPerformanceTitle')}</h3>
              <p>{t('fastPerformanceDesc')}</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🎯</div>
              <h3>{t('qualityAssuredTitle')}</h3>
              <p>{t('qualityAssuredDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServicesPage;

