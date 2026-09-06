import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  className = ''
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Dialog */}
      <div 
        className={`relative bg-surface-1 dark:bg-[#121826] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/40 w-full ${sizes[size] || sizes.md} overflow-hidden z-10 animate-scale-in flex flex-col transition-all duration-200 ring-1 ring-black/5 dark:ring-white/5 ${className}`}
      >
        {/* Subtle Brand Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-purple shrink-0 opacity-80" />

        {title && (
          <div className="px-6 py-4 border-b border-border-subtle bg-surface-1 dark:bg-[#0F1420] flex items-center justify-between shrink-0">
            <div>
              <h3 id="modal-title" className="text-base font-bold text-text-main tracking-tight flex items-center gap-2">
                {title}
              </h3>
              {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue min-w-[32px] min-h-[32px] flex items-center justify-center border border-transparent hover:border-border-subtle"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="p-6 max-h-[75vh] overflow-y-auto text-text-secondary">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-border-subtle bg-surface-1/80 dark:bg-[#0F1420]/80 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
