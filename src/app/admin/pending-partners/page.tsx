'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/admin.service';
import { PendingUser } from '@/types/admin';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Check, X } from 'lucide-react';


export default function PendingPartnersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [partners, setPartners] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/auth/login');
                return;
            }
            fetchPartners();
        }
    }, [user, authLoading, router]);

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const data = await adminService.getPendingUsers();
            // Filter for partners only if needed, or assume backend handles it
            setPartners(data.users.filter(u => u.role === 'partner'));
        } catch (error) {
            console.error('Error fetching pending partners:', error);
            toast.error('Failed to fetch pending partners');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            setProcessingId(id);
            await adminService.approveUser(id);
            toast.success('Partner approved successfully');
            fetchPartners();
        } catch (error) {
            console.error('Error approving partner:', error);
            toast.error('Failed to approve partner');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        try {
            setProcessingId(id);
            await adminService.rejectUser(id);
            toast.success('Partner rejected successfully');
            fetchPartners();
        } catch (error) {
            console.error('Error rejecting partner:', error);
            toast.error('Failed to reject partner');
        } finally {
            setProcessingId(null);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pending Partners</h1>
                    <p className="text-muted-foreground mt-2">
                        Review and manage partner registration requests.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    {partners.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No pending partner requests found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Registered At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {partners.map((partner) => (
                                    <TableRow key={partner._id}>
                                        <TableCell className="font-medium">
                                            {partner.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {partner.isApproved ? 'Approved' : 'Pending'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(partner.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={() => handleApprove(partner._id)}
                                                disabled={processingId === partner._id}
                                            >
                                                {processingId === partner._id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleReject(partner._id)}
                                                disabled={processingId === partner._id}
                                            >
                                                {processingId === partner._id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <X className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </>
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
