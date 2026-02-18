import React from 'react';
import { User } from 'lucide-react';

const Avatar = ({
                    src,
                    alt,
                    name,
                    size = 'md',
                    status,
                    className = ''
                }) => {
    const sizes = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-24 h-24 text-3xl'
    };

    const statusColors = {
        online: 'bg-green-500',
        offline: 'bg-gray-400',
        busy: 'bg-red-500',
        away: 'bg-amber-500'
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const statusSize = size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';

    return (
        <div className={`relative inline-block ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={alt || name}
                    className={`${sizes[size]} rounded-full object-cover`}
                />
            ) : (
                <div className={`
          ${sizes[size]} rounded-full 
          bg-gradient-to-br from-cyan-400 to-cyan-600
          flex items-center justify-center
          text-white font-semibold
        `}>
                    {name ? getInitials(name) : <User className="w-1/2 h-1/2" />}
                </div>
            )}

            {status && (
                <span className={`
          absolute bottom-0 right-0 block ${statusSize}
          ${statusColors[status]}
          rounded-full ring-2 ring-white
        `} />
            )}
        </div>
    );
};

// Avatar Group
export const AvatarGroup = ({ avatars, max = 3, size = 'md' }) => {
    const displayAvatars = avatars.slice(0, max);
    const remaining = avatars.length - max;

    return (
        <div className="flex -space-x-2">
            {displayAvatars.map((avatar, index) => (
                <Avatar
                    key={index}
                    {...avatar}
                    size={size}
                    className="ring-2 ring-white"
                />
            ))}
            {remaining > 0 && (
                <div className={`
          ${size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'}
          rounded-full bg-gray-200
          flex items-center justify-center
          ring-2 ring-white
          font-semibold text-gray-600
        `}>
                    +{remaining}
                </div>
            )}
        </div>
    );
};

export default Avatar;