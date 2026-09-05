import React from 'react';

export const Skeleton = ({ variant = 'text', lines = 1, className = '' }) => {
  const baseClass = 'animate-pulse bg-surface-3 rounded';
  
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
      <div className={`bg-surface-2 border border-border-subtle rounded-card p-5 space-y-4 ${className}`}>
        <div className={`${baseClass} h-5 w-1/3`} />
        <div className="space-y-2">
          <div className={`${baseClass} h-4 w-full`} />
          <div className={`${baseClass} h-4 w-4/5`} />
        </div>
      </div>
    );
  }

  if (variant === 'kpi') {
    return (
      <div className={`bg-surface-2 border border-border-subtle rounded-card p-5 space-y-3 ${className}`}>
        <div className={`${baseClass} h-3.5 w-1/2`} />
        <div className={`${baseClass} h-8 w-28`} />
        <div className={`${baseClass} h-3 w-1/3`} />
      </div>
    );
  }
  
  return <div className={`${baseClass} ${className || 'w-full h-full'}`} />;
};

export default Skeleton;
