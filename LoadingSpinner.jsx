import React from 'react';
import { Loader2 } from 'lucide-react';

function LoadingSpinner({ size = 'md', className, ...props }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const combinedClassName = `animate-spin ${sizeClasses[size]} ${className || ''}`;

  return (
    <Loader2 
      className={combinedClassName} 
      {...props} 
    />
  );
}

export default LoadingSpinner;

