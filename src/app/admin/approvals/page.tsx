'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboardSidebar } from '@/components/layout/AdminDashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { PendingUser } from '@/types/admin';
import { toast } from 'sonner';
import { UserCheck, CheckCircle, Clock } from 'lucide-react';

export default function ApprovalsPage() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPendingUsers();
    }, []);

    const loadPendingUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getPendingUsers();
            setPendingUsers(response.users);
        } catch (error) {
            console.error('Error loading pending users:', error);
            toast.error('Failed to load pending users');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string) => {
        try {
            await adminService.approveUser(userId);
            toast.success('User approved successfully');
            loadPendingUsers();
        } catch (error) {
            console.error('Error approving user:', error);
            toast.error('Failed to approve user');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex min-h-screen bg-gray-50">
                <AdminDashboardSidebar />

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <UserCheck className="h-8 w-8 text-[#e2c2b7]" />
                                User Approvals
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Review and approve user registrations
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid gap-6 md:grid-cols-3 mb-8">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Pending Approvals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{pendingUsers.length}</div>
                                    <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pending Users List */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    <CardTitle>Pending User Approvals</CardTitle>
                                </div>
                                <CardDescription>
                                    Review and approve new user registrations
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                                        <p className="mt-4 text-gray-600">Loading...</p>
                                    </div>
                                ) : pendingUsers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 font-medium">No pending users to approve</p>
                                        <p className="text-sm text-gray-500 mt-1">All user registrations are up to date</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingUsers.map((pendingUser) => (
                                            <div
                                                key={pendingUser._id}
                                                className="flex items-center justify-between rounded-lg border p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-lg">{pendingUser.email}</p>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <p className="text-sm text-gray-500">
                                                            Role: <span className="capitalize font-medium text-gray-700">{pendingUser.role}</span>
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            Registered: {new Date(pendingUser.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => handleApprove(pendingUser._id)}
                                                    size="sm"
                                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Approve
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
