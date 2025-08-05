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
                email: data.user.email,
                name: data.user.name || data.user.email.split('@')[0],
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

  const login = async (userData) => {
    try {
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
        return { success: true };
      } else {
        return { success: false, error: 'User data required' };
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