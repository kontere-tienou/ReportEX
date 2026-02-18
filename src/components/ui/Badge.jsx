import React from 'react';

const Badge = ({
                   children,
                   variant = 'default',
                   size = 'md',
                   rounded = true,
                   icon,
                   className = ''
               }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-cyan-100 text-cyan-800',
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-800',
        warning: 'bg-amber-100 text-amber-800',
        info: 'bg-blue-100 text-blue-800',
        purple: 'bg-purple-100 text-purple-800',
        outline: 'border border-gray-300 text-gray-700 bg-white'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base'
    };

    const roundedClass = rounded ? 'rounded-full' : 'rounded';

    return (
        <span
            className={`
        inline-flex items-center font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${roundedClass}
        ${className}
      `}
        >
      {icon && <span className="mr-1">{icon}</span>}
            {children}
    </span>
    );
};

// Dot Badge for notifications
export const DotBadge = ({ count, max = 99, color = 'red' }) => {
    const colors = {
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        amber: 'bg-amber-500'
    };

    const displayCount = count > max ? `${max}+` : count;

    return (
        <span className={`
      absolute -top-1 -right-1
      inline-flex items-center justify-center
      px-2 py-1 text-xs font-bold leading-none
      text-white transform translate-x-1/2 -translate-y-1/2
      ${colors[color]} rounded-full
    `}>
      {displayCount}
    </span>
    );
};

export default Badge;