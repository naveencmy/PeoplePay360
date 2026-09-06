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
  id,
  children,
  disabled,
  ...rest
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Native select wrapper when children <option> elements are passed directly
  if (children) {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            id={selectId}
            ref={ref}
            value={value}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={`w-full h-10 ${
              disabled 
                ? 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-90'
                : 'bg-white dark:bg-[#151C2C] border border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 focus:border-accent-blue focus:ring-accent-blue/20 text-slate-900 dark:text-white cursor-pointer'
            } rounded-xl py-2 px-3.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 transition-all appearance-none pr-10 shadow-sm`}
            {...rest}
          >
            {children}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 dark:text-slate-400 group-hover:text-text-main transition-colors">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p role="alert" className="mt-1.5 text-xs text-accent-rose font-medium">{error}</p>}
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
        onChange(newValue.filter((v) => v !== optionValue));
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
      if (!Array.isArray(value) || value.length === 0) return placeholder;
      return `${value.length} selected`;
    }
    const found = options.find(opt => opt.value === value);
    return found ? (found.label || found.name) : placeholder;
  };

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
          {label}
        </label>
      )}
      <button
        id={selectId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-10 flex items-center justify-between bg-surface-2 dark:bg-[#151C2C] border ${
          error 
            ? 'border-accent-rose ring-2 ring-accent-rose/15' 
            : isOpen 
              ? 'border-accent-blue ring-2 ring-accent-blue/20' 
              : 'border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600'
        } rounded-xl py-2 px-3.5 text-xs sm:text-sm font-medium text-text-main text-left focus:outline-none transition-all shadow-sm cursor-pointer`}
      >
        <span className={`truncate ${!value || (Array.isArray(value) && value.length === 0) ? 'text-text-muted' : 'text-text-main'}`}>
          {getDisplayValue()}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-accent-blue' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-surface-1 dark:bg-[#131A29] border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-scale-in">
          {searchable && (
            <div className="p-2 border-b border-border-subtle">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-2 dark:bg-[#0E131F] border border-border-subtle rounded-lg text-text-main placeholder-text-muted focus:outline-none focus:border-accent-blue"
                  autoFocus
                />
              </div>
            </div>
          )}
          <ul className="max-h-60 overflow-y-auto py-1 text-xs sm:text-sm" role="listbox">
            {filteredOptions.length === 0 ? (
              <li className="px-3.5 py-2.5 text-text-muted text-xs text-center">No options available</li>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = multiple 
                  ? Array.isArray(value) && value.includes(opt.value)
                  : value === opt.value;

                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-accent-blue/10 text-accent-blue font-semibold dark:bg-accent-blue/15' 
                        : 'text-text-main hover:bg-surface-3/80 dark:hover:bg-surface-3'
                    }`}
                  >
                    <span className="truncate">{opt.label || opt.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-accent-blue shrink-0 ml-2" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {error && <p role="alert" className="mt-1.5 text-xs text-accent-rose font-medium">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
