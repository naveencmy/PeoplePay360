import React from 'react';
import { Check } from 'lucide-react';

const Wizard = ({ steps = [], currentStep, onStepClick, children }) => {
  return (
    <div className="w-full">
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const isLast = index === steps.length - 1;
              const canClick = onStepClick && (isCompleted || isActive);

              return (
                <li key={step.id} className={`relative ${isLast ? '' : 'pr-8 sm:pr-20 w-full'}`}>
                  {/* Line connecting steps */}
                  {!isLast && (
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className={`h-0.5 w-full transition-colors duration-300 ${isCompleted ? 'bg-accent-blue' : 'bg-border-medium'}`}></div>
                    </div>
                  )}
                  
                  <div 
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 
                      ${isCompleted 
                        ? 'bg-accent-blue hover:brightness-110 shadow-[0_0_12px_rgba(79,124,255,0.3)]' 
                        : isActive 
                          ? 'border-2 border-accent-blue bg-surface-2 shadow-[0_0_12px_rgba(79,124,255,0.2)]' 
                          : 'border-2 border-border-medium bg-surface-2'}
                      ${canClick ? 'cursor-pointer' : 'cursor-default'}
                    `}
                    onClick={() => canClick && onStepClick(index)}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : isActive ? (
                      <span className="text-sm font-medium text-accent-blue">{index + 1}</span>
                    ) : (
                      <span className="text-sm font-medium text-text-muted">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-max text-xs font-medium text-center">
                    <span className={`transition-colors duration-200 ${isActive ? 'text-accent-blue' : isCompleted ? 'text-text-main' : 'text-text-muted'}`}>
                      {step.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="mt-12 bg-surface-2 border border-border-subtle rounded-2xl p-6 shadow-card">
        {children}
      </div>
    </div>
  );
};

export { Wizard };

export default Wizard;
