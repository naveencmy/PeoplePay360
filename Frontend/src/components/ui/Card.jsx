import React from 'react';

const Card = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
  onClick,
  actions
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div 
      className={`bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden flex flex-col ${isClickable ? 'cursor-pointer hover:border-gray-500 transition-colors' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-start">
          <div>
            {title && <h3 className="text-lg font-medium text-white">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className="px-6 py-4 flex-grow text-gray-300">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.08)] bg-[#0B0D10] bg-opacity-30">
          {footer}
        </div>
      )}
    </div>
  );
};

export { Card };

export default Card;
