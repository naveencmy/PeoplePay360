import React from 'react';
import logoImg from '@/assets/logo.png';

/**
 * Reusable PeoplePay360 Brand Logo Component
 * 
 * @param {string} size - 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | custom class
 * @param {boolean} showText - whether to render "PeoplePay360" text lockup
 * @param {string} subtitle - optional subtitle, defaults to "Enterprise"
 * @param {string} className - outer container styling
 * @param {string} imgClassName - image wrapper styling
 */
export default function Logo({ 
  size = 'md', 
  showText = false, 
  subtitle = 'Enterprise',
  className = '', 
  imgClassName = '',
  textClassName = ''
}) {
  const sizeClasses = {
    xs: 'w-6 h-6 rounded-lg',
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-xl',
    lg: 'w-10 h-10 rounded-xl',
    xl: 'w-12 h-12 rounded-2xl',
    '2xl': 'w-16 h-16 rounded-2xl'
  };

  const resolvedSize = sizeClasses[size] || size;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative shrink-0 overflow-hidden bg-white/5 border border-slate-200/50 dark:border-white/10 shadow-sm flex items-center justify-center ${resolvedSize} ${imgClassName}`}>
        <img
          src={logoImg}
          alt="PeoplePay360 Logo"
          className="w-full h-full object-cover"
        />
      </div>
      {showText && (
        <div className={`flex flex-col text-left ${textClassName}`}>
          <span className="font-bold text-sm tracking-tight text-text-main flex items-center">
            PeoplePay<span className="text-accent-blue font-extrabold">360</span>
          </span>
          {subtitle && (
            <span className="text-[9px] font-semibold text-text-muted tracking-widest uppercase -mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
