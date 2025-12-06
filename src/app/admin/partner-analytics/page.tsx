'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboardSidebar } from '@/components/layout/AdminDashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Store, Calendar, TrendingUp } from 'lucide-react';
import { partnerService } from '@/services/partner.service';
import { PartnerAnalytics } from '@/types/partner';
import { toast } from 'sonner';

export default function PartnerAnalyticsPage() {
    const [partners, setPartners] = useState<PartnerAnalytics[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedPartner, setExpandedPartner] = useState<string | null>(null);

    useEffect(() => {
        loadPartners();
    }, []);

    const loadPartners = async () => {
        try {
            setLoading(true);
            const response = await partnerService.getAnalytics();
            setPartners(response.partners);
        } catch (error) {
            console.error('Error loading partner analytics:', error);
            toast.error('Failed to load partner analytics');
        } finally {
            setLoading(false);
        }
    };

    const togglePartner = (partnerId: string) => {
        setExpandedPartner(expandedPartner === partnerId ? null : partnerId);
    };

    const totalClothes = partners.reduce((sum, p) => sum + p.totalClothes, 0);
    const approvedPartners = partners.filter(p => p.isApproved).length;

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex min-h-screen bg-gray-50">
                <AdminDashboardSidebar />

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Partner Analytics</h1>
                            <p className="mt-2 text-gray-600">
                                View partner upload statistics and inventory details
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid gap-6 md:grid-cols-3 mb-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Total Partners
                                    </CardTitle>
                                    <Store className="h-5 w-5 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-gray-900">{partners.length}</div>
                                    <p className="text-xs text-gray-500 mt-1">{approvedPartners} approved</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Total Clothes
                                    </CardTitle>
                                    <Package className="h-5 w-5 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-gray-900">{totalClothes}</div>
                                    <p className="text-xs text-gray-500 mt-1">Across all partners</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Average per Partner
                                    </CardTitle>
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {partners.length > 0 ? Math.round(totalClothes / partners.length) : 0}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Items per partner</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Partners List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Partner Upload Statistics</CardTitle>
                                <CardDescription>Click on a partner to view their uploaded clothes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                                        <p className="mt-4 text-gray-600">Loading analytics...</p>
                                    </div>
                                ) : partners.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No partners found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {partners.map((partner) => (
                                            <div key={partner._id} className="border rounded-lg overflow-hidden">
                                                <div
                                                    className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => togglePartner(partner._id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${partner.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                    {partner.isApproved ? 'Approved' : 'Pending'}
                                                                </span>
                                                            </div>
                                                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                                <div>
                                                                    <span className="font-medium">Email:</span> {partner.email}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium">Location:</span> {partner.location}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium">Phone:</span> {partner.phone || 'N/A'}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium">Joined:</span> {new Date(partner.createdAt).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <div className="text-2xl font-bold text-[#e2c2b7]">{partner.totalClothes}</div>
                                                            <div className="text-xs text-gray-500">Total Clothes</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded Clothes List */}
                                                {expandedPartner === partner._id && (
                                                    <div className="p-4 border-t bg-white">
                                                        {partner.clothes.length === 0 ? (
                                                            <p className="text-center text-gray-500 py-4">No clothes uploaded yet</p>
                                                        ) : (
                                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                                {partner.clothes.map((cloth) => (
                                                                    <Card key={cloth._id} className="overflow-hidden">
                                                                        {cloth.image && (
                                                                            <div className="h-48 w-full bg-gray-100 overflow-hidden">
                                                                                <img
                                                                                    src={cloth.image}
                                                                                    alt={cloth.name}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <CardContent className="p-4">
                                                                            <h4 className="font-semibold text-gray-900 mb-2">{cloth.name}</h4>
                                                                            <div className="space-y-1 text-sm text-gray-600">
                                                                                <p><span className="font-medium">Category:</span> {cloth.category}</p>
                                                                                <p><span className="font-medium">Brand:</span> {cloth.brand}</p>
                                                                                <p><span className="font-medium">Color:</span> {cloth.color}</p>
                                                                                <p><span className="font-medium">Size:</span> {cloth.size || 'N/A'}</p>
                                                                                <p><span className="font-medium">Gender:</span> <span className="capitalize">{cloth.gender}</span></p>
                                                                                <p><span className="font-medium">Occasion:</span> <span className="capitalize">{cloth.occasion}</span></p>
                                                                                <p><span className="font-medium">Price:</span> ${cloth.price}</p>
                                                                                <p><span className="font-medium">Stock:</span> {cloth.stock}</p>
                                                                                <p><span className="font-medium">Sales:</span> {cloth.sales}</p>
                                                                                <p><span className="font-medium">Visibility:</span> <span className="capitalize">{cloth.visibility}</span></p>
                                                                                {cloth.description && (
                                                                                    <p className="mt-2"><span className="font-medium">Description:</span> {cloth.description}</p>
                                                                                )}
                                                                                {cloth.suitableSkinTones && cloth.suitableSkinTones.length > 0 && (
                                                                                    <p className="mt-2">
                                                                                        <span className="font-medium">Suitable Skin Tones:</span>{' '}
                                                                                        {cloth.suitableSkinTones.map(tone => (
                                                                                            <span key={tone} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs mr-1 mb-1 capitalize">
                                                                                                {tone}
                                                                                            </span>
                                                                                        ))}
                                                                                    </p>
                                                                                )}
                                                                                <p className="text-xs text-gray-500 mt-2">
                                                                                    <Calendar className="h-3 w-3 inline mr-1" />
                                                                                    Uploaded: {new Date(cloth.uploadedAt).toLocaleDateString()}
                                                                                </p>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
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
