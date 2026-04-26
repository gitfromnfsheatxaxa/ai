'use client';

import React from 'react';
import { cn, getInitials, getAvatarUrl } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-amber-500',
  busy: 'bg-red-500',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className,
  showStatus = false,
  status = 'offline',
}) => {
  const avatarUrl = src || getAvatarUrl(name);
  const initials = getInitials(name);

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-teal-600',
          'flex items-center justify-center text-white font-semibold',
          'shadow-lg border-2 border-white/50',
          'backdrop-blur-sm',
          sizeClasses[size]
        )}
      >
        {src ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full',
            'border-2 border-white',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;