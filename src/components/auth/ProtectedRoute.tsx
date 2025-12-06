'use client'

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Role } from '@/types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {


        if (!loading) {
            console.log("ProtectedRoute: Checking access. User:", user, "AllowedRoles:", allowedRoles);
            if (!user) {
                console.log("ProtectedRoute: No user found. Redirecting to login.");
                router.push('/auth/login');
                return;
            }

            if (allowedRoles && !allowedRoles.includes(user.role)) {

                const dashboardMap: Record<Role, string> = {
                    admin: '/admin',
                    styler: '/styler',
                    partner: '/partner',
                    user: '/'
                };
                router.push(dashboardMap[user.role] || '/');
            } else {

            }
        }
    }, [user, loading, router, allowedRoles]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
