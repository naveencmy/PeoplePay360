import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Drawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footer,
  width = 'max-w-xl',
  className = ''
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const mainEl = document.querySelector('main');
      if (mainEl) mainEl.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      const mainEl = document.querySelector('main');
      if (mainEl) mainEl.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      const mainEl = document.querySelector('main');
      if (mainEl) mainEl.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const drawerContent = (
    <div className="fixed inset-0 z-[100] overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div 
          className={`w-screen ${width} pointer-events-auto bg-surface-2 border-l border-border-medium shadow-2xl flex flex-col animate-slide-in-right ${className}`}
        >
          {/* Accent Line */}
          <div className="h-0.5 w-full bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-purple shrink-0 opacity-70" />

          {/* Header */}
          <div className="px-6 py-5 border-b border-border-subtle bg-surface-1/80 dark:bg-surface-1/60 backdrop-blur-sm flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-text-main tracking-tight">{title}</h3>
                {badge && <div>{badge}</div>}
              </div>
              {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 -mr-1.5 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-3 transition-all duration-150 border border-transparent hover:border-border-subtle focus-visible:ring-2 focus-visible:ring-accent-blue/40"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-border-subtle bg-surface-1/60 backdrop-blur-sm flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default Drawer;
