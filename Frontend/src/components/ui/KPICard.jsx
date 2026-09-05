import React from 'react';

const KPICard = ({
  title,
  value,
  delta,
  deltaLabel,
  icon,
  subCaption,
  loading = false,
  sparklineData = []
}) => {
  const isPositive = delta && delta.startsWith('+');
  const isNegative = delta && delta.startsWith('-');
  
  let deltaColor = 'text-gray-400';
  let DeltaIcon = null;

  if (isPositive) {
    deltaColor = 'text-green-400';
    DeltaIcon = () => <span className="mr-1">▲</span>;
  } else if (isNegative) {
    deltaColor = 'text-red-400';
    DeltaIcon = () => <span className="mr-1">▼</span>;
  }

  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    
    const width = 100;
    const height = 30;
    
    const points = sparklineData.map((val, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const strokeColor = isNegative ? '#F87171' : '#4ADE80';

    return (
      <svg className="w-full h-10 mt-4 overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-lg p-5 flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          {loading ? (
            <div className="h-8 bg-gray-700 rounded w-24 mt-2 animate-pulse"></div>
          ) : (
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-[#0B0D10] rounded-md text-[#4F7CFF]">
            {icon}
          </div>
        )}
      </div>

      {!loading && (delta || subCaption) && (
        <div className="mt-4 flex items-center text-sm">
          {delta && (
            <span className={`font-medium flex items-center ${deltaColor}`}>
              {DeltaIcon && <DeltaIcon />}
              {delta}
            </span>
          )}
          {deltaLabel && (
            <span className="text-gray-500 ml-2">{deltaLabel}</span>
          )}
          {subCaption && !deltaLabel && (
            <span className="text-gray-500">{subCaption}</span>
          )}
        </div>
      )}
      
      {!loading && sparklineData.length > 0 && renderSparkline()}
    </div>
  );
};

export { KPICard };

export default KPICard;
