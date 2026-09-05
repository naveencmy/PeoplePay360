import React from 'react';

const SmartButton = ({ icon, count, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 bg-[#161B22] border border-[rgba(255,255,255,0.08)] hover:bg-[#1a212a] hover:border-gray-500 transition-all rounded-md px-4 py-2 min-w-[120px]"
    >
      <div className="text-[#4F7CFF]">
        {icon}
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="text-lg font-bold text-white leading-tight">
          {count}
        </span>
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
    </button>
  );
};

export { SmartButton };

export default SmartButton;
