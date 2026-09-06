import React from 'react';

/**
 * Enterprise Tabs Component
 * @param {Array} tabs - array of { id, label, icon: IconComponent, count }
 * @param {string} activeTab - currently selected tab id
 * @param {function} onChange - callback on tab selection
 * @param {'underline' | 'pills' | 'raised'} variant - tab design style
 */
export const Tabs = ({ 
  tabs = [], 
  activeTab, 
  onChange,
  variant = 'underline',
  className = ''
}) => {
  if (variant === 'pills' || variant === 'raised') {
    return (
      <div className={`inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface-2 dark:bg-[#131A29] border border-slate-200 dark:border-slate-700/80 shadow-md ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/25 font-bold'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface-3/80 dark:hover:bg-surface-3'
              }`}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-text-muted'}`} />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-surface-3 text-text-muted dark:bg-surface-3 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: Elegant underline tabs
  return (
    <div className={`border-b border-border-subtle w-full ${className}`}>
      <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all duration-150 ${
                isActive 
                  ? 'border-accent-blue text-accent-blue font-bold shadow-sm' 
                  : 'border-transparent text-text-muted hover:text-text-main hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-accent-blue' : 'text-text-muted'}`} />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-colors ${
                  isActive 
                    ? 'bg-accent-blue/15 text-accent-blue dark:bg-accent-blue/20 dark:text-blue-400' 
                    : 'bg-surface-3 text-text-muted'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
