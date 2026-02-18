import React, { useState, useRef, useEffect } from 'react';

const Popover = ({
                     trigger,
                     content,
                     position = 'bottom',
                     on = 'click', // 'click' or 'hover'
                     className = ''
                 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (on === 'click') {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [on]);

    const positions = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
        'top-left': 'bottom-full left-0 mb-2',
        'top-right': 'bottom-full right-0 mb-2',
        'bottom-left': 'top-full left-0 mt-2',
        'bottom-right': 'top-full right-0 mt-2'
    };

    const handleTriggerClick = () => {
        if (on === 'click') {
            setIsOpen(!isOpen);
        }
    };

    const handleMouseEnter = () => {
        if (on === 'hover') {
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (on === 'hover') {
            setIsOpen(false);
        }
    };

    return (
        <div
            ref={popoverRef}
            className={`relative inline-block ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div onClick={handleTriggerClick}>
                {trigger}
            </div>

            {isOpen && (
                <div className={`absolute z-50 ${positions[position]}`}>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Popover;