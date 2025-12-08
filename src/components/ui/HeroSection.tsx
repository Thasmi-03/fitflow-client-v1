import React from 'react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
}

export function HeroSection({
    title,
    description,
    children,
    className,
    align = 'left'
}: HeroSectionProps) {
    return (
        <div className={cn(
            "flex flex-col gap-4 py-8 md:py-12",
            {
                'text-center items-center': align === 'center',
                'text-right items-end': align === 'right',
                'text-left items-start': align === 'left',
            },
            className
        )}>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-primary">
                {title}
            </h1>
            {description && (
                <p className="text-lg text-muted-foreground max-w-[700px]">
                    {description}
                </p>
            )}
            {children && (
                <div className="mt-4 flex gap-4">
                    {children}
                </div>
            )}
        </div>
    );
}
