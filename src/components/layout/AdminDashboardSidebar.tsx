'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Home,
    Users,
    LogOut,
    Menu,
    X,
    BarChart3,
    Settings,
    ShoppingBag,
    UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

export function AdminDashboardSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: '/admin',
            icon: <Home className="h-4 w-4" />,
        },
        {
            label: 'Users',
            href: '/admin/users',
            icon: <Users className="h-4 w-4" />,
        },
        {
            label: 'Pending Approval',
            href: '/admin/partners',
            icon: <UserCheck className="h-4 w-4" />,
        },
        {
            label: 'Partner Analytics',
            href: '/admin/partner-analytics',
            icon: <ShoppingBag className="h-4 w-4" />,
        },
        {
            label: 'Analytics',
            href: '/admin/analytics',
            icon: <BarChart3 className="h-4 w-4" />,
        },
        {
            label: 'Settings',
            href: '/admin/settings',
            icon: <Settings className="h-4 w-4" />,
        },
    ];

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === href;
        }
        return pathname === href || pathname?.startsWith(href + '/');
    };

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="bg-white h-8 w-8"
                >
                    {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-[220px] bg-sidebar border-r border-sidebar-border z-40
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-sidebar-border flex flex-col items-center gap-3">
                        <Image src="/logo.svg" alt="FitFlow Logo" width={120} height={32} className="h-8 w-auto" priority />

                        <div className="flex items-center gap-3 w-full px-2 py-2 rounded-md bg-sidebar-accent/50">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-sidebar-accent border border-sidebar-border shrink-0">
                                {user?.profilePhoto ? (
                                    <img
                                        src={user.profilePhoto}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-sidebar-foreground/50">
                                        <Users className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-sidebar-foreground truncate">Admin</span>
                                <span className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-2 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm
                  ${isActive(item.href)
                                        ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm'
                                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                    }
                `}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Logout button */}
                    <div className="p-2 border-t border-sidebar-border">
                        <Button
                            onClick={logout}
                            variant="ghost"
                            className="w-full flex items-center gap-2 justify-start px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm">Logout</span>
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Spacer for desktop */}
            <div className="hidden lg:block w-[220px] flex-shrink-0" />
        </>
    );
}
