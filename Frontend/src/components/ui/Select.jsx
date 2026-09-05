import React, { useState, useRef, useEffect, forwardRef } from 'react';

const Select = forwardRef(({
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
        {label && <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className={`w-full bg-[#161B22] border ${error ? 'border-red-500' : 'border-[rgba(255,255,255,0.08)]'} rounded-md py-2 px-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]`}
          {...rest}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
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
      if (!Array.isArray(value) || value.length === 0) return placeholder;
      return options.filter(o => value.includes(o.value)).map(o => o.label).join(', ');
    }
    const selected = options.find(o => o.value === value);
    return selected ? selected.label : placeholder;
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <div 
        className={`w-full bg-[#161B22] border ${error ? 'border-red-500' : 'border-[rgba(255,255,255,0.08)]'} rounded-md py-2 px-3 text-sm text-gray-100 cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span className="truncate">{getDisplayValue()}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-md shadow-lg max-h-60 flex flex-col">
          {searchable && (
            <div className="p-2 border-b border-[rgba(255,255,255,0.08)]">
              <input 
                type="text" 
                className="w-full bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] rounded text-sm text-white px-2 py-1 focus:outline-none focus:border-[#4F7CFF]" 
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}
          <ul className="overflow-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500 text-center">No options found</li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = multiple ? Array.isArray(value) && value.includes(option.value) : value === option.value;
                return (
                  <li 
                    key={option.value}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-800 ${isSelected ? 'bg-gray-800 text-[#4F7CFF]' : 'text-gray-200'}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Select };

export default Select;
