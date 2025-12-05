import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
        <div className="mt-4 text-gray-500 text-sm">加载中...</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;