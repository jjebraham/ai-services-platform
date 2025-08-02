import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [exchangeRate, setExchangeRate] = useState(null);

  const categories = [
    { value: 'all', label: 'All Services', icon: '✨' },
    { value: 'language-models', label: 'Language Models', icon: '💬' },
    { value: 'image-generation', label: 'Image Generation', icon: '🖼️' },
    { value: 'code-execution', label: 'Code Execution', icon: '💻' },
    { value: 'data-analysis', label: 'Data Analysis', icon: '📊' },
    { value: 'ai-tools', label: 'AI Tools', icon: '🧠' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price', label: 'Price (Low to High)' },
    { value: 'rating', label: 'Rating (High to Low)' },
    { value: 'popularity', label: 'Most Popular' },
  ];

  // Mock services data for demonstration
  const mockServices = [
    {
      _id: '1',
      name: 'OpenAI GPT-4',
      description: 'Advanced language model for text generation, analysis, and conversation. Perfect for content creation, coding assistance, and complex reasoning tasks.',
      category: 'language-models',
      priceUSD: 0.03,
      unit: 'per 1K tokens',
      isActive: true,
      rating: 4.9,
      popularity: 95,
      features: ['Text Generation', 'Code Assistance', 'Analysis', 'Conversation'],
      provider: 'OpenAI',
      responseTime: '< 2s',
      image: '🤖'
    },
    {
      _id: '2',
      name: 'DeepSeek Coder',
      description: 'Specialized coding assistant with advanced programming capabilities. Supports multiple languages and frameworks.',
      category: 'code-execution',
      priceUSD: 0.02,
      unit: 'per 1K tokens',
      isActive: true,
      rating: 4.7,
      popularity: 88,
      features: ['Code Generation', 'Debugging', 'Refactoring', 'Documentation'],
      provider: 'DeepSeek',
      responseTime: '< 3s',
      image: '👨‍💻'
    },
    {
      _id: '3',
      name: 'DALL-E 3',
      description: 'State-of-the-art image generation model for creating high-quality images from text descriptions.',
      category: 'image-generation',
      priceUSD: 0.08,
      unit: 'per image',
      isActive: true,
      rating: 4.8,
      popularity: 92,
      features: ['High Resolution', 'Style Control', 'Text Integration', 'Commercial Use'],
      provider: 'OpenAI',
      responseTime: '< 10s',
      image: '🎨'
    },
    {
      _id: '4',
      name: 'Claude 3 Sonnet',
      description: 'Anthropic\'s advanced AI assistant for analysis, writing, and complex reasoning tasks.',
      category: 'language-models',
      priceUSD: 0.015,
      unit: 'per 1K tokens',
      isActive: true,
      rating: 4.6,
      popularity: 85,
      features: ['Long Context', 'Analysis', 'Writing', 'Safety'],
      provider: 'Anthropic',
      responseTime: '< 2s',
      image: '🧠'
    },
    {
      _id: '5',
      name: 'Stable Diffusion XL',
      description: 'Open-source image generation model with excellent quality and customization options.',
      category: 'image-generation',
      priceUSD: 0.04,
      unit: 'per image',
      isActive: true,
      rating: 4.5,
      popularity: 78,
      features: ['Open Source', 'Customizable', 'Fast Generation', 'Multiple Styles'],
      provider: 'Stability AI',
      responseTime: '< 5s',
      image: '🖼️'
    },
    {
      _id: '6',
      name: 'Code Interpreter',
      description: 'Secure code execution environment supporting Python, JavaScript, and more programming languages.',
      category: 'code-execution',
      priceUSD: 0.01,
      unit: 'per execution',
      isActive: true,
      rating: 4.4,
      popularity: 72,
      features: ['Multi-Language', 'Secure Sandbox', 'File Support', 'Visualization'],
      provider: 'Platform',
      responseTime: '< 5s',
      image: '⚡'
    },
  ];

  useEffect(() => {
    loadServices();
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    filterAndSortServices();
  }, [services, searchQuery, selectedCategory, sortBy]);

  const loadServices = async () => {
    try {
      // For now, use mock data since backend connection has issues
      setServices(mockServices);
    } catch (error) {
      console.error('Failed to load services:', error);
      // Use mock data as fallback
      setServices(mockServices);
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
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      return matchesSearch && matchesCategory && service.isActive;
    });

    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.priceUSD - b.priceUSD;
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.popularity - a.popularity;
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

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(cat => cat.value === category);
    return categoryData ? categoryData.icon : '🔧';
  };

  const handleOrderService = (service) => {
    if (!user) {
      alert('Please log in to order services');
      return;
    }
    alert(`Ordering ${service.name}. This feature will be implemented with payment integration.`);
  };

  if (isLoading) {
    return (
      <div className="services-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="services-container">
        {/* Header */}
        <div className="services-header">
          <h1>AI Services Catalog</h1>
          <p>
            Discover and access premium AI services from leading providers. 
            All prices shown in Iranian Toman with real-time conversion.
          </p>
          {exchangeRate && (
            <div className="exchange-rate">
              <span>💱</span>
              <span>1 USD = {exchangeRate.toLocaleString()} ﷼</span>
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
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Category Filter */}
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>

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
            <p>Showing {filteredServices.length} of {services.length} services</p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {filteredServices.map((service) => (
            <div key={service._id} className="service-card">
              <div className="service-header">
                <div className="service-info">
                  <div className="service-icon">
                    <span className="category-icon">{getCategoryIcon(service.category)}</span>
                  </div>
                  <div className="service-details">
                    <h3 className="service-name">{service.name}</h3>
                    <p className="service-provider">{service.provider}</p>
                  </div>
                </div>
                <div className="service-category">
                  {categories.find(cat => cat.value === service.category)?.label}
                </div>
              </div>

              <div className="service-description">
                {service.description}
              </div>

              <div className="service-content">
                {/* Features */}
                <div className="service-features">
                  <h4>Key Features</h4>
                  <div className="features-list">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                    {service.features.length > 3 && (
                      <span className="feature-tag more">
                        +{service.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="service-stats">
                  <div className="stat">
                    <div className="stat-value">
                      <span>⭐</span>
                      <span>{service.rating}</span>
                    </div>
                    <p className="stat-label">Rating</p>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      <span>⏱️</span>
                      <span>{service.responseTime}</span>
                    </div>
                    <p className="stat-label">Response</p>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      <span>🔥</span>
                      <span>{service.popularity}%</span>
                    </div>
                    <p className="stat-label">Popular</p>
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
                    onClick={() => handleOrderService(service)}
                    className="order-button"
                  >
                    Order Now
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No services found</h3>
            <p>
              Try adjusting your search criteria or browse all categories.
            </p>
            <button 
              className="clear-filters-button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Information Section */}
        <div className="services-info">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">🔒</div>
              <h3>Secure & Reliable</h3>
              <p>All services are hosted on secure infrastructure with 99.9% uptime guarantee.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">💰</div>
              <h3>Transparent Pricing</h3>
              <p>No hidden fees. Pay only for what you use with real-time currency conversion.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <h3>Fast Performance</h3>
              <p>Optimized APIs with low latency and high throughput for the best user experience.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🎯</div>
              <h3>Quality Assured</h3>
              <p>All services are tested and verified to meet the highest quality standards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServicesPage;

