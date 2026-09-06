import React from 'react';

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  isLoading = false,
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const isBusy = loading || isLoading;
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-out active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none';
  
  const variants = {
    primary: 'bg-accent-blue text-white hover:bg-accent-blue-hover shadow-sm hover:shadow-glow border border-accent-blue/80 hover:border-accent-blue',
    secondary: 'bg-surface-3 text-text-main hover:bg-surface-2 border border-border-medium shadow-card hover:shadow-card-hover',
    outline: 'bg-transparent text-text-main hover:bg-surface-3/60 border border-border-medium hover:border-border-highlight',
    ghost: 'bg-transparent text-text-secondary hover:text-text-main hover:bg-surface-3/60 border border-transparent',
    danger: 'bg-accent-rose text-white hover:brightness-110 border border-accent-rose/80 shadow-sm hover:shadow-[0_4px_16px_rgba(244,63,94,0.25)]',
    success: 'bg-accent-emerald text-white hover:brightness-110 border border-accent-emerald/80 shadow-sm hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)]',
    icon: 'p-2 text-text-secondary hover:text-text-main hover:bg-surface-3/60 rounded-xl border border-transparent hover:border-border-subtle',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1 gap-1.5',
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = variant === 'icon' ? '' : sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isBusy}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {isBusy ? (
        <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
