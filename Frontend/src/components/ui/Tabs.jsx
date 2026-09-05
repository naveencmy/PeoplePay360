import React from 'react';

const Tabs = ({ tabs = [], activeTab, onChange }) => {
  return (
    <div className="border-b border-[rgba(255,255,255,0.08)] w-full">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${isActive 
                  ? 'border-[#4F7CFF] text-[#4F7CFF]' 
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  isActive ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-800 text-gray-400'
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

export { Tabs };

export default Tabs;
