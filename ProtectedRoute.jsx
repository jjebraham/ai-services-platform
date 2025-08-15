import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoadingSpinner from './LoadingSpinner';

function ProtectedRoute({ children, requireKYC = false }) {
  const { isAuthenticated, isLoading, hasCompletedKYC } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check KYC requirement if specified
  if (requireKYC && !hasCompletedKYC()) {
    return <Navigate to="/dashboard/kyc" replace />;
  }

  return children;
}

export default ProtectedRoute;

