import React from 'react';

export const Card = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
  onClick,
  actions,
  hoverable = false,
  glow = false,
  ...props
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div 
      className={`bg-surface-2 border border-border-subtle rounded-card shadow-card flex flex-col transition-all duration-150 ${
        glow ? 'border-accent-blue/30 shadow-glow' : ''
      } ${
        isClickable || hoverable 
          ? 'cursor-pointer hover:border-border-medium hover:shadow-card-hover hover:-translate-y-0.5' 
          : ''
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="px-5 py-4 border-b border-border-subtle flex justify-between items-center gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-text-main tracking-tight">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className="p-5 flex-grow text-text-secondary">
        {children}
      </div>
      
      {footer && (
        <div className="px-5 py-3.5 border-t border-border-subtle bg-surface-1/50 rounded-b-card text-xs text-text-muted">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
