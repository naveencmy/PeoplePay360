import React from 'react';

const SmartButton = ({ icon: Icon, label, count, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 bg-surface-2 border border-border-subtle hover:bg-surface-3 hover:border-border-medium transition-all rounded-lg px-4 py-2 min-w-[120px]"
    >
      <div className="text-accent-blue">
        {React.isValidElement(Icon) ? Icon : Icon ? <Icon className="w-5 h-5" /> : null}
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="text-lg font-bold text-text-main leading-tight">
          {count}
        </span>
        <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
    </button>
  );
};

export { SmartButton };

export default SmartButton;
