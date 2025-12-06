'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Package, ShoppingBag, Heart } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { partnerService } from '@/services/partner.service';
import { PartnerClothes } from '@/types/partner';
import { toast } from 'sonner';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<PartnerClothes | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            loadProduct(params.id as string);
        }
    }, [params.id]);

    const loadProduct = async (id: string) => {
        try {
            setLoading(true);
            const response = await partnerService.getClothById(id);
            setProduct(response.clothes);
        } catch (error) {
            console.error('Error loading product:', error);
            toast.error('Failed to load product details');
            router.push('/styler/suggestions');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['styler']}>
                <div className="flex min-h-screen bg-gray-50">
                    <DashboardSidebar role="styler" />
                    <main className="flex-1 p-8 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
                            <p className="text-gray-600">Loading details...</p>
                        </div>
                    </main>
                </div>
            </ProtectedRoute>
        );
    }

    if (!product) {
        return null;
    }

    return (
        <ProtectedRoute allowedRoles={['styler']}>
            <div className="flex min-h-screen bg-gray-50">
                <DashboardSidebar role="styler" />

                <main className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Link href="/styler/suggestions">
                                <Button variant="ghost" className="pl-0 hover:pl-2 transition-all">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Suggestions
                                </Button>
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Image Section */}
                            <Card className="overflow-hidden h-fit">
                                <div className="aspect-[3/4] bg-gradient-to-br from-[#e2c2b7] to-[#d4b5a8] flex items-center justify-center relative">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Package className="h-24 w-24 text-white opacity-40" />
                                    )}
                                </div>
                            </Card>

                            {/* Details Section */}
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="font-medium">{product.brand}</span>
                                        <span>•</span>
                                        <span className="capitalize">{product.category}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
                                    <span className="text-2xl font-bold text-[#e2c2b7]">${product.price.toFixed(2)}</span>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" className="rounded-full">
                                            <Heart className="h-5 w-5" />
                                        </Button>
                                        <Button className="bg-[#e2c2b7] hover:bg-[#d4b5a8] text-gray-900">
                                            <ShoppingBag className="h-4 w-4 mr-2" />
                                            Add to Wardrobe
                                        </Button>
                                    </div>
                                </div>

                                <Card>
                                    <CardContent className="p-6 space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-2">Product Details</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500 block">Color</span>
                                                    <span className="font-medium capitalize">{product.color}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block">Size</span>
                                                    <span className="font-medium">{product.size || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block">Stock</span>
                                                    <span className="font-medium">{product.stock || 0} available</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block">Listed</span>
                                                    <span className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {product.description && (
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    {product.description}
                                                </p>
                                            </div>
                                        )}

                                        {typeof product.ownerId === 'object' && product.ownerId !== null && (
                                            <div className="pt-4 border-t border-gray-200">
                                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {product.ownerId.location || 'Partner Shop'}
                                                </h3>
                                                <div className="space-y-2 text-sm">
                                                    {product.ownerId.name && (
                                                        <div className="flex items-center gap-2">
                                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            <span className="text-gray-700">{product.ownerId.name}</span>
                                                        </div>
                                                    )}
                                                    {product.ownerId.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                            <span className="text-gray-700">{product.ownerId.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
