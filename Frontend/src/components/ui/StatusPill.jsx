import React from 'react';

const StatusPill = ({ status = 'unknown' }) => {
  const normalized = status.toLowerCase();
  
  let colorClass = 'bg-gray-500/10 text-gray-400 border-gray-500/20'; // default
  let dotClass = 'bg-gray-400';

  if (['active', 'paid', 'approved', 'present', 'done'].includes(normalized)) {
    colorClass = 'bg-green-500/10 text-green-400 border-green-500/20';
    dotClass = 'bg-green-500';
  } else if (['draft', 'pending', 'submitted'].includes(normalized)) {
    colorClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    dotClass = 'bg-slate-400';
  } else if (['computed', 'validated'].includes(normalized)) {
    colorClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    dotClass = 'bg-indigo-500';
  } else if (['expired', 'refused', 'absent'].includes(normalized)) {
    colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
    dotClass = 'bg-red-500';
  } else if (['late', 'warning', 'overtime'].includes(normalized)) {
    colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    dotClass = 'bg-amber-500';
  } else if (['missing checkout', 'manually corrected'].includes(normalized)) {
    colorClass = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    dotClass = 'bg-orange-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
      {status}
    </span>
  );
};

export { StatusPill };

export default StatusPill;
