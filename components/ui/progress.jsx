import React from 'react';

const Progress = ({ value = 0, className = '', ...props }) => {
  const percentage = Math.min(Math.max(value, 0), 100);
  
  return (
    <div 
      className={`w-full bg-gray-200 rounded-full h-2 ${className}`}
      {...props}
    >
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export { Progress };