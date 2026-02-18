import React from 'react';

const EmptyState = ({
                        icon,
                        title,
                        description,
                        action,
                        className = ''
                    }) => {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
            {icon && (
                <div className="text-gray-400 mb-4">
                    {icon}
                </div>
            )}

            {title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                    {title}
                </h3>
            )}

            {description && (
                <p className="text-gray-600 text-center max-w-md mb-6">
                    {description}
                </p>
            )}

            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;