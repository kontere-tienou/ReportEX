import React from 'react';

const Divider = ({
                     orientation = 'horizontal',
                     children,
                     className = ''
                 }) => {
    if (orientation === 'vertical') {
        return (
            <div className={`h-full w-px bg-gray-200 ${className}`} />
        );
    }

    if (children) {
        return (
            <div className={`relative flex items-center ${className}`}>
                <div className="flex-grow border-t border-gray-200" />
                <span className="flex-shrink mx-4 text-sm text-gray-500">
          {children}
        </span>
                <div className="flex-grow border-t border-gray-200" />
            </div>
        );
    }

    return (
        <hr className={`border-t border-gray-200 ${className}`} />
    );
};

export default Divider;