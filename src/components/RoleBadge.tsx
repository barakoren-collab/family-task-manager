import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { Crown, Sparkles } from 'lucide-react';

interface RoleBadgeProps {
    role: UserRole;
    className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
    if (role === 'parent') {
        return (
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200", className)}>
                <Crown size={12} className="fill-purple-700" />
                Parent
            </span>
        );
    }

    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200", className)}>
            <Sparkles size={12} className="fill-emerald-700" />
            Kid
        </span>
    );
}
