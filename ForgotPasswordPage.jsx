import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

function ForgotPasswordPage() {
  const { forgotPassword, error, clearError } = useAuth();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      clearError();
      await forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      // Error is handled by the auth context
      console.error('Forgot password failed:', error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Reset link sent</h1>
          <p className="text-muted-foreground">
            Your reset password link has been sent to{' '}
            <span className="font-medium">{getValues('email')}</span>
          </p>
        </div>

        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Didn't receive the email? Check your spam folder or try again in a few minutes.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Button
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="w-full"
          >
            Try different email
          </Button>
          
          <Link to="/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Forgot your password?</h1>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Sending reset link...
            </>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <Link to="/login">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

