import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  className = '',
  inputClassName = '',
  id,
  type = 'text',
  readOnly,
  disabled,
  onClick,
  onFocus,
  ...rest
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  const hasError = Boolean(error);
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const isDateTime = type === 'date' || type === 'datetime-local' || type === 'time';

  const handleClick = (e) => {
    if (isDateTime && !readOnly && !disabled) {
      try {
        e.currentTarget.showPicker?.();
      } catch (err) {}
    }
    onClick?.(e);
  };

  const handleFocus = (e) => {
    if (isDateTime && !readOnly && !disabled) {
      try {
        e.currentTarget.showPicker?.();
      } catch (err) {}
    }
    onFocus?.(e);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {leadingIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500" aria-hidden="true">
            {leadingIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          readOnly={readOnly}
          disabled={disabled}
          onClick={handleClick}
          onFocus={handleFocus}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? errorId : (helperText ? helperId : undefined)}
          className={`block w-full h-10 rounded-xl text-xs sm:text-sm font-medium text-text-main placeholder:text-text-muted/60
            ${leadingIcon ? 'pl-9' : 'pl-3.5'}
            ${trailingIcon ? 'pr-9' : 'pr-3.5'}
            ${isDateTime ? 'cursor-pointer select-none' : ''}
            ${readOnly || disabled 
              ? 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 cursor-not-allowed select-none' 
              : 'bg-white dark:bg-[#151C2C] border border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 text-slate-900 dark:text-white'
            }
            ${hasError ? 'border-accent-rose focus:border-accent-rose focus:ring-accent-rose/20' : ''}
            ${isDateTime ? 'scheme-light dark:scheme-dark' : ''}
            py-2
            transition-all duration-150
            focus:outline-none
            ${inputClassName}
          `}
          {...rest}
        />
        {trailingIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500" aria-hidden="true">
            {trailingIcon}
          </div>
        )}
      </div>
      {hasError && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-accent-rose font-medium">{error}</p>
      )}
      {helperText && !hasError && (
        <p id={helperId} className="mt-1.5 text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
