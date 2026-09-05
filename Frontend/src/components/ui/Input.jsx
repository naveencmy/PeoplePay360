import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  className = '',
  id,
  ...rest
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  const hasError = Boolean(error);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-input shadow-sm">
        {leadingIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            {leadingIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`block w-full rounded-input text-sm bg-surface-2 text-text-main placeholder-text-muted
            ${leadingIcon ? 'pl-9' : 'pl-3.5'}
            ${trailingIcon ? 'pr-9' : 'pr-3.5'}
            py-2
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue
            ${hasError 
              ? 'border-accent-rose focus:border-accent-rose focus:ring-accent-rose/30 border' 
              : 'border border-border-medium hover:border-border-highlight'
            }
          `}
          {...rest}
        />
        {trailingIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
            {trailingIcon}
          </div>
        )}
      </div>
      {hasError && (
        <p className="mt-1 text-xs text-accent-rose font-medium">{error}</p>
      )}
      {helperText && !hasError && (
        <p className="mt-1 text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
