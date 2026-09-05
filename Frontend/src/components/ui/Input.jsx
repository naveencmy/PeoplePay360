import React, { forwardRef } from 'react';

const Input = forwardRef(({
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
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {leadingIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400" aria-hidden="true">
            {leadingIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? errorId : (helperText ? helperId : undefined)}
          className={`block w-full rounded-md sm:text-sm bg-[#161B22] text-gray-100 placeholder-gray-500 min-h-[42px]
            ${leadingIcon ? 'pl-10' : 'pl-3'}
            ${trailingIcon ? 'pr-10' : 'pr-3'}
            py-2
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]
            ${hasError 
              ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500 border' 
              : 'border border-[rgba(255,255,255,0.08)] focus:border-transparent'
            }
          `}
          {...rest}
        />
        {trailingIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400" aria-hidden="true">
            {trailingIcon}
          </div>
        )}
      </div>
      {hasError && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-400">{error}</p>
      )}
      {helperText && !hasError && (
        <p id={helperId} className="mt-1 text-sm text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
export default Input;
