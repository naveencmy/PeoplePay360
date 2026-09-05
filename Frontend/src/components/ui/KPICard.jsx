import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const KPICard = ({
  title,
  value,
  delta,
  deltaLabel = 'vs last month',
  icon: Icon,
  subtext,
  subCaption,
  loading = false,
  sparklineData = [],
  className = ''
}) => {
  const isPositive = delta && String(delta).startsWith('+');
  const isNegative = delta && String(delta).startsWith('-');

  return (
    <div className={`bg-surface-2 border border-border-subtle hover:border-border-medium rounded-card p-5 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all duration-150 relative overflow-hidden group ${className}`}>
      {/* Top row: title + icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-surface-3 text-accent-blue border border-border-subtle group-hover:border-accent-blue/30 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="my-1">
        {loading ? (
          <div className="h-8 w-32 bg-surface-3 animate-pulse rounded-md"></div>
        ) : (
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-text-main tabular-nums">
            {value}
          </div>
        )}
      </div>

      {/* Bottom row: delta or subtext */}
      <div className="mt-2 flex items-center justify-between text-xs">
        {delta ? (
          <div className="flex items-center gap-1.5 font-medium">
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-mono ${
              isPositive 
                ? 'bg-accent-emerald/15 text-accent-emerald' 
                : isNegative 
                  ? 'bg-accent-rose/15 text-accent-rose' 
                  : 'bg-surface-3 text-text-muted'
            }`}>
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {delta}
            </span>
            <span className="text-text-muted text-[11px]">{deltaLabel}</span>
          </div>
        ) : (subtext || subCaption) ? (
          <span className="text-text-muted text-xs truncate">{subtext || subCaption}</span>
        ) : null}

        {/* Optional micro sparkline */}
        {sparklineData && sparklineData.length > 2 && (
          <div className="w-16 h-6 ml-auto">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 50 20">
              <polyline
                fill="none"
                stroke={isNegative ? '#F43F5E' : '#10B981'}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklineData.map((v, i) => `${(i / (sparklineData.length - 1)) * 50},${20 - (v / 100) * 18}`).join(' ')}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
