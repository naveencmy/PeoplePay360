import React from 'react';

export const StatusPill = ({ status, variant, children, size = 'sm', className = '' }) => {
  const text = children || status || 'Unknown';
  const normalized = String(status || children || '').toLowerCase();

  let style = 'bg-surface-3 text-text-secondary border-border-subtle';
  let dotStyle = 'bg-text-muted';

  if (variant === 'success' || ['active', 'paid', 'approved', 'present', 'done', 'yes', 'healthy'].includes(normalized)) {
    style = 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30';
    dotStyle = 'bg-accent-emerald';
  } else if (variant === 'warning' || ['late', 'warning', 'overtime', 'missing checkout', 'medium'].includes(normalized)) {
    style = 'bg-accent-amber/15 text-amber-500 dark:text-amber-400 border-accent-amber/30';
    dotStyle = 'bg-accent-amber';
  } else if (variant === 'danger' || variant === 'error' || ['expired', 'refused', 'absent', 'rejected', 'high', 'critical', 'failed'].includes(normalized)) {
    style = 'bg-accent-rose/15 text-rose-500 dark:text-rose-400 border-accent-rose/30';
    dotStyle = 'bg-accent-rose';
  } else if (variant === 'primary' || ['computed', 'validated', 'processing', 'in progress'].includes(normalized)) {
    style = 'bg-accent-blue/15 text-accent-blue border-accent-blue/30';
    dotStyle = 'bg-accent-blue';
  } else if (variant === 'purple' || ['ai powered', 'intelligence', 'simulated', 'insights'].includes(normalized)) {
    style = 'bg-accent-purple/15 text-accent-purple border-accent-purple/30';
    dotStyle = 'bg-accent-purple';
  } else if (['draft', 'pending', 'submitted', 'no', 'inactive'].includes(normalized)) {
    style = 'bg-surface-3 text-text-secondary border-border-medium';
    dotStyle = 'bg-text-muted';
  }

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-sm gap-2',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium border tracking-wide select-none ${sizeClasses[size] || sizeClasses.sm} ${style} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotStyle}`} />
      <span>{text}</span>
    </span>
  );
};

export default StatusPill;
