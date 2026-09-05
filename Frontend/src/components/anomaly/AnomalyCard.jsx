import React from 'react';

export const AnomalyCard = ({ severity, message, possibleExplanations = [] }) => {
  const colors = {
    high: { border: 'border-l-red-500', text: 'text-red-400', bg: 'bg-red-500/10', icon: '❌': 'bg-red-500/20 text-red-500 border-red-500/30' },
    medium: { border: 'border-l-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', icon: '⚠️': 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
    low: { border: 'border-l-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10', icon: 'ℹ️': 'bg-blue-500/20 text-blue-500 border-blue-500/30' }
  };

  const style = colors[severity] || colors.low;

  return (
    <div className={`relative bg-[#0B0D10] p-4 rounded-lg border border-white/5 border-l-4 ${style.border}`}>
      <div className="absolute top-4 right-4">
        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${style.badge} uppercase`}>
          {severity}
        </span>
      </div>
      
      <div className="flex gap-3 mb-3 pr-16">
        <span className="text-lg" role="img" aria-label={severity}>{style.icon}</span>
        <h4 className="text-white font-medium">{message}</h4>
      </div>

      {possibleExplanations.length > 0 && (
        <div className="pl-9 mb-4">
          <ul className="list-disc text-sm text-gray-400 space-y-1 ml-4">
            {possibleExplanations.map((exp, idx) => (
              <li key={idx}>{exp}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="pl-9 text-xs text-gray-500 italic">
        This is an informational flag only
      </div>
    </div>
  );
};
