import React from 'react';

export const LoadingSpinner = ({ size = 'md', message }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-brand-200 border-t-brand-600 animate-spin`}
      />
      {message && <p className="text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );
};
