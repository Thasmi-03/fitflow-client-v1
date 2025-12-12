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
                toast.error('Partners endpoint not yet implemented on backend', {
                    duration: Infinity,
                    closeButton: true,
                });
                setPartners([]);
            } else {
                console.error('Error loading partners:', error);
                toast.error('Failed to load partners', {
                    duration: Infinity,
                    closeButton: true,
                });
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
            toast.success('Partner approved successfully', {
                duration: 3000,
            });
            loadPartners();
        } catch (error) {
            console.error('Error approving partner:', error);
            toast.error('Failed to approve partner', {
                duration: Infinity,
                closeButton: true,
            });
        }
    };

    const handleReject = async (userId: string, partnerName: string) => {
        const confirmed = confirm(
            `⚠️ WARNING: Are you sure you want to reject "${partnerName || 'this partner'}"?\n\nThis will permanently DELETE their account and cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await adminService.rejectUser(userId);
            toast.success('Partner rejected and removed successfully', {
                duration: 3000,
            });
            loadPartners();
        } catch (error) {
            console.error('Error rejecting partner:', error);
            toast.error('Failed to reject partner', {
                duration: Infinity,
                closeButton: true,
            });
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
            <div className="flex min-h-screen bg-background">
                <AdminDashboardSidebar />

                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Partners</h1>
                                <p className="mt-2 text-muted-foreground">Manage partner approvals and access</p>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    className="px-3 py-2 border rounded-md text-sm bg-card text-foreground border-input"
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
                        <div className="grid gap-4 md:grid-cols-3 mb-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Total Partners</p>
                                            <p className="text-3xl font-bold text-foreground mt-2">{partners.length}</p>
                                        </div>
                                        <div className="h-12 w-12 bg-info/10 rounded-full flex items-center justify-center">
                                            <Users className="h-6 w-6 text-info" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-warning/20 bg-warning/5">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-warning-foreground">Pending Approvals</p>
                                            <p className="text-3xl font-bold text-warning-foreground mt-2">
                                                {partners.filter(p => !p.isApproved).length}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-warning/20 rounded-full flex items-center justify-center">
                                            <Clock className="h-6 w-6 text-warning-foreground" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Approved Partners</p>
                                            <p className="text-3xl font-bold text-foreground mt-2">
                                                {partners.filter(p => p.isApproved).length}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center">
                                            <UserCheck className="h-6 w-6 text-success" />
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
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                        <p className="mt-4 text-muted-foreground">Loading partners...</p>
                                    </div>
                                ) : filteredPartners.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground font-medium">No partners found</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
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
                                                    <tr key={partner._id} className={`border-b border-border hover:bg-muted/50 ${!partner.isApproved ? 'bg-warning/5' : 'bg-card'}`}>
                                                        <td className="px-6 py-4 font-medium text-foreground">
                                                            {partner.name || 'Partner Shop'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {partner.email}
                                                        </td>
                                                        <td className="px-6 py-4 text-muted-foreground">
                                                            {partner.location || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-muted-foreground">
                                                            {partner.phone || '-'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${partner.isApproved
                                                                ? 'bg-success/10 text-success'
                                                                : 'bg-warning/10 text-warning'
                                                                }`}>
                                                                {partner.isApproved ? 'approved' : 'pending'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-2">
                                                                {!partner.isApproved && (
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-primary hover:bg-primary/90 text-primary-foreground h-8"
                                                                        onClick={() => handleApprove(partner._id, partner.name || '')}
                                                                    >
                                                                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant={partner.isApproved ? "outline" : "destructive"}
                                                                    className={partner.isApproved ? "text-destructive border-destructive/20 hover:bg-destructive/10 h-8" : "bg-destructive hover:bg-destructive/90 h-8"}
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
