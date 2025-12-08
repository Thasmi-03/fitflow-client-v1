import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertBannerProps {
    type?: AlertType;
    title?: string;
    message: string;
    className?: string;
}

const alertConfig = {
    success: {
        icon: CheckCircle2,
        style: 'border-success/50 text-success dark:border-success [&>svg]:text-success',
    },
    error: {
        icon: XCircle,
        style: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
    },
    warning: {
        icon: AlertCircle,
        style: 'border-warning/50 text-warning dark:border-warning [&>svg]:text-warning',
    },
    info: {
        icon: Info,
        style: 'border-info/50 text-info dark:border-info [&>svg]:text-info',
    },
};

export function AlertBanner({ type = 'info', title, message, className }: AlertBannerProps) {
    const config = alertConfig[type];
    const Icon = config.icon;

    return (
        <Alert variant="default" className={cn(config.style, className)}>
            <Icon className="h-4 w-4" />
            {title && <AlertTitle>{title}</AlertTitle>}
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}
