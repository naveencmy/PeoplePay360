import React from 'react';

const SmartButton = ({ icon: Icon, label, count, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 bg-surface-2 border border-border-subtle hover:bg-surface-3/60 hover:border-border-medium transition-all duration-200 rounded-xl px-4 py-2.5 min-w-[120px] shadow-card hover:shadow-card-hover group"
    >
      <div className="p-1.5 rounded-lg bg-accent-blue/10 text-accent-blue group-hover:bg-accent-blue/20 transition-colors duration-200">
        {React.isValidElement(Icon) ? Icon : Icon ? <Icon className="w-4.5 h-4.5" /> : null}
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="text-lg font-bold text-text-main leading-tight tabular-nums font-mono">
          {count}
        </span>
        <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
    </button>
  );
};

export { SmartButton };

export default SmartButton;
