import React, { useState } from 'react';

const Tooltip = ({
                     children,
                     content,
                     position = 'top',
                     delay = 200,
                     className = ''
                 }) => {
    const [isVisible, setIsVisible] = useState(false);
    let timeout;

    const showTooltip = () => {
        timeout = setTimeout(() => setIsVisible(true), delay);
    };

    const hideTooltip = () => {
        clearTimeout(timeout);
        setIsVisible(false);
    };

    const positions = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 translate-x-2'
    };

    const arrows = {
        top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900',
        bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900',
        left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900',
        right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900'
    };

    return (
        <div
            className={`relative inline-block ${className}`}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
        >
            {children}

            {isVisible && content && (
                <div className={`absolute z-50 ${positions[position]}`}>
                    <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded shadow-lg whitespace-nowrap">
                        {content}
                    </div>
                    <div className={`absolute w-0 h-0 border-4 border-transparent ${arrows[position]}`} />
                </div>
            )}
        </div>
    );
};

export default Tooltip;