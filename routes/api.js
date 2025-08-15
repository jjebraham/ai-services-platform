// API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API client class
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get default headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses (like file downloads)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // POST request with FormData (for file uploads)
  async postFormData(endpoint, formData) {
    const token = this.getAuthToken();
    const headers = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers,
      includeAuth: false, // We manually add auth header above
    });
  }
}

// Create API client instance
const api = new ApiClient();

// User API methods
export const userAPI = {
  getDashboardData: () => api.get("/users/dashboard"),
  submitKYCDocuments: (formData) => api.postFormData("/kyc/submit", formData),
  updateProfile: (profileData) => api.put("/users/profile", profileData),
};

// Authentication API methods
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Logout user
  logout: () => api.post('/auth/logout'),
  
  // Get current user profile
  getProfile: () => api.get('/auth/me'),
  
  // Update user profile
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  
  // Request password reset
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  
  // Verify email
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  
  // Resend verification email
  resendVerification: () => api.post('/auth/resend-verification'),
  
  // Google OAuth login
  googleLogin: (credential) => api.post('/auth/google', { credential }),
};

// KYC API methods
export const kycAPI = {
  // Submit KYC information
  submit: (formData) => api.postFormData('/kyc/submit', formData),
  
  // Get KYC status
  getStatus: () => api.get('/kyc/status'),
};

// Services API methods
export const servicesAPI = {
  // Get all services
  getAll: (params = {}) => api.get('/services', params),
  
  // Get service by slug
  getBySlug: (slug) => api.get(`/services/${slug}`),
  
  // Get service categories
  getCategories: () => api.get('/services/meta/categories'),
  
  // Get service providers
  getProviders: () => api.get('/services/meta/providers'),
  
  // Get service statistics
  getStats: () => api.get('/services/meta/stats'),
};

// Orders API methods
export const ordersAPI = {
  // Create new order
  create: (orderData) => api.post('/orders', orderData),
  
  // Get user orders
  getAll: (params = {}) => api.get('/orders', params),
  
  // Get order by ID
  getById: (id) => api.get(`/orders/${id}`),
  
  // Cancel order
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

// Support tickets API methods
export const ticketsAPI = {
  // Create new ticket
  create: (formData) => api.postFormData('/tickets', formData),
  
  // Get user tickets
  getAll: (params = {}) => api.get('/tickets', params),
  
  // Get ticket by ID
  getById: (id) => api.get(`/tickets/${id}`),
  
  // Add message to ticket
  addMessage: (id, formData) => api.postFormData(`/tickets/${id}/messages`, formData),
  
  // Close ticket
  close: (id) => api.put(`/tickets/${id}/close`),
};

// Notifications API methods
export const notificationsAPI = {
  // Get user notifications
  getAll: (params = {}) => api.get('/notifications', params),
  
  // Mark notification as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  
  // Mark all notifications as read
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  
  // Delete notification
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Admin API methods (for admin users)
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Users management
  getUsers: (params = {}) => api.get('/admin/users', params),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  
  // Orders management
  getOrders: (params = {}) => api.get('/admin/orders', params),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  
  // Services management
  getServices: (params = {}) => api.get('/admin/services', params),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (key, data) => api.put(`/admin/settings/${key}`, data),
  
  // Exchange rate
  refreshExchangeRate: () => api.post('/admin/exchange-rate/refresh'),
  
  // KYC management
  getPendingKYC: (params = {}) => api.get('/kyc/pending', params),
  getKYCForReview: (userId) => api.get(`/kyc/review/${userId}`),
  reviewKYC: (userId, data) => api.put(`/kyc/review/${userId}`, data),
  getKYCStats: () => api.get('/kyc/stats'),
  
  // Tickets management
  getAllTickets: (params = {}) => api.get('/tickets/admin/all', params),
  assignTicket: (id, data) => api.put(`/tickets/${id}/assign`, data),
  updateTicketStatus: (id, data) => api.put(`/tickets/${id}/status`, data),
  getTicketStats: () => api.get('/tickets/admin/stats'),
};

// Export the main API client
export default api;

