'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, DollarSign, TrendingUp, Plus, ShoppingBag, Edit, BarChart3, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { partnerService } from '@/services/partner.service';
import { ordersService } from '@/services/orders.service';
import { PartnerClothes } from '@/types/partner';
import { Order } from '@/types/orders';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PartnerDashboard() {
    const router = useRouter();
    const [clothes, setClothes] = useState<PartnerClothes[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClothes();
        loadOrders();
    }, []);

    const loadClothes = async () => {
        try {
            setLoading(true);
            const response = await partnerService.getClothes();
            setClothes(response.clothes);
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

    const loadOrders = async () => {
        try {
            const response = await ordersService.getAll();
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

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
            <div className="flex min-h-screen bg-gray-50">
                <DashboardSidebar role="partner" />

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
                                    <p className="mt-2 text-gray-600">
                                        Manage your inventory, track sales, and grow your business
                                    </p>
                                </div>
                                <Link href="/partner/clothes/add">
                                    <Button className="flex items-center gap-2 bg-[#e2c2b7] hover:bg-[#d4b5a8] text-gray-900">
                                        <Plus className="h-4 w-4" />
                                        Add New Product
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid gap-6 md:grid-cols-4 mb-8 items-stretch">
                            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 flex flex-col min-h-[140px]">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-green-900">
                                        Total Revenue
                                    </CardTitle>
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-center">
                                    <div className="text-3xl font-bold text-green-900">${totalRevenue.toFixed(2)}</div>
                                    <p className="text-xs text-green-700 mt-1">All time earnings</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 flex flex-col min-h-[140px]">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-blue-900">
                                        Total Views
                                    </CardTitle>
                                    <Eye className="h-5 w-5 text-blue-600" />
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-center">
                                    <div className="text-3xl font-bold text-blue-900">{totalViews}</div>
                                    <p className="text-xs text-blue-700 mt-1">Styler views</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 flex flex-col min-h-[140px]">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-purple-900">
                                        Inventory
                                    </CardTitle>
                                    <Package className="h-5 w-5 text-purple-600" />
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-center">
                                    <div className="text-3xl font-bold text-purple-900">{totalStock}</div>
                                    <p className="text-xs text-purple-700 mt-1">Items in stock</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 flex flex-col min-h-[140px]">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-orange-900">
                                        Products
                                    </CardTitle>
                                    <ShoppingBag className="h-5 w-5 text-orange-600" />
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-center">
                                    <div className="text-3xl font-bold text-orange-900">{totalProducts}</div>
                                    <p className="text-xs text-orange-700 mt-1">Total listings</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Product Inventory Grid */}
                        <Card className="mb-8">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-[#e2c2b7]" />
                                        Product Inventory
                                    </CardTitle>
                                    <CardDescription>Manage your product catalog</CardDescription>
                                </div>
                                <Link href="/partner/clothes">
                                    <Button variant="outline">View All Products</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                                        <p className="mt-4 text-gray-600">Loading inventory...</p>
                                    </div>
                                ) : clothes.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Yet</h3>
                                        <p className="text-gray-600 mb-6">Start by adding your first product to your inventory</p>
                                        <Link href="/partner/clothes/add">
                                            <Button className="bg-[#e2c2b7] hover:bg-[#d4b5a8] text-gray-900">
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
                                                <Card key={productId} className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
                                                    {/* Product Image Placeholder */}
                                                    <div className="h-48 w-full bg-gradient-to-br from-[#e2c2b7] to-[#d4b5a8] relative overflow-hidden">
                                                        {imageUrl ? (
                                                            <img
                                                                src={imageUrl}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="h-16 w-16 text-white opacity-40 group-hover:scale-110 transition-transform" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-bold">
                                                            {product.stock || 0} in stock
                                                        </div>
                                                    </div>

                                                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                                                            <p className="text-xs text-gray-600 mb-3">{product.category} • {product.color}</p>

                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-lg font-bold text-[#e2c2b7]">${product.price}</span>
                                                                <span className="text-xs text-gray-600">{product.sales || 0} sold</span>
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

                        <div className="grid gap-6 md:grid-cols-2 items-stretch">
                            {/* Recent Orders */}
                            <Card className="flex flex-col h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5 text-[#e2c2b7]" />
                                        Recent Orders
                                    </CardTitle>
                                    <CardDescription>Latest customer orders</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <div className="space-y-4 flex-1">
                                        {orders.length === 0 ? (
                                            <p className="text-center text-gray-500 py-4">No recent orders</p>
                                        ) : (
                                            orders.slice(0, 5).map((order) => (
                                                <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">Order #{order._id.slice(-6)}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">${order.totalAmount}</p>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {/* <Link href="/partner/orders">
                                        <Button variant="outline" className="w-full mt-4">View All Orders</Button>
                                    </Link> */}
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="flex flex-col h-full">
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                    <CardDescription>Manage your store</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="space-y-3">
                                        <Link href="/partner/clothes/add" className="block">
                                            <Button className="w-full flex items-center justify-start gap-3 h-auto py-4 bg-[#e2c2b7] hover:bg-[#d4b5a8] text-gray-900">
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