import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground">
        <div className="flex flex-col justify-center items-center w-full p-12">
          <div className="max-w-md text-center space-y-6">
            <Link to="/" className="flex items-center justify-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground text-primary">
                <Zap className="h-8 w-8" />
              </div>
              <span className="text-3xl font-bold">AI Services</span>
            </Link>
            
            <h1 className="text-4xl font-bold leading-tight">
              Access Premium AI Tools with Confidence
            </h1>
            
            <p className="text-xl text-primary-foreground/80">
              Secure payments, verified services, and dedicated support for all your AI needs.
            </p>
            
            <div className="grid grid-cols-1 gap-4 pt-8">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                  <span className="text-sm font-semibold">✓</span>
                </div>
                <span>Secure KYC verification process</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                  <span className="text-sm font-semibold">✓</span>
                </div>
                <span>Real-time currency conversion</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                  <span className="text-sm font-semibold">✓</span>
                </div>
                <span>24/7 customer support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                  <span className="text-sm font-semibold">✓</span>
                </div>
                <span>Premium AI service providers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center justify-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">AI Services</span>
            </Link>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;

