import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('input'); // input, loading, success, error, resend
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    }

    if (token) {
      // If token is provided in URL, verify automatically
      verifyEmail(token);
    } else {
      // No token provided, show input form for 6-digit code
      setStatus('input');
      setMessage('Please enter the 6-digit verification code sent to your email.');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Email verification failed.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage('Please enter a valid 6-digit verification code.');
      return;
    }

    await verifyEmail(verificationCode);
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Email address is required to resend verification.');
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || 'Verification email sent! Please check your inbox.');
      } else {
        setMessage(data.error || 'Failed to resend verification email.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (status === 'loading' || isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="space-y-6 text-center">
              <LoadingSpinner />
              <h1 className="text-3xl font-bold">Verifying Email</h1>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="space-y-6 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-green-600">Email Verified!</h1>
              <p className="text-gray-600">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to dashboard in 3 seconds...
              </p>
              <Link to="/dashboard">
                <Button className="w-full">
                  Continue to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="space-y-6 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-red-600">Verification Failed</h1>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
              
              {email && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Would you like to resend the verification email?
                  </p>
                  <Button 
                    onClick={handleResendVerification}
                    disabled={isResending}
                    variant="outline"
                    className="w-full"
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                </div>
              )}
              
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default input state for 6-digit code
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Verify Your Email</h1>
            <p className="text-gray-600">
              {message || 'Enter the 6-digit verification code sent to your email address.'}
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  maxLength="6"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    setVerificationCode(value);
                  }}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ letterSpacing: '0.5em' }}
                />
              </div>
              
              <Button 
                onClick={handleVerifyCode}
                disabled={isVerifying || verificationCode.length !== 6}
                className="w-full"
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </Button>
            </div>
            
            {email && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Didn't receive the code? Check your spam folder or request a new one.
                </p>
                <div className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button 
                    onClick={handleResendVerification}
                    disabled={isResending}
                    variant="outline"
                    className="w-full"
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Code'}
                  </Button>
                </div>
              </div>
            )}
            
            <Link to="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;

