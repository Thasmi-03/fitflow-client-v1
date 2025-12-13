'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'warning' | 'danger' | 'info';
}

export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = 'OK',
    cancelText = 'Cancel',
    variant = 'warning',
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#2a2d3a] border-[#3a3d4a] text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-start gap-2 text-white">
                        {variant === 'warning' && (
                            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{title}</span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-300 text-left">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="bg-[#3a4663] hover:bg-[#4a5673] text-white border-[#4a5673]"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        className="bg-[#6b7cff] hover:bg-[#5b6cef] text-white"
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
