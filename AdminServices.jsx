import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Activity, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye,
  EyeOff,
  DollarSign,
  Star,
  Clock,
  Users,
  BarChart3,
  Settings,
  Save,
  X
} from 'lucide-react';
import { api } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const serviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  provider: z.string().min(2, 'Provider must be at least 2 characters'),
  category: z.enum(['language_models', 'image_generation', 'code_execution', 'data_analysis', 'ai_tools'], {
    required_error: 'Please select a category',
  }),
  price: z.number().min(0.001, 'Price must be greater than 0').max(1000, 'Price must be less than $1000'),
  unit: z.string().min(1, 'Unit is required'),
  responseTime: z.string().optional(),
  features: z.string().optional(),
  apiEndpoint: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      isActive: true,
      responseTime: '< 2s',
      unit: '1K tokens'
    }
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/admin/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (data) => {
    setSubmitting(true);
    try {
      const response = await api.post('/admin/services', data);
      setServices([response.data, ...services]);
      setShowCreateForm(false);
      reset();
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Error creating service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateService = async (data) => {
    setSubmitting(true);
    try {
      const response = await api.put(`/admin/services/${editingService._id}`, data);
      setServices(services.map(service => 
        service._id === editingService._id ? response.data : service
      ));
      setEditingService(null);
      reset();
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Error updating service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await api.delete(`/admin/services/${serviceId}`);
      setServices(services.filter(service => service._id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error deleting service. Please try again.');
    }
  };

  const handleToggleStatus = async (serviceId, currentStatus) => {
    try {
      const response = await api.patch(`/admin/services/${serviceId}`, {
        isActive: !currentStatus
      });
      setServices(services.map(service => 
        service._id === serviceId ? response.data : service
      ));
    } catch (error) {
      console.error('Error toggling service status:', error);
      alert('Error updating service status. Please try again.');
    }
  };

  const startEdit = (service) => {
    setEditingService(service);
    setShowCreateForm(true);
    
    // Populate form with service data
    Object.keys(service).forEach(key => {
      if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        setValue(key, service[key]);
      }
    });
  };

  const cancelEdit = () => {
    setEditingService(null);
    setShowCreateForm(false);
    reset();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      language_models: Activity,
      image_generation: Eye,
      code_execution: Settings,
      data_analysis: BarChart3,
      ai_tools: Star
    };
    return icons[category] || Activity;
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
    }).format(amount);
  };

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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
              <p className="text-gray-600 mt-2">
                Manage AI services, pricing, and availability
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingService ? 'Edit Service' : 'Create New Service'}
              </h2>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(editingService ? handleUpdateService : handleCreateService)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name *
                  </label>
                  <input
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., OpenAI GPT-4"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider *
                  </label>
                  <input
                    {...register('provider')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., OpenAI"
                  />
                  {errors.provider && (
                    <p className="mt-1 text-sm text-red-600">{errors.provider.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="language_models">Language Models</option>
                    <option value="image_generation">Image Generation</option>
                    <option value="code_execution">Code Execution</option>
                    <option value="data_analysis">Data Analysis</option>
                    <option value="ai_tools">AI Tools</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD) *
                  </label>
                  <input
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    step="0.001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.03"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <input
                    {...register('unit')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1K tokens, image, execution"
                  />
                  {errors.unit && (
                    <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Time
                  </label>
                  <input
                    {...register('responseTime')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., < 2s, < 10s"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the service and its capabilities..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features (comma-separated)
                  </label>
                  <input
                    {...register('features')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Text Generation, Code Assistance, Analysis"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Endpoint
                  </label>
                  <input
                    {...register('apiEndpoint')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://api.example.com/v1/service"
                  />
                  {errors.apiEndpoint && (
                    <p className="mt-1 text-sm text-red-600">{errors.apiEndpoint.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      {...register('isActive')}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Service is active and available to users
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">{editingService ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingService ? 'Update Service' : 'Create Service'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const CategoryIcon = getCategoryIcon(service.category);
            
            return (
              <div key={service._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${service.isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <CategoryIcon className={`h-6 w-6 ${service.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">{service.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(service._id, service.isActive)}
                      className={`p-1 rounded ${service.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-500'}`}
                      title={service.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {service.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => startEdit(service)}
                      className="p-1 text-blue-600 hover:text-blue-700"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="p-1 text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium">{getCategoryLabel(service.category)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Price</span>
                    <span className="font-medium">{formatCurrency(service.price)} per {service.unit}</span>
                  </div>
                  {service.responseTime && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Response Time</span>
                      <span className="font-medium">{service.responseTime}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    service.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{service.orderCount || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      <span>{formatCurrency(service.revenue || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first AI service'
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="mr-2 h-4 w-4" />
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

