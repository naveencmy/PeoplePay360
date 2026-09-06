import React, { useState } from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2, X } from 'lucide-react';

const Banner = ({ type = 'info', title, message, onDismiss, actions }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const types = {
    info: {
      bg: 'bg-accent-blue/10 dark:bg-accent-blue/15',
      border: 'border-accent-blue/40',
      iconColor: 'text-accent-blue',
      icon: <Info className="h-5 w-5" />,
    },
    warning: {
      bg: 'bg-accent-amber/10 dark:bg-accent-amber/15',
      border: 'border-accent-amber/40',
      iconColor: 'text-amber-500 dark:text-amber-400',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    error: {
      bg: 'bg-accent-rose/10 dark:bg-accent-rose/15',
      border: 'border-accent-rose/40',
      iconColor: 'text-accent-rose',
      icon: <AlertCircle className="h-5 w-5" />,
    },
    success: {
      bg: 'bg-accent-emerald/10 dark:bg-accent-emerald/15',
      border: 'border-accent-emerald/40',
      iconColor: 'text-accent-emerald',
      icon: <CheckCircle2 className="h-5 w-5" />,
    }
  };

  const style = types[type] || types.info;

  return (
    <div className={`rounded-xl p-4 border-l-4 ${style.bg} ${style.border} transition-all duration-200`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${style.iconColor}`}>
          {style.icon}
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className={`text-sm font-semibold ${style.iconColor}`}>{title}</h3>}
          <div className={`text-sm text-text-secondary ${title ? 'mt-1.5' : ''}`}>
            <p>{message}</p>
          </div>
          {actions && (
            <div className="mt-3">
              <div className="flex items-center gap-3">
                {actions}
              </div>
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={handleDismiss}
              className={`p-1.5 rounded-xl ${style.iconColor} hover:bg-surface-3/60 transition-all duration-150 border border-transparent hover:border-border-subtle focus-visible:ring-2 focus-visible:ring-accent-blue/40`}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { Banner };

export default Banner;
