import React from 'react';

const Skeleton = ({ variant = 'text', lines = 1, className = '' }) => {
  const baseClass = 'animate-pulse bg-gray-700/50 rounded';
  
  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={`${baseClass} h-4 ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }
  
  if (variant === 'circle') {
    return <div className={`${baseClass} rounded-full ${className || 'w-10 h-10'}`} />;
  }
  
  if (variant === 'card') {
    return (
      <div className={`bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 space-y-4 ${className}`}>
        <div className={`${baseClass} h-6 w-1/3`} />
        <div className="space-y-2">
          <div className={`${baseClass} h-4 w-full`} />
          <div className={`${baseClass} h-4 w-5/6`} />
        </div>
      </div>
    );
  }

  if (variant === 'kpi') {
    return (
      <div className={`bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-lg p-5 ${className}`}>
        <div className={`${baseClass} h-4 w-1/2 mb-4`} />
        <div className={`${baseClass} h-8 w-24`} />
      </div>
    );
  }
  
  return <div className={`${baseClass} ${className || 'w-full h-full'}`} />;
};

export { Skeleton };

export default Skeleton;
