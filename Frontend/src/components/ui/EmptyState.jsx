import React from 'react';
import { Button } from './Button';

const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full w-full bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-lg">
      {icon && (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0B0D10] border border-[rgba(255,255,255,0.05)] mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-400 max-w-sm">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick} variant="primary">
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export { EmptyState };

export default EmptyState;
