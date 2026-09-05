import React from 'react';
import { useAnomalies } from '@/hooks/useAnomalies';
import { AnomalyCard } from '@/components/anomaly/AnomalyCard';

export const AnomalyPanel = ({ payrunId, embedded = false }) => {
  const { data: anomalies, isLoading } = useAnomalies(payrunId);

  return (
    <div className={`flex flex-col h-full bg-[#161B22] border-white/10 ${!embedded ? 'p-5 rounded-xl border' : ''}`}>
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-semibold text-white">Anomaly Intelligence</h2>
        <span className="px-2 py-0.5 text-xs font-medium bg-[#F59E0B]/20 text-[#F59E0B] rounded border border-[#F59E0B]/30">AI Powered</span>
      </div>
      
      <p className="text-sm text-gray-400 mb-6 italic">
        Anomaly Engine flags statistical deviations. It never recalculates salary. HR decides action.
      </p>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-28 bg-[#0B0D10] rounded-lg border border-white/5 animate-pulse"></div>
          ))
        ) : !anomalies || anomalies.length === 0 ? (
          <div className="h-32 flex items-center justify-center bg-[#0B0D10] rounded-lg border border-white/5 text-green-400 font-medium">
            ✅ No anomalies detected for this payrun
          </div>
        ) : (
          anomalies.map((anomaly, idx) => (
            <AnomalyCard 
              key={anomaly.id || idx}
              severity={anomaly.severity}
              message={anomaly.message}
              possibleExplanations={anomaly.possibleExplanations}
            />
          ))
        )}
      </div>
    </div>
  );
};
