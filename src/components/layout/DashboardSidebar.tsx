'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Home,
    Package,
    User,
    LogOut,
    Menu,
    X,
    Sparkles,
    Shirt,
    Settings,
    ShoppingBag,
    BarChart3,
    Package2,
    Store,
    Plus
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

interface DashboardSidebarProps {
    role: 'partner' | 'styler';
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const stylerNavItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: '/styler',
            icon: <Home className="h-5 w-5" />,
        },
        {
            label: 'Add Clothes',
            href: '/styler/clothes/add',
            icon: <Plus className="h-5 w-5" />,
        },
        {
            label: 'My Wardrobe',
            href: '/styler/clothes',
            icon: <Package className="h-5 w-5" />,
        },
        {
            label: 'Dress Suggestions',
            href: '/styler/suggestions',
            icon: <Sparkles className="h-5 w-5" />,
        },
        {
            label: 'My Occasions',
            href: '/styler/occasions',
            icon: <Shirt className="h-5 w-5" />,
        },
        {
            label: 'Profile Settings',
            href: '/styler/profile',
            icon: <Settings className="h-5 w-5" />,
        },
    ];

    const partnerNavItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: '/partner',
            icon: <Store className="h-5 w-5" />,
        },
        {
            label: 'Analytics',
            href: '/partner/analytics',
            icon: <BarChart3 className="h-5 w-5" />,
        },
        {
            label: 'Add Clothes',
            href: '/partner/clothes/add',
            icon: <Plus className="h-5 w-5" />,
        },
        {
            label: 'Inventory',
            href: '/partner/clothes',
            icon: <Package2 className="h-5 w-5" />,
        },
        {

            label: 'Profile',
            href: '/partner/profile',
            icon: <User className="h-5 w-5" />,
        },
    ];

    const navItems = role === 'styler' ? stylerNavItems : partnerNavItems;

    const isActive = (href: string) => {
        // Exact match for dashboard home
        if (href === `/${role}`) {
            return pathname === href;
        }
        // Exact match first
        if (pathname === href) {
            return true;
        }
        // For other routes, check if current path is a direct child
        // But ensure we don't match parent paths when on a child route
        // e.g., "/styler/clothes/add" should NOT match "/styler/clothes"
        if (pathname?.startsWith(href + '/')) {
            // Check if any other nav item has an exact match or longer match
            // This prevents shorter paths from being highlighted when on longer paths
            const hasLongerMatch = navItems.some(item =>
                item.href !== href &&
                item.href.startsWith(href) &&
                (pathname === item.href || pathname?.startsWith(item.href + '/'))
            );
            return !hasLongerMatch;
        }
        return false;
    };

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="bg-white"
                >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-40
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-sidebar-border flex flex-col items-center">
                        <Link href="/" className="mb-4">
                            <Image src="/logo.png" alt="FitFlow Logo" width={150} height={40} className="h-12 w-auto" priority />
                        </Link>
                        <div className="h-20 w-20 rounded-full overflow-hidden bg-sidebar-accent mb-3 border-2 border-sidebar-border">
                            {user?.profilePhoto ? (
                                <img
                                    src={user.profilePhoto}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-sidebar-foreground/50">
                                    <User className="h-10 w-10" />
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-sidebar-foreground capitalize text-center">
                            {role} Dashboard
                        </h2>
                        <p className="text-sm text-sidebar-foreground/70 mt-1 text-center">{user?.email}</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive(item.href)
                                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                    }
                `}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Logout button */}
                    <div className="p-4 border-t border-sidebar-border">
                        <Button
                            onClick={logout}
                            variant="outline"
                            className="w-full flex items-center gap-2 justify-center"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Spacer for desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0" />
        </>
    );
}
