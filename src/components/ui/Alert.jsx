import React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const Alert = ({
                   variant = 'info',
                   title,
                   children,
                   onClose,
                   closable = false,
                   icon,
                   className = ''
               }) => {
    const variants = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-500',
            text: 'text-green-800',
            icon: CheckCircle,
            iconColor: 'text-green-500'
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-500',
            text: 'text-red-800',
            icon: AlertCircle,
            iconColor: 'text-red-500'
        },
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-500',
            text: 'text-amber-800',
            icon: AlertTriangle,
            iconColor: 'text-amber-500'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-500',
            text: 'text-blue-800',
            icon: Info,
            iconColor: 'text-blue-500'
        }
    };

    const config = variants[variant];
    const Icon = icon || config.icon;

    return (
        <div className={`
      ${config.bg} ${config.border} ${config.text}
      border-l-4 p-4 rounded-lg
      ${className}
    `}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>
                <div className="ml-3 flex-1">
                    {title && (
                        <h3 className="text-sm font-medium mb-1">{title}</h3>
                    )}
                    <div className="text-sm">
                        {children}
                    </div>
                </div>
                {closable && (
                    <div className="ml-auto pl-3">
                        <button
                            onClick={onClose}
                            className={`inline-flex ${config.text} hover:opacity-75`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alert;