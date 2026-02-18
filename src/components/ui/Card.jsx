import React from 'react';

const Card = ({
                  children,
                  title,
                  subtitle,
                  headerAction,
                  footer,
                  hoverable = false,
                  className = '',
                  padding = true,
                  ...props
              }) => {
    return (
        <div
            className={`
        bg-white rounded-lg shadow
        ${hoverable ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}
        ${className}
      `}
            {...props}
        >
            {/* Header */}
            {(title || subtitle || headerAction) && (
                <div className={`flex items-center justify-between border-b border-gray-200 ${padding ? 'p-6' : ''}`}>
                    <div>
                        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}

            {/* Body */}
            <div className={padding ? 'p-6' : ''}>
                {children}
            </div>

            {/* Footer */}
            {footer && (
                <div className={`border-t border-gray-200 ${padding ? 'p-6' : ''}`}>
                    {footer}
                </div>
            )}
        </div>
    );
};

// Card variants
export const StatCard = ({ icon, label, value, trend, trendValue, color = 'blue' }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        amber: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600',
        cyan: 'bg-cyan-100 text-cyan-600'
    };

    return (
        <Card padding={false}>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">{label}</p>
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                        {trend && trendValue && (
                            <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {trend === 'up' ? '↑' : '↓'} {trendValue}
                            </p>
                        )}
                    </div>
                    {icon && (
                        <div className={`p-3 rounded-full ${colors[color]}`}>
                            {icon}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default Card;