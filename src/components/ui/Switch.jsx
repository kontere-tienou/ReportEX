import React from 'react';

const Switch = ({
                    checked = false,
                    onChange,
                    label,
                    disabled = false,
                    size = 'md',
                    color = 'cyan',
                    className = ''
                }) => {
    const sizes = {
        sm: {
            switch: 'w-9 h-5',
            circle: 'w-4 h-4',
            translate: 'translate-x-4'
        },
        md: {
            switch: 'w-11 h-6',
            circle: 'w-5 h-5',
            translate: 'translate-x-5'
        },
        lg: {
            switch: 'w-14 h-7',
            circle: 'w-6 h-6',
            translate: 'translate-x-7'
        }
    };

    const colors = {
        cyan: 'bg-cyan-600',
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        purple: 'bg-purple-600'
    };

    const sizeConfig = sizes[size];

    return (
        <label className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                    className="sr-only"
                />
                <div className={`
          ${sizeConfig.switch}
          ${checked ? colors[color] : 'bg-gray-200'}
          rounded-full transition-colors duration-200 ease-in-out
        `}>
                    <div className={`
            ${sizeConfig.circle}
            bg-white rounded-full shadow-md
            transform transition-transform duration-200 ease-in-out
            absolute top-0.5 left-0.5
            ${checked ? sizeConfig.translate : ''}
          `} />
                </div>
            </div>
            {label && (
                <span className="ml-3 text-sm font-medium text-gray-700">
          {label}
        </span>
            )}
        </label>
    );
};

export default Switch;