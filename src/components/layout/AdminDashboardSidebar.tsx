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
    DollarSign,
    BarChart3,
    Settings,
    UserCheck,
    Store,
    ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';

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
            icon: <Home className="h-5 w-5" />,
        },
        {
            label: 'Users',
            href: '/admin/users',
            icon: <Users className="h-5 w-5" />,
        },
        {
            label: 'Partners',
            href: '/admin/partners',
            icon: <Store className="h-5 w-5" />,
        },
        {
            label: 'Pending Approval Partners',
            href: '/admin/pending-partners',
            icon: <UserCheck className="h-5 w-5" />,
        },
        {
            label: 'Partner Analytics',
            href: '/admin/partner-analytics',
            icon: <ShoppingBag className="h-5 w-5" />,
        },
        {
            label: 'Analytics',
            href: '/admin/analytics',
            icon: <BarChart3 className="h-5 w-5" />,
        },
        {
            label: 'Settings',
            href: '/admin/settings',
            icon: <Settings className="h-5 w-5" />,
        },
    ];

    const isActive = (href: string) => {
        // Exact match for dashboard home
        if (href === '/admin') {
            return pathname === href;
        }
        // For other routes, check if current path matches exactly or is a direct child
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
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 flex flex-col items-center">
                        <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 mb-3 border-2 border-gray-100">
                            {user?.profilePhoto ? (
                                <img
                                    src={user.profilePhoto}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                    <Users className="h-10 w-10" />
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 text-center">
                            Admin Dashboard
                        </h2>
                        <p className="text-sm text-gray-600 mt-1 text-center">{user?.email}</p>
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
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                `}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Logout button */}
                    <div className="p-4 border-t border-gray-200">
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
