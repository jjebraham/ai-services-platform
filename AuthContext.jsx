import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './services/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in on app start
    checkAuthStatus();
  }, []);

  const clearError = () => {
    setError('');
  };

  const checkAuthStatus = async () => {
    try {
      // Check localStorage for existing session
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
      } else {
        // Try to check with backend API for existing session
        try {
          const response = await fetch('/api/auth/status', {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.isAuthenticated && data.user) {
              const userData = {
                id: data.user.id,
                email: data.user.email || data.user.phone,
                phone: data.user.phone,
                name: data.user.name || data.user.email?.split('@')[0] || data.user.phone,
                firstName: data.user.first_name,
                lastName: data.user.last_name,
                role: data.user.role || 'user',
                balance: data.user.balance || 0
              };

              localStorage.setItem('user', JSON.stringify(userData));
              setIsAuthenticated(true);
              setUser(userData);
              setIsAdmin(userData.role === 'admin');
            }
          }
        } catch (error) {
          console.log('Backend auth check failed, user not logged in');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password, userData = null) => {
    try {
      setError('');
      
      // If userData is provided (from phone auth), use it directly
      if (userData) {
        const formattedUser = {
          id: userData.id,
          email: userData.email,
          phone: userData.phone,
          name: userData.name || userData.email?.split('@')[0] || userData.phone,
          role: userData.role || 'user',
          balance: userData.balance || 0
        };

        // Store auth token if provided (e.g. from Google OAuth)
        if (userData.token) {
          localStorage.setItem('authToken', userData.token);
        }

        localStorage.setItem('user', JSON.stringify(formattedUser));
        setIsAuthenticated(true);
        setUser(formattedUser);
        setIsAdmin(formattedUser.role === 'admin');
        return { success: true };
      }

      // Email/password login
      if (email && password) {
        const response = await authAPI.login({ email, password });

        if (response.success) {
          const formattedUser = {
            id: response.user.id,
            email: response.user.email,
            phone: response.user.phone,
            name: response.user.name || response.user.email.split('@')[0],
            role: response.user.role || 'user',
            balance: response.user.balance || 0
          };

          // Store auth token if backend returns one
          if (response.token) {
            localStorage.setItem('authToken', response.token);
          }

          localStorage.setItem('user', JSON.stringify(formattedUser));
          setIsAuthenticated(true);
          setUser(formattedUser);
          setIsAdmin(formattedUser.role === 'admin');
          return { success: true };
        } else {
          setError(response.error || 'Login failed');
          throw new Error(response.error || 'Login failed');
        }
      }
      
      throw new Error('Email and password required');
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setError('');
      
      if (userData.email && userData.password) {
        const response = await authAPI.register(userData);
        
        if (response.success) {
          return { success: true };
        } else {
          setError(response.error || 'Registration failed');
          return { success: false, error: response.error || 'Registration failed' };
        }
      } else if (userData.phone) {
        // Phone-based registration
        const response = await authAPI.register(userData);
        
        if (response.success) {
          return { success: true };
        } else {
          setError(response.error || 'Registration failed');
          return { success: false, error: response.error || 'Registration failed' };
        }
      } else {
        const errorMsg = 'Email and password or phone required';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear localStorage and state regardless of API call result
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
      setError('');
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    isAdmin,
    error,
    login,
    register,
    logout,
    checkAuthStatus,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};