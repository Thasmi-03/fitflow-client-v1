'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { partnerService } from '@/services/partner.service';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Eye, Package, TrendingUp } from 'lucide-react';

interface AnalyticsData {
    count: number;
    clothes: Array<{
        _id: string;
        name: string;
        image: string;
        viewCount: number;
        category: string;
        price: number;
        uploadedAt: string;
    }>;
}

export default function PartnerAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const analyticsData = await partnerService.getOwnAnalytics();
            setData(analyticsData);
        } catch (error) {
            console.error('Error loading analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const totalViews = data?.clothes.reduce((sum, item) => sum + (item.viewCount || 0), 0) || 0;
    const mostViewed = data?.clothes.reduce((prev, current) =>
        (prev.viewCount > current.viewCount) ? prev : current
        , data?.clothes[0]);

    return (
        <ProtectedRoute allowedRoles={['partner']}>
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar role="partner" />

                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                            <p className="mt-2 text-muted-foreground">
                                Track the performance of your uploaded dresses
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <>
                                {/* Stats Overview */}
                                <div className="grid gap-4 md:grid-cols-3 mb-6">
                                    <Card className="bg-card border-border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <Eye className="h-4 w-4" />
                                                Total Views
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-foreground">{totalViews}</div>
                                            <p className="text-xs text-muted-foreground mt-1">Across all items</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-card border-border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                Total Items
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-foreground">{data?.count || 0}</div>
                                            <p className="text-xs text-muted-foreground mt-1">Active listings</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-card border-border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                Top Performer
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-lg font-bold truncate text-foreground">
                                                {mostViewed?.name || 'N/A'}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {mostViewed ? `${mostViewed.viewCount} views` : 'No views yet'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Detailed List */}
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-foreground">Dress Views</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-border text-left">
                                                        <th className="py-3 px-4 font-medium text-muted-foreground">Item</th>
                                                        <th className="py-3 px-4 font-medium text-muted-foreground">Category</th>
                                                        <th className="py-3 px-4 font-medium text-muted-foreground">Price</th>
                                                        <th className="py-3 px-4 font-medium text-muted-foreground">Uploaded</th>
                                                        <th className="py-3 px-4 font-medium text-muted-foreground text-right">Views</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data?.clothes.map((item) => (
                                                        <tr key={item._id} className="border-b border-border last:border-0 hover:bg-muted/50">
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                                                                        <img
                                                                            src={item.image}
                                                                            alt={item.name}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <span className="font-medium text-foreground">{item.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 capitalize text-foreground">{item.category}</td>
                                                            <td className="py-3 px-4 text-foreground">LKR {item.price}</td>
                                                            <td className="py-3 px-4 text-foreground">
                                                                {new Date(item.uploadedAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="py-3 px-4 text-right font-bold text-foreground">
                                                                {item.viewCount}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {data?.clothes.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                                                No items found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
