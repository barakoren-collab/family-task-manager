import { User } from '@/types';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
    user: Partial<User> & { name?: string, avatar_url?: string, color?: string };
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    className?: string;
    showBorder?: boolean;
}

export function UserAvatar({ user, size = 'md', className, showBorder = false }: UserAvatarProps) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-2xl',
        '2xl': 'w-20 h-20 text-3xl',
        '3xl': 'w-24 h-24 text-4xl',
    };

    const isImage = user.avatar_url?.startsWith('http') || user.avatar_url?.startsWith('data:');
    const borderClass = showBorder ? 'border-4 border-white shadow-md' : '';

    return (
        <div
            className={cn(
                'rounded-full flex items-center justify-center overflow-hidden font-bold text-white relative flex-shrink-0 transition-all',
                sizeClasses[size],
                borderClass,
                className
            )}
            style={{ backgroundColor: user.color || '#4f46e5' }}
        >
            {isImage ? (
                <img src={user.avatar_url} alt={user.name || 'User'} className="w-full h-full object-cover" />
            ) : (
                <span className="select-none">{user.avatar_url || user.name?.charAt(0).toUpperCase() || '?'}</span>
            )}
        </div>
    );
}
