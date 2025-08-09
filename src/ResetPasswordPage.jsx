import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function ResetPasswordPage() {
  return (
    <div className="space-y-6 text-center">
      <h1 className="text-3xl font-bold">Reset Password</h1>
      <p className="text-muted-foreground">
        Reset password functionality will be implemented here
      </p>
      <Link to="/auth/login">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Button>
      </Link>
    </div>
  );
}

export default ResetPasswordPage;

