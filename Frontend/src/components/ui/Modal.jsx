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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div 
        className={`relative bg-surface-2 border border-border-medium rounded-modal shadow-dropdown w-full ${sizes[size] || sizes.md} overflow-hidden z-10 animate-scale-in flex flex-col ${className}`}
      >
        {title && (
          <div className="px-6 py-4.5 border-b border-border-subtle bg-surface-1 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text-main tracking-tight">{title}</h3>
              {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-3 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        <div className="p-6 max-h-[75vh] overflow-y-auto text-text-secondary space-y-4">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-3.5 border-t border-border-subtle bg-surface-1/70 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
