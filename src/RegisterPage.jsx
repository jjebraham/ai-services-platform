import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../../components/LoadingSpinner';

// Password strength checker
const getPasswordStrength = (password) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  Object.values(checks).forEach(check => check && score++);

  return {
    score,
    checks,
    strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
  };
};

// Validation schema
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  acceptPrivacy: z.boolean().refine(val => val === true, {
    message: 'You must accept the privacy policy',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function RegisterPage() {
  const { register: registerUser, error, isLoading, clearError } = useAuth();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [apiError, setApiError] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const password = watch('password');
  const acceptTerms = watch('acceptTerms');
  const acceptPrivacy = watch('acceptPrivacy');
  const passwordStrength = password ? getPasswordStrength(password) : null;

  const onSubmit = async (data) => {
    try {
      clearError();
      setApiError(null);
      const { confirmPassword, acceptTerms, acceptPrivacy, ...userData } = data;
      
      // Prepare the data with fullName for backend
      const registrationData = {
        email: userData.email,
        password: userData.password,
        fullName: `${userData.firstName} ${userData.lastName}`
      };
      
      console.log('🚀 Submitting registration:', registrationData);
      
      const result = await registerUser(registrationData);
      
      console.log('📥 Registration result:', result);
      
      // Only navigate if registration was actually successful
      if (result && result.success === true) {
        toast.success(result.message || 'Account created successfully! Please check your email for verification.');
        
        // For Google users or verified users, go directly to dashboard
        if (result.user && result.user.emailVerified) {
          navigate('/dashboard');
        } else {
          // For regular users, go to verification page
          navigate('/verify-email', { 
            state: { email: result.user ? result.user.email : registrationData.email },
            replace: true 
          });
        }
      } else {
        // Registration failed - show error and don't navigate
        const errorMessage = result?.error || 'Registration failed. Please try again.';
        setApiError(errorMessage);
        toast.error(errorMessage);
        console.error('❌ Registration failed:', errorMessage);
      }
    } catch (error) {
      // Handle network or other errors
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setApiError(errorMessage);
      toast.error(errorMessage);
      console.error('💥 Registration error:', error);
    }
  };

  useEffect(() => {
    console.log('🔄 Loading Google Identity Services script...');
    
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('✅ Google script loaded successfully');
      
      // Initialize Google Sign-In
      if (window.google) {
        console.log('🔐 Initializing Google Sign-In...');
        
        try {
          window.google.accounts.id.initialize({
            client_id: '75748031610-mie84kot707nol668ba2c5fu3h9o33ij.apps.googleusercontent.com',
            callback: handleGoogleSignup,
            auto_select: false,
            cancel_on_tap_outside: true
          });
          
          console.log('✅ Google Sign-In initialized');

          // Render the Google Sign-In button
          const buttonElement = document.getElementById('google-signin-button');
          console.log('🎯 Button element found:', buttonElement);
          
          if (buttonElement) {
            window.google.accounts.id.renderButton(buttonElement, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signup_with',
              shape: 'rectangular'
            });
            console.log('✅ Google button rendered');
          } else {
            console.error('❌ Button element not found!');
          }
        } catch (error) {
          console.error('💥 Error initializing Google Sign-In:', error);
        }
      } else {
        console.error('❌ Google object not available');
      }
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Google script');
    };
    
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleGoogleSignup = async (credentialResponse) => {
    console.log('🔐 Google signup callback received:', credentialResponse);
    
    try {
      setIsLoading(true);
      clearError();

      const requestBody = {
        credential: credentialResponse.credential
      };
      
      console.log('📡 Sending Google OAuth request:', requestBody);

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)

        credentials: 'include'      // < important
      });

      console.log('📥 Google OAuth response status:', response.status);

      const data = await response.json();
      console.log('📥 Google OAuth response data:', data);

      if (data.success) {
        console.log('✅ Google signup successful, redirecting...');
        // Store user data and redirect
        window.location.href = '/dashboard';
        navigate('/dashboard');
      } else {
        console.log('❌ Google signup failed:', data.error);
        setApiError(data.error || 'Google signup failed');
      }
    } catch (error) {
      console.error('💥 Google signup error:', error);
      setApiError('Google signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="text-muted-foreground">
          Join thousands of users accessing premium AI services
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {apiError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                className="pl-10"
                {...register('firstName')}
              />
            </div>
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="pl-10"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className="pl-10 pr-10"
              {...register('password')}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          
          {/* Password Strength Indicator */}
          {password && passwordStrength && (
            <div className="space-y-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full ${
                      level <= passwordStrength.score
                        ? passwordStrength.strength === 'weak'
                          ? 'bg-red-500'
                          : passwordStrength.strength === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(passwordStrength.checks).map(([check, passed]) => (
                  <div key={check} className="flex items-center space-x-1">
                    {passed ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                    )}
                    <span className={passed ? 'text-green-600' : 'text-muted-foreground'}>
                      {check === 'length' && '8+ characters'}
                      {check === 'lowercase' && 'Lowercase'}
                      {check === 'uppercase' && 'Uppercase'}
                      {check === 'number' && 'Number'}
                      {check === 'special' && 'Special char'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className="pl-10 pr-10"
              {...register('confirmPassword')}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms and Privacy */}
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setValue('acceptTerms', checked)}
              className="mt-1"
            />
            <Label htmlFor="acceptTerms" className="text-sm leading-5 cursor-pointer">
              I agree to the{' '}
              <Link to="/legal/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-destructive ml-6">{errors.acceptTerms.message}</p>
          )}

          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptPrivacy"
              checked={acceptPrivacy}
              onCheckedChange={(checked) => setValue('acceptPrivacy', checked)}
              className="mt-1"
            />
            <Label htmlFor="acceptPrivacy" className="text-sm leading-5 cursor-pointer">
              I agree to the{' '}
              <Link to="/legal/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
          {errors.acceptPrivacy && (
            <p className="text-sm text-destructive ml-6">{errors.acceptPrivacy.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Signup */}
      <div id="google-signin-button" className="w-full"></div>

      {/* Sign In Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link to="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;

