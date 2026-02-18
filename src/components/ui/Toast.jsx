import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const Toast = ({
                   message,
                   type = 'info',
                   duration = 3000,
                   onClose,
                   position = 'top-right'
               }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const types = {
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

    const positions = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    const config = types[type];
    const Icon = config.icon;

    return (
        <div
            className={`
        fixed ${positions[position]} z-50 
        flex items-center space-x-3 p-4 rounded-lg shadow-lg border-l-4
        ${config.bg} ${config.border} ${config.text}
        transition-all duration-300 transform
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
        max-w-md
      `}
        >
            <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
            <p className="flex-1 font-medium">{message}</p>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </>
    );
};

// Custom Hook for Toast
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 3000, position = 'top-right') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration, position }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return { toasts, addToast, removeToast };
};

export default Toast;