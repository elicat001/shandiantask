import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-20 h-20'
};

const iconSizeMap = {
  sm: 16,
  md: 20,
  lg: 40
};

const Avatar: React.FC<AvatarProps> = ({ size = 'md', className = '' }) => {
  return (
    <div className={`${sizeMap[size]} rounded-full bg-sage-100 flex items-center justify-center ${className}`}>
      <User size={iconSizeMap[size]} className="text-sage-600" />
    </div>
  );
};

export default Avatar;
