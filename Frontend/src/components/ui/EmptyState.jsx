import React from 'react';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is no data to display for the current selection.',
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center h-full w-full bg-surface-2 border border-border-subtle rounded-card shadow-card ${className}`}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-3 border border-border-medium mb-3 text-text-muted">
        {typeof Icon === 'function' ? <Icon className="w-7 h-7 text-accent-blue" /> : Icon}
      </div>
      <h3 className="mt-2 text-base font-bold text-text-main tracking-tight">{title}</h3>
      <p className="mt-1 text-xs text-text-muted max-w-sm">
        {description}
      </p>
      {action && (
        <div className="mt-5">
          <Button onClick={action.onClick} variant="primary" size="sm">
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
