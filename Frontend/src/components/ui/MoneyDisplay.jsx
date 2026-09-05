import React from 'react';

export const MoneyDisplay = ({
  amount,
  currency = 'INR',
  size = 'md',
  showSign = false,
  colored = false,
  className = ''
}) => {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || '0').replace(/[^0-9.-]+/g, '')) || 0;
  const isPositive = num > 0;
  const isNegative = num < 0;

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(Math.abs(num));

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm font-medium',
    md: 'text-base font-semibold',
    lg: 'text-xl font-bold tracking-tight',
    xl: 'text-2xl font-bold tracking-tight',
    '2xl': 'text-3xl font-extrabold tracking-tight',
    '3xl': 'text-4xl font-extrabold tracking-tight',
  };

  let colorClass = 'text-text-main';
  if (colored) {
    if (isPositive) colorClass = 'text-accent-emerald';
    if (isNegative) colorClass = 'text-accent-rose';
  }

  return (
    <span className={`inline-flex items-baseline font-mono tabular-nums ${sizeClasses[size] || sizeClasses.md} ${colorClass} ${className}`}>
      {showSign && isPositive && '+'}
      {isNegative && '-'}
      {formatted}
    </span>
  );
};

export default MoneyDisplay;
