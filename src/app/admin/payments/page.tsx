'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboardSidebar } from '@/components/layout/AdminDashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

interface PaymentWithUser {
    _id: string;
    userId: {
        _id: string;
        email: string;
        role: string;
        name?: string;
    };
    amount: number;
    currency: string;
    method: string;
    status: 'pending' | 'completed' | 'failed';
    description: string;
    createdAt: string;
    updatedAt: string;
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentWithUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllPayments();
            setPayments(response.payments || []);
        } catch (error: any) {
            if (error?.response?.status === 404) {
                console.log('Payments endpoint not found (404) - using empty fallback');
                toast.error('Payments endpoint not yet implemented on backend', {
                    duration: Infinity,
                    closeButton: true,
                });
                setPayments([]);
            } else {
                console.error('Error loading payments:', error);
                toast.error('Failed to load payments', {
                    duration: Infinity,
                    closeButton: true,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-orange-600" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-50 text-green-700';
            case 'pending':
                return 'bg-orange-50 text-orange-700';
            case 'failed':
                return 'bg-red-50 text-red-700';
            default:
                return 'bg-gray-50 text-gray-700';
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
                                <DollarSign className="h-8 w-8 text-[#e2c2b7]" />
                                Payment Overview
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Monitor all transactions from stylists and partners
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid gap-6 md:grid-cols-4 mb-8">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Total Revenue
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">
                                        Rs. {totalRevenue.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">From completed payments</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Total Payments
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{payments.length}</div>
                                    <p className="text-xs text-gray-500 mt-1">All transactions</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Completed
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">{completedPayments}</div>
                                    <p className="text-xs text-gray-500 mt-1">Successful payments</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Pending
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-orange-600">{pendingPayments}</div>
                                    <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payments List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Transaction History
                                </CardTitle>
                                <CardDescription>All payment transactions from stylists and partners</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                                        <p className="mt-4 text-gray-600">Loading payments...</p>
                                    </div>
                                ) : payments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 font-medium">No payments found</p>
                                        <p className="text-sm text-gray-500 mt-1">No transactions recorded yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {payments.map((payment) => (
                                            <div
                                                key={payment._id}
                                                className="flex items-center justify-between rounded-lg border p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <p className="font-medium text-lg">{payment.description || 'Payment'}</p>
                                                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                                                            {getStatusIcon(payment.status)}
                                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span>
                                                            {typeof payment.userId === 'object'
                                                                ? `${payment.userId.name || payment.userId.email} (${payment.userId.role})`
                                                                : 'Unknown User'}
                                                        </span>
                                                        <span className="text-gray-400">•</span>
                                                        <span>{payment.method}</span>
                                                        <span className="text-gray-400">•</span>
                                                        <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <div className={`text-2xl font-bold ${payment.status === 'completed' ? 'text-green-600' : 'text-gray-700'}`}>
                                                        Rs. {payment.amount.toFixed(2)}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{payment.currency || 'LKR'}</p>
                                                </div>
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
