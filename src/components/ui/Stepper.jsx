import React from 'react';
import { Check } from 'lucide-react';

const Stepper = ({
                     steps,
                     currentStep,
                     onStepClick,
                     orientation = 'horizontal',
                     className = ''
                 }) => {
    const isStepComplete = (index) => index < currentStep;
    const isStepCurrent = (index) => index === currentStep;

    if (orientation === 'vertical') {
        return (
            <div className={`space-y-4 ${className}`}>
                {steps.map((step, index) => (
                    <div key={index} className="relative flex items-start">
                        {/* Line */}
                        {index < steps.length - 1 && (
                            <div className={`
                absolute left-4 top-8 w-0.5 h-full
                ${isStepComplete(index) ? 'bg-cyan-600' : 'bg-gray-300'}
              `} />
                        )}

                        {/* Step indicator */}
                        <div className="relative flex items-center justify-center">
                            <div
                                onClick={() => onStepClick && onStepClick(index)}
                                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-colors cursor-pointer z-10
                  ${isStepComplete(index) ? 'bg-cyan-600 text-white' : ''}
                  ${isStepCurrent(index) ? 'bg-cyan-600 text-white ring-4 ring-cyan-100' : ''}
                  ${!isStepComplete(index) && !isStepCurrent(index) ? 'bg-gray-200 text-gray-600' : ''}
                `}
                            >
                                {isStepComplete(index) ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                )}
                            </div>
                        </div>

                        {/* Step content */}
                        <div className="ml-4">
                            <p className={`font-medium ${isStepCurrent(index) ? 'text-cyan-600' : 'text-gray-900'}`}>
                                {step.title}
                            </p>
                            {step.description && (
                                <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Horizontal orientation
    return (
        <div className={className}>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={index} className="flex-1 relative">
                        <div className="flex items-center">
                            {/* Line before (except first) */}
                            {index > 0 && (
                                <div className={`
                  flex-1 h-0.5
                  ${isStepComplete(index - 1) ? 'bg-cyan-600' : 'bg-gray-300'}
                `} />
                            )}

                            {/* Step indicator */}
                            <div
                                onClick={() => onStepClick && onStepClick(index)}
                                className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center
                  transition-colors cursor-pointer flex-shrink-0
                  ${isStepComplete(index) ? 'bg-cyan-600 text-white' : ''}
                  ${isStepCurrent(index) ? 'bg-cyan-600 text-white ring-4 ring-cyan-100' : ''}
                  ${!isStepComplete(index) && !isStepCurrent(index) ? 'bg-gray-200 text-gray-600' : ''}
                `}
                            >
                                {isStepComplete(index) ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                )}
                            </div>

                            {/* Line after (except last) */}
                            {index < steps.length - 1 && (
                                <div className={`
                  flex-1 h-0.5
                  ${isStepComplete(index) ? 'bg-cyan-600' : 'bg-gray-300'}
                `} />
                            )}
                        </div>

                        {/* Step label */}
                        <div className="absolute top-12 left-0 right-0 text-center">
                            <p className={`text-sm font-medium ${isStepCurrent(index) ? 'text-cyan-600' : 'text-gray-900'}`}>
                                {step.title}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stepper;