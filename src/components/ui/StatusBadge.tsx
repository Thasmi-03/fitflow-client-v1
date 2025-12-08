import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type StatusType = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusStyles: Record<StatusType, string> = {
    pending: 'bg-pending text-pending-foreground hover:bg-pending/90',
    approved: 'bg-approved text-approved-foreground hover:bg-approved/90',
    rejected: 'bg-rejected text-rejected-foreground hover:bg-rejected/90',
    active: 'bg-active text-active-foreground hover:bg-active/90',
    inactive: 'bg-inactive text-inactive-foreground hover:bg-inactive/90',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase() as StatusType;
    const style = statusStyles[normalizedStatus] || 'bg-secondary text-secondary-foreground';

    return (
        <Badge className={cn(style, 'capitalize', className)}>
            {status}
        </Badge>
    );
}
