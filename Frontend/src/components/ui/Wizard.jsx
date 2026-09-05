import React from 'react';

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
                      <div className={`h-0.5 w-full ${isCompleted ? 'bg-[#4F7CFF]' : 'bg-gray-700'}`}></div>
                    </div>
                  )}
                  
                  <div 
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full 
                      ${isCompleted ? 'bg-[#4F7CFF] hover:bg-blue-600' : isActive ? 'border-2 border-[#4F7CFF] bg-[#161B22]' : 'border-2 border-gray-600 bg-[#161B22]'}
                      ${canClick ? 'cursor-pointer' : 'cursor-default'}
                    `}
                    onClick={() => canClick && onStepClick(index)}
                  >
                    {isCompleted ? (
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    ) : isActive ? (
                      <span className="text-sm font-medium text-[#4F7CFF]">{index + 1}</span>
                    ) : (
                      <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-max text-xs font-medium text-center">
                    <span className={isActive ? 'text-[#4F7CFF]' : isCompleted ? 'text-gray-300' : 'text-gray-500'}>
                      {step.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="mt-12 bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
        {children}
      </div>
    </div>
  );
};

export { Wizard };

export default Wizard;
