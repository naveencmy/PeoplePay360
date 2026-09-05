import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export const Select = forwardRef(({
  label,
  options = [],
  error,
  placeholder = 'Select an option',
  searchable = false,
  multiple = false,
  onChange,
  value,
  className = '',
  children,
  ...rest
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (children) {
    return (
      <div className={`w-full ${className}`}>
        {label && <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            value={value}
            onChange={onChange}
            className={`w-full bg-surface-2 border ${error ? 'border-accent-rose' : 'border-border-medium hover:border-border-highlight'} rounded-input py-2 px-3.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-accent-blue/30 transition-all appearance-none pr-9`}
            {...rest}
          >
            {children}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-text-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-accent-rose font-medium">{error}</p>}
      </div>
    );
  }

  const filteredOptions = options.filter(opt => 
    (opt.label || opt.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? [...value] : [];
      if (newValue.includes(optionValue)) {
        onChange(newValue.filter(v => v !== optionValue));
      } else {
        onChange([...newValue, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      if (!value || value.length === 0) return placeholder;
      return `${value.length} selected`;
    }
    const selected = options.find(opt => opt.value === value);
    return selected ? (selected.label || selected.name) : placeholder;
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-surface-2 border ${error ? 'border-accent-rose' : 'border-border-medium hover:border-border-highlight'} rounded-input py-2 px-3.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-accent-blue/30 transition-all`}
      >
        <span className={!value || (Array.isArray(value) && value.length === 0) ? 'text-text-muted' : 'text-text-main'}>
          {getDisplayValue()}
        </span>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-150 ${isOpen ? 'rotate-180 text-accent-blue' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-40 w-full mt-1.5 bg-surface-3 border border-border-medium rounded-input shadow-dropdown overflow-hidden animate-scale-in">
          {searchable && (
            <div className="p-2 border-b border-border-subtle flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs text-text-main outline-none placeholder-text-muted"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-2.5 text-center text-xs text-text-muted">No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = multiple
                  ? Array.isArray(value) && value.includes(opt.value)
                  : value === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`flex items-center justify-between px-3 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${
                      isSelected ? 'bg-accent-blue/15 text-accent-blue font-semibold' : 'text-text-main hover:bg-surface-2'
                    }`}
                  >
                    <span>{opt.label || opt.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-accent-blue" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-accent-rose font-medium">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
