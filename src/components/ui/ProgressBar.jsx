import React from 'react';

const ProgressBar = ({
                         value = 0,
                         max = 100,
                         size = 'md',
                         color = 'cyan',
                         showLabel = true,
                         label,
                         striped = false,
                         animated = false,
                         className = ''
                     }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const colors = {
        cyan: 'bg-cyan-600',
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        red: 'bg-red-600',
        amber: 'bg-amber-600',
        purple: 'bg-purple-600'
    };

    const sizes = {
        sm: 'h-2',
        md: 'h-4',
        lg: 'h-6'
    };

    return (
        <div className={className}>
            {label && (
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    {showLabel && (
                        <span className="text-sm font-medium text-gray-700">{percentage.toFixed(0)}%</span>
                    )}
                </div>
            )}

            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
                <div
                    className={`
            ${colors[color]} ${sizes[size]} rounded-full transition-all duration-300
            ${striped ? 'bg-stripes' : ''}
            ${animated ? 'animate-progress' : ''}
          `}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// Circular Progress
export const CircularProgress = ({
                                     value = 0,
                                     max = 100,
                                     size = 120,
                                     strokeWidth = 8,
                                     color = 'cyan',
                                     showLabel = true
                                 }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const colors = {
        cyan: '#06b6d4',
        blue: '#3b82f6',
        green: '#10b981',
        red: '#ef4444',
        amber: '#f59e0b',
        purple: '#8b5cf6'
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors[color]}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                />
            </svg>
            {showLabel && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{percentage.toFixed(0)}%</span>
                </div>
            )}
        </div>
    );
};

export default ProgressBar;