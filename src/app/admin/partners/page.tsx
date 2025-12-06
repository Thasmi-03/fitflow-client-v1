'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboardSidebar } from '@/components/layout/AdminDashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, CheckCircle, XCircle, Users, Clock, UserCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';

export default function PartnersPage() {
    const [partners, setPartners] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');

    useEffect(() => {
        loadPartners();
    }, []);

    const loadPartners = async () => {
        try {
            setLoading(true);
            const response = await adminService.getUsers('partner');
            setPartners(response.users);
        } catch (error: any) {
            if (error?.response?.status === 404) {
                console.log('Partners endpoint not found (404) - using empty fallback');
                toast.error('Partners endpoint not yet implemented on backend');
                setPartners([]);
            } else {
                console.error('Error loading partners:', error);
                toast.error('Failed to load partners');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string, partnerName: string) => {
        const confirmed = confirm(
            `Are you sure you want to approve "${partnerName || 'this partner'}"?\n\nThey will be able to login and access the partner dashboard.`
        );

        if (!confirmed) return;

        try {
            await adminService.approveUser(userId);
            toast.success('Partner approved successfully');
            loadPartners();
        } catch (error) {
            console.error('Error approving partner:', error);
            toast.error('Failed to approve partner');
        }
    };

    const handleReject = async (userId: string, partnerName: string) => {
        const confirmed = confirm(
            `⚠️ WARNING: Are you sure you want to reject "${partnerName || 'this partner'}"?\n\nThis will permanently DELETE their account and cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await adminService.rejectUser(userId);
            toast.success('Partner rejected and removed successfully');
            loadPartners();
        } catch (error) {
            console.error('Error rejecting partner:', error);
            toast.error('Failed to reject partner');
        }
    };

    const filteredPartners = partners.filter(partner => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'approved') return partner.isApproved;
        if (filterStatus === 'pending') return !partner.isApproved;
        return true;
    });

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex min-h-screen bg-gray-50">
                <AdminDashboardSidebar />

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Partners</h1>
                                <p className="mt-2 text-gray-600">Manage partner approvals and access</p>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    className="px-3 py-2 border rounded-md text-sm bg-white"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                </select>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid gap-6 md:grid-cols-3 mb-8">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Partners</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">{partners.length}</p>
                                        </div>
                                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-yellow-200 bg-yellow-50">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Pending Approvals</p>
                                            <p className="text-3xl font-bold text-yellow-900 mt-2">
                                                {partners.filter(p => !p.isApproved).length}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-yellow-200 rounded-full flex items-center justify-center">
                                            <Clock className="h-6 w-6 text-yellow-700" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Approved Partners</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {partners.filter(p => p.isApproved).length}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <UserCheck className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Partners Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Partner Approval Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                                        <p className="mt-4 text-gray-600">Loading partners...</p>
                                    </div>
                                ) : filteredPartners.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 font-medium">No partners found</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3">Shop Name</th>
                                                    <th className="px-6 py-3">Email</th>
                                                    <th className="px-6 py-3">Location</th>
                                                    <th className="px-6 py-3">Phone</th>
                                                    <th className="px-6 py-3">Status</th>
                                                    <th className="px-6 py-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPartners.map((partner) => (
                                                    <tr key={partner._id} className={`border-b hover:bg-gray-50 ${!partner.isApproved ? 'bg-yellow-50/30' : 'bg-white'}`}>
                                                        <td className="px-6 py-4 font-medium text-gray-900">
                                                            {partner.name || 'Partner Shop'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {partner.email}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            {partner.location || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            {partner.phone || '-'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${partner.isApproved
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {partner.isApproved ? 'approved' : 'pending'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-2">
                                                                {!partner.isApproved && (
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-black hover:bg-gray-800 text-white h-8"
                                                                        onClick={() => handleApprove(partner._id, partner.name || '')}
                                                                    >
                                                                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant={partner.isApproved ? "outline" : "destructive"}
                                                                    className={partner.isApproved ? "text-red-600 border-red-200 hover:bg-red-50 h-8" : "bg-red-600 hover:bg-red-700 h-8"}
                                                                    onClick={() => handleReject(partner._id, partner.name || '')}
                                                                >
                                                                    <XCircle className="w-4 h-4 mr-1" /> Reject
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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
