import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({
                     size = 'md',
                     color = 'cyan',
                     fullScreen = false,
                     text,
                     className = ''
                 }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const colors = {
        cyan: 'text-cyan-600',
        blue: 'text-blue-600',
        green: 'text-green-600',
        purple: 'text-purple-600',
        gray: 'text-gray-600'
    };

    const spinner = (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <Loader2 className={`${sizes[size]} ${colors[color]} animate-spin`} />
            {text && (
                <p className="mt-3 text-sm text-gray-600">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

// Skeleton Loader
export const Skeleton = ({
                             width,
                             height,
                             circle = false,
                             count = 1,
                             className = ''
                         }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`
            animate-pulse bg-gray-200
            ${circle ? 'rounded-full' : 'rounded'}
            ${className}
          `}
                    style={{ width, height }}
                />
            ))}
        </>
    );
};

export default Spinner;