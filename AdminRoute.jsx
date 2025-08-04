import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Checking admin access...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For demo purposes, allow any authenticated user to access admin
  // In production, you would check user.role === 'admin' or similar
  // if (!user.isAdmin) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return children;
}

export default AdminRoute;

