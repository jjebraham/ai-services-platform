import React, { useState, useEffect } from 'react';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    category: '',
    price: '',
    unit: '',
    responseTime: '',
    description: '',
    features: '',
    apiEndpoint: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // Mock data for demonstration
      setServices([
        {
          _id: '1',
          name: 'OpenAI GPT-4',
          provider: 'OpenAI',
          category: 'language_models',
          price: 0.03,
          unit: '1K tokens',
          responseTime: '< 2s',
          description: 'Most capable GPT model for complex tasks requiring deep understanding',
          features: ['Text Generation', 'Code Assistance', 'Analysis'],
          apiEndpoint: 'https://api.openai.com/v1/chat/completions',
          isActive: true,
          orderCount: 1250,
          revenue: 37500
        },
        {
          _id: '2',
          name: 'DALL-E 3',
          provider: 'OpenAI',
          category: 'image_generation',
          price: 0.04,
          unit: 'image',
          responseTime: '< 10s',
          description: 'Advanced AI image generation with improved quality and prompt adherence',
          features: ['High Quality Images', 'Prompt Adherence', 'Style Control'],
          apiEndpoint: 'https://api.openai.com/v1/images/generations',
          isActive: true,
          orderCount: 850,
          revenue: 34000
        },
        {
          _id: '3',
          name: 'Claude 3 Sonnet',
          provider: 'Anthropic',
          category: 'language_models',
          price: 0.015,
          unit: '1K tokens',
          responseTime: '< 3s',
          description: 'Balanced AI assistant for a wide range of tasks',
          features: ['Reasoning', 'Analysis', 'Creative Writing'],
          apiEndpoint: 'https://api.anthropic.com/v1/messages',
          isActive: false,
          orderCount: 420,
          revenue: 6300
        }
      ]);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Service name is required';
    if (!formData.provider.trim()) errors.provider = 'Provider is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required';
    if (!formData.unit.trim()) errors.unit = 'Unit is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      // Mock API call
      const newService = {
        _id: Date.now().toString(),
        ...formData,
        price: parseFloat(formData.price),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        orderCount: 0,
        revenue: 0
      };
      
      setServices(prev => [...prev, newService]);
      resetForm();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      // Mock API call
      const updatedService = {
        ...editingService,
        ...formData,
        price: parseFloat(formData.price),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      };
      
      setServices(prev => prev.map(s => s._id === editingService._id ? updatedService : s));
      resetForm();
      setShowCreateForm(false);
      setEditingService(null);
    } catch (error) {
      console.error('Error updating service:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      // Mock API call
      setServices(prev => prev.filter(s => s._id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleStatus = async (serviceId, currentStatus) => {
    try {
      // Mock API call
      setServices(prev => prev.map(s => 
        s._id === serviceId ? { ...s, isActive: !currentStatus } : s
      ));
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
  };

  const startEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      provider: service.provider,
      category: service.category,
      price: service.price.toString(),
      unit: service.unit,
      responseTime: service.responseTime || '',
      description: service.description,
      features: service.features.join(', '),
      apiEndpoint: service.apiEndpoint || '',
      isActive: service.isActive
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provider: '',
      category: '',
      price: '',
      unit: '',
      responseTime: '',
      description: '',
      features: '',
      apiEndpoint: '',
      isActive: true
    });
    setFormErrors({});
  };

  const cancelEdit = () => {
    setShowCreateForm(false);
    setEditingService(null);
    resetForm();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      language_models: '🤖',
      image_generation: '🎨',
      code_execution: '💻',
      data_analysis: '📊',
      ai_tools: '⚡'
    };
    return icons[category] || '🔧';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      language_models: 'Language Models',
      image_generation: 'Image Generation',
      code_execution: 'Code Execution',
      data_analysis: 'Data Analysis',
      ai_tools: 'AI Tools'
    };
    return labels[category] || category;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && service.isActive) ||
                         (statusFilter === 'inactive' && !service.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-services">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-services">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Service Management</h1>
              <p>Manage AI services, pricing, and availability</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              <span className="btn-icon">➕</span>
              Add Service
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="form-section">
            <div className="form-header">
              <h2>{editingService ? 'Edit Service' : 'Create New Service'}</h2>
              <button onClick={cancelEdit} className="btn-close">
                ✕
              </button>
            </div>

            <form onSubmit={editingService ? handleUpdateService : handleCreateService} className="service-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Service Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., OpenAI GPT-4"
                  />
                  {formErrors.name && (
                    <p className="form-error">{formErrors.name}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Provider *</label>
                  <input
                    type="text"
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., OpenAI"
                  />
                  {formErrors.provider && (
                    <p className="form-error">{formErrors.provider}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select a category</option>
                    <option value="language_models">Language Models</option>
                    <option value="image_generation">Image Generation</option>
                    <option value="code_execution">Code Execution</option>
                    <option value="data_analysis">Data Analysis</option>
                    <option value="ai_tools">AI Tools</option>
                  </select>
                  {formErrors.category && (
                    <p className="form-error">{formErrors.category}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Price (USD) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.001"
                    className="form-input"
                    placeholder="0.03"
                  />
                  {formErrors.price && (
                    <p className="form-error">{formErrors.price}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., 1K tokens, image, execution"
                  />
                  {formErrors.unit && (
                    <p className="form-error">{formErrors.unit}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Response Time</label>
                  <input
                    type="text"
                    name="responseTime"
                    value={formData.responseTime}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., < 2s, < 10s"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                    placeholder="Describe the service and its capabilities..."
                  />
                  {formErrors.description && (
                    <p className="form-error">{formErrors.description}</p>
                  )}
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Features (comma-separated)</label>
                  <input
                    type="text"
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Text Generation, Code Assistance, Analysis"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">API Endpoint</label>
                  <input
                    type="url"
                    name="apiEndpoint"
                    value={formData.apiEndpoint}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://api.example.com/v1/service"
                  />
                </div>

                <div className="form-group form-group-full">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <label className="checkbox-label">
                      Service is active and available to users
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? (
                    <>
                      <span className="btn-icon">⏳</span>
                      {editingService ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">💾</span>
                      {editingService ? 'Update Service' : 'Create Service'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-content">
            <div className="search-group">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                <option value="language_models">Language Models</option>
                <option value="image_generation">Image Generation</option>
                <option value="code_execution">Code Execution</option>
                <option value="data_analysis">Data Analysis</option>
                <option value="ai_tools">AI Tools</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {filteredServices.map((service) => (
            <div key={service._id} className="service-card">
              <div className="service-header">
                <div className="service-info">
                  <div className={`service-icon ${service.isActive ? 'active' : 'inactive'}`}>
                    <span>{getCategoryIcon(service.category)}</span>
                  </div>
                  <div className="service-details">
                    <h3 className="service-name">{service.name}</h3>
                    <p className="service-provider">{service.provider}</p>
                  </div>
                </div>
                <div className="service-actions">
                  <button
                    onClick={() => handleToggleStatus(service._id, service.isActive)}
                    className={`action-btn ${service.isActive ? 'active' : 'inactive'}`}
                    title={service.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {service.isActive ? '👁️' : '🙈'}
                  </button>
                  <button
                    onClick={() => startEdit(service)}
                    className="action-btn edit"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="action-btn delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <p className="service-description">
                {service.description}
              </p>

              <div className="service-meta">
                <div className="meta-item">
                  <span className="meta-label">Category</span>
                  <span className="meta-value">{getCategoryLabel(service.category)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Price</span>
                  <span className="meta-value">{formatCurrency(service.price)} per {service.unit}</span>
                </div>
                {service.responseTime && (
                  <div className="meta-item">
                    <span className="meta-label">Response Time</span>
                    <span className="meta-value">{service.responseTime}</span>
                  </div>
                )}
              </div>

              <div className="service-footer">
                <span className={`status-badge ${service.isActive ? 'active' : 'inactive'}`}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
                
                <div className="service-stats">
                  <div className="stat-item">
                    <span className="stat-icon">👥</span>
                    <span className="stat-value">{service.orderCount || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <span className="stat-value">{formatCurrency(service.revenue || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <h3 className="empty-title">No services found</h3>
            <p className="empty-description">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first AI service'
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
              <div className="empty-action">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary"
                >
                  <span className="btn-icon">➕</span>
                  Add Service
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminServices;

