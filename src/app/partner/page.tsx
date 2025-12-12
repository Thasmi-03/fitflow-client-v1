'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, DollarSign, TrendingUp, Plus, ShoppingBag, Edit, BarChart3, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { partnerService } from '@/services/partner.service';
import { PartnerClothes } from '@/types/partner';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PartnerDashboard() {
    const router = useRouter();
    const [clothes, setClothes] = useState<PartnerClothes[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClothes();
    }, []);

    const loadClothes = async () => {
        try {
            setLoading(true);
            const response = await partnerService.getClothes();
            setClothes(response.data || []);
        } catch (error) {
            console.error('Error loading clothes:', error);
            toast.error('Failed to load inventory', {
                duration: Infinity,
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Orders functionality removed

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await partnerService.deleteCloth(id);
            toast.success('Product deleted successfully', {
                duration: 3000,
            });
            loadClothes(); // Reload the list
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product', {
                duration: Infinity,
                closeButton: true,
            });
        }
    };

    // Calculate stats from real data
    const totalRevenue = clothes?.reduce((acc, item) => acc + (item.price * (item.sales || 0)), 0) || 0;
    const totalViews = clothes?.reduce((acc, item) => acc + (item.views?.length || 0), 0) || 0;
    const totalStock = clothes?.reduce((acc, item) => acc + (item.stock || 0), 0) || 0;
    const totalProducts = clothes?.length || 0;

    return (
        <ProtectedRoute allowedRoles={['partner']}>
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar role="partner" />

                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Partner Dashboard</h1>
                                    <p className="mt-2 text-muted-foreground">
                                        Manage your inventory, track sales, and grow your business
                                    </p>
                                </div>
                                <Link href="/partner/clothes/add">
                                    <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                                        <Plus className="h-4 w-4" />
                                        Add New Product
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-4 mb-8 items-stretch">
                            <Card className="bg-success/10 border-success/20 flex flex-col min-h-[140px]">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-success">
                                        Total Revenue
                                    </CardTitle>
                                    <DollarSign className="h-5 w-5 text-success" />
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-center">
                                    <div className="text-3xl font-bold text-success">LKR {totalRevenue.toFixed(2)}</div>
                                    <p className="text-xs text-success/80 mt-1">All time earnings</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-info/10 border-info/20 flex flex-col min-h-[140px]">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-info">
                                        Total Views
                                    </CardTitle>
                                    <Eye className="h-5 w-5 text-info" />
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-center">
                                    <div className="text-3xl font-bold text-info">{totalViews}</div>
                                    <p className="text-xs text-info/80 mt-1">Styler views</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-primary/10 border-primary/20 flex flex-col min-h-[140px]">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-primary">
                                        Inventory
                                    </CardTitle>
                                    <Package className="h-5 w-5 text-primary" />
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-center">
                                    <div className="text-3xl font-bold text-primary">{totalStock}</div>
                                    <p className="text-xs text-primary/80 mt-1">Items in stock</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-warning/10 border-warning/20 flex flex-col min-h-[140px]">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-warning">
                                        Products
                                    </CardTitle>
                                    <ShoppingBag className="h-5 w-5 text-warning" />
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-center">
                                    <div className="text-3xl font-bold text-warning">{totalProducts}</div>
                                    <p className="text-xs text-warning/80 mt-1">Total listings</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Product Inventory Grid */}
                        <Card className="mb-8 bg-card border-border">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-foreground">
                                        <Package className="h-5 w-5 text-primary" />
                                        Product Inventory
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">Manage your product catalog</CardDescription>
                                </div>
                                <Link href="/partner/clothes">
                                    <Button variant="outline">View All Products</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                        <p className="mt-4 text-muted-foreground">Loading inventory...</p>
                                    </div>
                                ) : clothes.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-foreground mb-2">No Products Yet</h3>
                                        <p className="text-muted-foreground mb-6">Start by adding your first product to your inventory</p>
                                        <Link href="/partner/clothes/add">
                                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Product
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-stretch">
                                        {clothes.slice(0, 4).map((product) => {
                                            // MongoDB returns _id, not id
                                            const productId = (product as any)._id || product.id;
                                            const imageUrl = product.image;

                                            return (
                                                <Card key={productId} className="overflow-hidden hover:bg-muted/50 transition-all duration-300 group h-full flex flex-col bg-card border-border">
                                                    {/* Product Image Placeholder */}
                                                    <div className="h-48 w-full bg-muted relative overflow-hidden">
                                                        {imageUrl ? (
                                                            <img
                                                                src={imageUrl}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="h-16 w-16 text-muted-foreground opacity-40 group-hover:scale-110 transition-transform" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 right-2 bg-card px-2 py-1 rounded-full text-xs font-bold text-foreground shadow-sm border border-[#a57c65]">
                                                            {product.stock || 0} in stock
                                                        </div>
                                                    </div>

                                                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                                                            <p className="text-xs text-muted-foreground mb-3">{product.category} • {product.color}</p>

                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-lg font-bold text-primary">LKR {product.price}</span>
                                                                <span className="text-xs text-muted-foreground">{product.sales || 0} sold</span>
                                                            </div>
                                                        </div>


                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2 items-stretch">
                            {/* Recent Orders removed */}

                            {/* Quick Actions */}
                            <Card className="flex flex-col h-full bg-card border-border">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Quick Actions</CardTitle>
                                    <CardDescription className="text-muted-foreground">Manage your store</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="space-y-3">
                                        <Link href="/partner/clothes/add" className="block">
                                            <Button className="w-full flex items-center justify-start gap-3 h-auto py-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                                                <Plus className="h-5 w-5" />
                                                <div className="text-left">
                                                    <div className="font-semibold">Add New Product</div>
                                                    <div className="text-xs opacity-80">List a new item for sale</div>
                                                </div>
                                            </Button>
                                        </Link>
                                        <Link href="/partner/clothes" className="block">
                                            <Button variant="outline" className="w-full flex items-center justify-start gap-3 h-auto py-4">
                                                <Package className="h-5 w-5" />
                                                <div className="text-left">
                                                    <div className="font-semibold">Manage Inventory</div>
                                                    <div className="text-xs opacity-80">View and edit products</div>
                                                </div>
                                            </Button>
                                        </Link>
                                        {/* <Link href="/partner/analytics" className="block">
                                            <Button variant="outline" className="w-full flex items-center justify-start gap-3 h-auto py-4">
                                                <BarChart3 className="h-5 w-5" />
                                                <div className="text-left">
                                                    <div className="font-semibold">View Analytics</div>
                                                    <div className="text-xs opacity-80">Track sales performance</div>
                                                </div>
                                            </Button>
                                        </Link>
                                        <Link href="/partner/orders" className="block">
                                            <Button variant="outline" className="w-full flex items-center justify-start gap-3 h-auto py-4">
                                                <ShoppingBag className="h-5 w-5" />
                                                <div className="text-left">
                                                    <div className="font-semibold">Manage Orders</div>
                                                    <div className="text-xs opacity-80">Process customer orders</div>
                                                </div>
                                            </Button>
                                        </Link> */}
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