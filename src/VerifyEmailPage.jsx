import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';

function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get email from navigation state or URL params
    const emailFromState = location.state?.email;
    const urlParams = new URLSearchParams(location.search);
    const emailFromUrl = urlParams.get('email');
    const tokenFromUrl = urlParams.get('token');
    
    const userEmail = emailFromState || emailFromUrl;
    if (userEmail) {
      setEmail(userEmail);
    }

    // If there's a token in URL, verify it automatically
    if (tokenFromUrl) {
      handleTokenVerification(tokenFromUrl);
    }

    // If no email is available, redirect to login
    if (!userEmail && !tokenFromUrl) {
      toast.error('Please register or login first');
      navigate('/auth/login');
    }
  }, [location, navigate]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleTokenVerification = async (token) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/verify-email-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Email verified successfully!');
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Invalid verification link');
        toast.error(result.error || 'Invalid verification link');
      }
    } catch (err) {
      const errorMessage = 'Verification failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          code: verificationCode 
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Email verified successfully!');
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Invalid verification code');
        toast.error(result.error || 'Invalid verification code');
      }
    } catch (err) {
      const errorMessage = 'Verification failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email address not found');
      return;
    }

    setIsResending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Verification code sent successfully!');
        setCountdown(60); // 60 second cooldown
        setVerificationCode(''); // Clear the input
      } else {
        setError(result.error || 'Failed to resend verification code');
        toast.error(result.error || 'Failed to resend verification code');
      }
    } catch (err) {
      const errorMessage = 'Failed to resend code. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-medium text-gray-900">{email}</p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <div>
              <Label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                Verification Code
              </Label>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                  setError('');
                }}
                placeholder="Enter 6-digit code"
                className="mt-1 text-center text-lg font-mono tracking-widest"
                maxLength={6}
                autoComplete="off"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Email
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?
            </p>
            <Button
              variant="ghost"
              onClick={handleResendCode}
              disabled={isResending || countdown > 0}
              className="mt-2"
            >
              {isResending ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                'Resend Code'
              )}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">
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

