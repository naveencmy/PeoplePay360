import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
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
      document.body.style.overflow = 'unset';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        className={`relative bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl w-full ${sizes[size]} transform transition-all animate-in fade-in zoom-in-95 duration-200 z-10`}
      >
        {title && (
          <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
            <h2 id="modal-title" className="text-lg font-semibold text-white">{title}</h2>
            <button 
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF] min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto text-gray-300">
          {children}
        </div>
        
        {footer && (
          <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.08)] bg-[#0B0D10] flex justify-end gap-3 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
export { Modal };
