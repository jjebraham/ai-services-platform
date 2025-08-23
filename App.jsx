import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navigation from './Navigation';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import VerifyEmailPage from './VerifyEmailPage';
import DashboardPage from './DashboardPage';
import ServicesPage from './ServicesPage';
import ServiceDetailPage from './ServiceDetailPage';
import LLMDetailPage from './LLMDetailPage';
import PaymentsPage from './PaymentsPage';
import BasketPage from './BasketPage';
import Footer from './Footer';
import { BasketProvider } from './BasketContext';
import { LanguageProvider } from './LanguageContext';
import { ThemeProvider } from './ThemeContext';
import AdminRoute from './AdminRoute';
import AdminDashboard from './AdminDashboard';
import AdminServices from './AdminServices';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

// Protected Route component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

// Public Route component (redirects to dashboard if already logged in)
function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <BasketProvider>
            <Router>
              <div className="App">
                <Navigation />
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:id" element={<ServiceDetailPage />} />
                <Route path="/llms/:id" element={<LLMDetailPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/basket" element={<BasketPage />} />
            
            {/* Public Routes (when not authenticated) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route path="/auth/login" element={<Navigate to="/login" replace />} />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route path="/auth/register" element={<Navigate to="/register" replace />} />
            
            {/* Email Verification Route */}
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            
            {/* Protected Routes (require authentication) */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
            <Route 
              path="/admin/services" 
              element={
                <AdminRoute>
                  <AdminServices />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              } 
            />
                </Routes>
                <Footer />
              </div>
            </Router>
          </BasketProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;