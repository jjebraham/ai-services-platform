import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    // Check if user is logged in on app start
    checkAuthStatus();
  }, []);

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
        // For development: automatically create a test admin user
        const testUser = {
          id: 1,
          email: 'admin@test.com',
          name: 'Test Admin',
          role: 'admin'
        };
        localStorage.setItem('user', JSON.stringify(testUser));
        setIsAuthenticated(true);
        setUser(testUser);
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Mock authentication - in production, this would be an API call
      if (email && password) {
        const mockUser = {
          id: 1,
          email: email,
          name: email.split('@')[0],
          role: 'admin' // For demo purposes, make everyone admin
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        setIsAuthenticated(true);
        setUser(mockUser);
        setIsAdmin(true);
        return { success: true };
      } else {
        return { success: false, error: 'Email and password required' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      // Mock registration - in production, this would be an API call
      if (userData.email && userData.password) {
        return { success: true };
      } else {
        return { success: false, error: 'Email and password required' };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    isAdmin,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};