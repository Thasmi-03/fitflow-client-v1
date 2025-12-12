'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboardSidebar } from '@/components/layout/AdminDashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, DollarSign, UserPlus, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { AdminStats } from '@/types/admin';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const data = await adminService.getStats();
            setAnalytics(data);
        } catch (error: any) {
            console.error('Error loading analytics:', error);
            if (error?.response?.status === 404) {
                toast.error('Analytics endpoint not yet implemented on backend', {
                    duration: Infinity,
                    closeButton: true,
                });
                // Set empty analytics as fallback
                setAnalytics({
                    totalUsers: 0,
                    totalStylists: 0,
                    totalPartners: 0,
                    totalPayments: 0,
                    totalRevenue: 0,
                    totalLogins: 0,
                    weeklyTrend: []
                });
            } else {
                toast.error('Failed to load analytics. Please check your connection.', {
                    duration: Infinity,
                    closeButton: true,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['admin']}>
                <div className="flex min-h-screen bg-background">
                    <AdminDashboardSidebar />
                    <main className="flex-1 p-6">
                        <div className="text-center py-12">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
                        </div>
                    </main>
                </div>
            </ProtectedRoute>
        );
    }

    if (!analytics) {
        return (
            <ProtectedRoute allowedRoles={['admin']}>
                <div className="flex min-h-screen bg-background">
                    <AdminDashboardSidebar />
                    <main className="flex-1 p-6">
                        <div className="text-center py-12">
                            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">No analytics data available</p>
                        </div>
                    </main>
                </div>
            </ProtectedRoute>
        );
    }

    const totalRegistrations = analytics.weeklyTrend.reduce((sum, w) => sum + w.registrations, 0);
    const totalLogins = analytics.weeklyTrend.reduce((sum, w) => sum + w.logins, 0);

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex min-h-screen bg-background">
                <AdminDashboardSidebar />

                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <BarChart3 className="h-8 w-8 text-primary" />
                                Analytics Dashboard
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Track user registrations and login activity trends
                            </p>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid gap-4 md:grid-cols-4 mb-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Total Users
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{analytics.totalUsers}</div>
                                    <p className="text-xs text-muted-foreground mt-1">All registered users</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        Weekly Registrations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-success">{totalRegistrations}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <LogIn className="h-4 w-4" />
                                        Weekly Logins
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-info">{totalLogins}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Avg. Daily Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-primary">
                                        {Math.round(totalLogins / 7)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Logins per day</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Additional Insights */}
                        <div className="grid gap-4 md:grid-cols-2 mb-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        User Breakdown
                                    </CardTitle>
                                    <CardDescription>Distribution by role</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-primary/25 rounded-lg">
                                            <span className="font-medium">Stylists</span>
                                            <span className="text-lg font-bold text-primary">{analytics.totalStylists}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-info/25 rounded-lg">
                                            <span className="font-medium">Partners</span>
                                            <span className="text-lg font-bold text-info">{analytics.totalPartners}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Platform Metrics
                                    </CardTitle>
                                    <CardDescription>Key performance indicators</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-success/25 rounded-lg">
                                            <span className="font-medium">Total Revenue</span>
                                            <span className="text-lg font-bold text-success">LKR {analytics.totalRevenue.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-warning/25 rounded-lg">
                                            <span className="font-medium">Total Payments</span>
                                            <span className="text-lg font-bold text-warning">{analytics.totalPayments}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Weekly Trend Chart */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Weekly Trend</CardTitle>
                                <CardDescription>User registrations and login activity over the last 7 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={analytics.weeklyTrend}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="week" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="registrations" name="Registrations" fill="#22c55e" />
                                            <Bar dataKey="logins" name="Logins" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
