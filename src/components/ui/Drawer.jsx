import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Drawer = ({
                    isOpen,
                    onClose,
                    title,
                    children,
                    position = 'right',
                    size = 'md',
                    footer,
                    className = ''
                }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full'
    };

    const positions = {
        left: 'left-0 top-0 h-full',
        right: 'right-0 top-0 h-full',
        top: 'top-0 left-0 w-full',
        bottom: 'bottom-0 left-0 w-full'
    };

    const slideAnimations = {
        left: isOpen ? 'translate-x-0' : '-translate-x-full',
        right: isOpen ? 'translate-x-0' : 'translate-x-full',
        top: isOpen ? 'translate-y-0' : '-translate-y-full',
        bottom: isOpen ? 'translate-y-0' : 'translate-y-full'
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
                    isOpen ? 'opacity-50' : 'opacity-0'
                }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`
          fixed ${positions[position]} ${sizes[size]}
          bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50
          ${slideAnimations[position]}
          ${className}
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    {title && (
                        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    )}
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-auto"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 140px)' }}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
                        {footer}
                    </div>
                )}
            </div>
        </>
    );
};

export default Drawer;