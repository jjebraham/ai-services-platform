import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Mock service data (same as in ServicesPage)
const mockServices = [
  {
    id: 1,
    name: 'GPT-4 Text Generation',
    description: 'Advanced AI text generation with GPT-4 for content creation, writing assistance, and more.',
    longDescription: 'GPT-4 is the latest and most advanced language model from OpenAI, offering unprecedented capabilities in text generation, understanding, and reasoning. Perfect for content creation, writing assistance, code generation, and complex problem-solving tasks.',
    category: 'text',
    price: 0.03,
    priceUnit: 'per 1K tokens',
    rating: 4.8,
    reviews: 1250,
    features: ['High-quality output', 'Multiple languages', 'Custom prompts', 'Fast processing', 'Context awareness', 'Creative writing'],
    provider: 'OpenAI',
    status: 'active',
    image: '🤖',
    tags: ['AI', 'Text', 'GPT-4', 'Writing'],
    specifications: {
      'Model Version': 'GPT-4',
      'Max Tokens': '8,192',
      'Languages': '100+',
      'Response Time': '< 2 seconds',
      'Accuracy': '95%+',
      'API Rate Limit': '10,000 requests/hour'
    },
    useCases: [
      'Content Creation',
      'Code Generation',
      'Language Translation',
      'Creative Writing',
      'Technical Documentation',
      'Customer Support'
    ]
  },
  {
    id: 2,
    name: 'DALL-E 3 Image Generation',
    description: 'Create stunning images from text descriptions using the latest DALL-E 3 model.',
    longDescription: 'DALL-E 3 represents the cutting edge of AI image generation, capable of creating highly detailed, creative, and contextually accurate images from simple text prompts. Perfect for marketing, design, and creative projects.',
    category: 'image',
    price: 0.04,
    priceUnit: 'per image',
    rating: 4.9,
    reviews: 890,
    features: ['High resolution', 'Creative styles', 'Text-to-image', 'Commercial use', 'Style consistency', 'Brand safety'],
    provider: 'OpenAI',
    status: 'active',
    image: '🎨',
    tags: ['AI', 'Image', 'DALL-E', 'Creative'],
    specifications: {
      'Model Version': 'DALL-E 3',
      'Resolution': 'Up to 1024x1024',
      'Styles': 'Unlimited',
      'Generation Time': '< 10 seconds',
      'Format': 'PNG, JPEG',
      'Commercial Use': 'Allowed'
    },
    useCases: [
      'Marketing Materials',
      'Social Media Content',
      'Product Mockups',
      'Concept Art',
      'Illustrations',
      'Brand Assets'
    ]
  }
];

function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundService = mockServices.find(s => s.id === parseInt(id));
      if (foundService) {
        setService(foundService);
      } else {
        navigate('/services');
      }
    } catch (error) {
      console.error('Failed to load service:', error);
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderService = async () => {
    if (!user) {
      alert('Please log in to order services');
      navigate('/login');
      return;
    }

    try {
      alert(`Ordering ${quantity}x ${service.name}... This would integrate with a payment system.`);
    } catch (error) {
      alert('Failed to order service. Please try again.');
    }
  };

  const formatPrice = (price, unit, qty = 1) => {
    return `$${(price * qty).toFixed(3)} ${unit}`;
  };

  if (loading) {
    return (
      <div className="service-detail-loading">
        <div className="loading-spinner">⏳</div>
        <p>Loading service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-not-found">
        <h2>Service not found</h2>
        <p>The service you're looking for doesn't exist.</p>
        <Link to="/services" className="back-link">← Back to Services</Link>
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/services" className="breadcrumb-link">Services</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{service.name}</span>
      </div>

      {/* Service Header */}
      <div className="service-detail-header">
        <div className="service-header-content">
          <div className="service-icon-large">{service.image}</div>
          <div className="service-header-info">
            <div className="service-category-badge">{service.category}</div>
            <h1 className="service-detail-title">{service.name}</h1>
            <p className="service-detail-description">{service.description}</p>
            
            <div className="service-meta">
              <div className="service-rating">
                <div className="rating-stars">
                  {'⭐'.repeat(Math.floor(service.rating))}
                  <span className="rating-number">{service.rating}</span>
                </div>
                <span className="rating-reviews">({service.reviews} reviews)</span>
              </div>
              
              <div className="service-provider">
                <span className="provider-label">By</span>
                <span className="provider-name">{service.provider}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Card */}
        <div className="order-card">
          <div className="price-section">
            <div className="price-display">
              <span className="price">{formatPrice(service.price, service.priceUnit)}</span>
            </div>
            
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="quantity-input"
              />
            </div>
            
            {quantity > 1 && (
              <div className="total-price">
                Total: {formatPrice(service.price, service.priceUnit, quantity)}
              </div>
            )}
          </div>

          <button
            className="order-button-large"
            onClick={handleOrderService}
          >
            Order Now
          </button>

          <div className="order-features">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Instant delivery</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <span>Secure payment</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔄</span>
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="service-tabs">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Features
          </button>
          <button
            className={`tab-button ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="tab-panel">
              <h3>About this service</h3>
              <p>{service.longDescription}</p>
              
              <h4>Use Cases</h4>
              <div className="use-cases-grid">
                {service.useCases.map((useCase, index) => (
                  <div key={index} className="use-case-item">
                    <span className="use-case-icon">✓</span>
                    <span>{useCase}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="tab-panel">
              <h3>Key Features</h3>
              <div className="features-grid">
                {service.features.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <span className="feature-icon">🔥</span>
                    <span className="feature-name">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="tab-panel">
              <h3>Technical Specifications</h3>
              <div className="specifications-table">
                {Object.entries(service.specifications).map(([key, value]) => (
                  <div key={key} className="spec-row">
                    <div className="spec-label">{key}</div>
                    <div className="spec-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-panel">
              <h3>Customer Reviews</h3>
              <div className="reviews-summary">
                <div className="rating-breakdown">
                  <div className="overall-rating">
                    <span className="rating-large">{service.rating}</span>
                    <div className="rating-stars-large">
                      {'⭐'.repeat(Math.floor(service.rating))}
                    </div>
                    <span className="total-reviews">{service.reviews} reviews</span>
                  </div>
                </div>
              </div>
              
              <div className="sample-reviews">
                <div className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">John D.</span>
                    <div className="review-rating">⭐⭐⭐⭐⭐</div>
                  </div>
                  <p className="review-text">
                    "Excellent service! The quality is outstanding and the response time is incredibly fast. Highly recommended for professional use."
                  </p>
                </div>
                
                <div className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">Sarah M.</span>
                    <div className="review-rating">⭐⭐⭐⭐⭐</div>
                  </div>
                  <p className="review-text">
                    "Perfect for our content creation needs. The AI understands context very well and produces high-quality results consistently."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServiceDetailPage;
