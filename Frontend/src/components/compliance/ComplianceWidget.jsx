import React from 'react';
import { useComplianceReadiness } from '@/hooks/useAnomalies';
import { Link } from 'react-router-dom';

export const ComplianceWidget = ({ period }) => {
  const { data: readiness, isLoading } = useComplianceReadiness(period);

  const getStatusColor = (status) => {
    switch(status) {
      case 'green': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]';
      case 'amber': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      case 'red': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-[#161B22] p-5 rounded-xl border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Compliance Readiness</h3>
        <span className="text-sm text-gray-400">{period}</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 animate-pulse">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-[#0B0D10] rounded-lg border border-white/5"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {readiness?.items?.map((item, idx) => (
            <div key={idx} className="bg-[#0B0D10] p-4 rounded-lg border border-white/5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{item.icon}</span>
                  <span className="font-medium text-white">{item.name}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
              </div>
              
              <div className="text-sm mt-1">
                {item.status === 'green' ? (
                  <span className="text-green-400 font-medium">Ready</span>
                ) : (
                  <div className="text-gray-400">
                    <span className="text-white font-medium">{item.attentionCount}</span> records require attention
                    <Link to={item.link} className="block mt-1 text-[#4F7CFF] hover:underline text-xs">View employees →</Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500 italic text-center pt-2 border-t border-white/5">
        Readiness indicator only - does not file statutory returns
      </div>
    </div>
  );
};
