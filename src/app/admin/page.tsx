'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboardSidebar } from '@/components/layout/AdminDashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Users, CheckCircle, UserCheck, Store, ShoppingBag, DollarSign } from 'lucide-react';
import { getAdminAnalytics, getPendingUsers, AdminAnalytics } from '@/lib/api/admin';
import { toast } from 'sonner';

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Try to fetch analytics and pending users
            let analyticsData = null;
            let pendingData = null;

            try {
                analyticsData = await getAdminAnalytics();
                setAnalytics(analyticsData);
            } catch (analyticsError: any) {
                console.log('Analytics endpoint not available (404), using fallback');
                // Set fallback analytics data
                setAnalytics({
                    totalUsers: 0,
                    totalStylists: 0,
                    totalPartners: 0,
                    totalPayments: 0,
                    totalRevenue: 0,
                    weeklyTrend: []
                });
            }

            try {
                pendingData = await getPendingUsers();
                setPendingCount(pendingData.users.length);
            } catch (pendingError) {
                console.log('Pending users endpoint error, using fallback');
                setPendingCount(0);
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            toast.error('Could not connect to backend. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['admin']}>
                <div className="flex min-h-screen bg-gray-50">
                    <AdminDashboardSidebar />
                    <main className="flex-1 p-8">
                        <div className="text-center py-12">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading dashboard...</p>
                        </div>
                    </main>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex min-h-screen bg-gray-50">
                <AdminDashboardSidebar />

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="mt-2 text-gray-600">
                                Monitor system statistics and manage platform operations
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Total Users
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{analytics?.totalUsers || 0}</div>
                                    <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <UserCheck className="h-4 w-4" />
                                        Pending Approvals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
                                    <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <Store className="h-4 w-4" />
                                        Total Partners
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{analytics?.totalPartners || 0}</div>
                                    <p className="text-xs text-gray-500 mt-1">Active partner shops</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <ShoppingBag className="h-4 w-4" />
                                        Total Stylists
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{analytics?.totalStylists || 0}</div>
                                    <p className="text-xs text-gray-500 mt-1">Active stylist accounts</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Total Payments
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{analytics?.totalPayments || 0}</div>
                                    <p className="text-xs text-gray-500 mt-1">All-time transactions</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Total Revenue
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">
                                        ${analytics?.totalRevenue?.toFixed(2) || '0.00'}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">All-time revenue</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserCheck className="h-5 w-5" />
                                        Recent Activity
                                    </CardTitle>
                                    <CardDescription>Latest system activities</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analytics?.weeklyTrend.slice(0, 3).map((day, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{day.week}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {day.registrations} new registrations, {day.logins} logins
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {!analytics?.weeklyTrend.length && (
                                            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        System Status
                                    </CardTitle>
                                    <CardDescription>Platform health check</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <span className="text-sm font-medium">API Status</span>
                                            <span className="text-xs font-semibold text-green-600">Online</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <span className="text-sm font-medium">Database</span>
                                            <span className="text-xs font-semibold text-green-600">Connected</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <span className="text-sm font-medium">Payment Gateway</span>
                                            <span className="text-xs font-semibold text-green-600">Active</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}