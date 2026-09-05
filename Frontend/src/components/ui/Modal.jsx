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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onClose}
      />
      
      <div 
        className={`relative bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-xl w-full ${sizes[size]} transform transition-all animate-in fade-in zoom-in-95 duration-200`}
      >
        {title && (
          <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto text-gray-300">
          {children}
        </div>
        
        {footer && (
          <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.08)] bg-[#0B0D10] bg-opacity-50 flex justify-end gap-3 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export { Modal };

export default Modal;
