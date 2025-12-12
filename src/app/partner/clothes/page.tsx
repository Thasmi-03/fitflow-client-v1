'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package, Search, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { partnerService } from '@/services/partner.service';
import { PartnerClothes } from '@/types/partner';
import { toast } from 'sonner';
import { Category, Color } from '@/types/clothes';

const categories: Category[] = ['dress', 'shirt', 'pants', 'jacket', 'skirt', 'top', 'shorts', 'suit', 'frock', 'blazer', 'sweater', 'coat', 'tshirt'];
const colors: Color[] = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'brown', 'pink', 'purple', 'orange', 'beige', 'navy', 'maroon', 'teal', 'coral', 'multi'];

export default function PartnerInventoryPage() {
    const [clothes, setClothes] = useState<PartnerClothes[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterColor, setFilterColor] = useState('all');
    const [filterBrand, setFilterBrand] = useState('all');

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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await partnerService.deleteCloth(id);
            toast.success('Product deleted successfully', {
                duration: 3000,
            });
            loadClothes();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product', {
                duration: Infinity,
                closeButton: true,
            });
        }
    };

    // Filter and search logic
    const filteredClothes = useMemo(() => {
        return clothes.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.color.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
            const matchesColor = filterColor === 'all' || item.color === filterColor;
            const matchesBrand = filterBrand === 'all' || item.brand === filterBrand;

            return matchesSearch && matchesCategory && matchesColor && matchesBrand;
        });
    }, [clothes, searchTerm, filterCategory, filterColor, filterBrand]);

    // Get unique brands for filter
    const brands = useMemo(() => Array.from(new Set(clothes.map(c => c.brand))), [clothes]);

    return (
        <ProtectedRoute allowedRoles={['partner']}>
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar role="partner" />

                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Product Inventory</h1>
                                <p className="mt-2 text-muted-foreground">
                                    Manage your product catalog - {filteredClothes.length} of {clothes.length} products
                                </p>
                            </div>
                            <Link href="/partner/clothes/add">
                                <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                                    <Plus className="h-4 w-4" />
                                    Add New Product
                                </Button>
                            </Link>
                        </div>

                        {/* Search and Filters */}
                        <Card className="mb-6 bg-card border-border">
                            <CardContent className="pt-6">
                                <div className="grid gap-4 md:grid-cols-4">
                                    {/* Search */}
                                    <div className="md:col-span-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search products..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Category Filter */}
                                    <div>
                                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Color Filter */}
                                    <div>
                                        <Select value={filterColor} onValueChange={setFilterColor}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Color" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Colors</SelectItem>
                                                {colors.map((color) => (
                                                    <SelectItem key={color} value={color}>
                                                        {color.charAt(0).toUpperCase() + color.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Brand Filter */}
                                    <div>
                                        <Select value={filterBrand} onValueChange={setFilterBrand}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Brand" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Brands</SelectItem>
                                                {brands.map((brand) => (
                                                    <SelectItem key={brand} value={brand}>
                                                        {brand}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Clothes List */}
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <Package className="h-5 w-5 text-primary" />
                                    All Products
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                        <p className="mt-4 text-muted-foreground">Loading inventory...</p>
                                    </div>
                                ) : filteredClothes.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
                                            {clothes.length === 0 ? 'No Products Yet' : 'No matches found'}
                                        </h3>
                                        <p className="text-muted-foreground mb-6">
                                            {clothes.length === 0
                                                ? 'Start by adding your first product to your inventory'
                                                : 'Try adjusting your filters or search terms'
                                            }
                                        </p>
                                        {clothes.length === 0 && (
                                            <Link href="/partner/clothes/add">
                                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Product
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {filteredClothes.map((item) => {
                                            // Ensure we get the ID correctly - MongoDB returns _id
                                            const itemId = (item as any)._id || item.id;
                                            const imageUrl = item.image;

                                            return (
                                                <div
                                                    key={itemId}
                                                    className="border border-border rounded-lg overflow-hidden hover:bg-muted/50 transition-all duration-300 flex flex-col h-full bg-card"
                                                >
                                                    {/* Product Image */}
                                                    <div className="h-48 w-full bg-muted relative overflow-hidden">
                                                        {imageUrl ? (
                                                            <img
                                                                src={imageUrl}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="h-16 w-16 text-muted-foreground opacity-40" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 right-2 bg-card px-2 py-1 rounded-full text-xs font-bold text-foreground shadow-sm border border-[#a57c65]">
                                                            {item.stock || 0} in stock
                                                        </div>
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="p-4 flex flex-col flex-1">
                                                        <h3 className="font-semibold text-lg mb-1 text-foreground">{item.name}</h3>
                                                        <p className="text-sm text-muted-foreground mb-3">{item.category} • {item.color}</p>

                                                        <div className="space-y-1 text-sm text-muted-foreground mb-3">
                                                            <p>Brand: <span className="font-medium text-foreground">{item.brand}</span></p>
                                                            <p>Price: <span className="font-bold text-primary text-lg">Rs. {item.price}</span></p>
                                                            <p>Sales: <span className="font-medium text-foreground">{item.sales || 0} sold</span></p>
                                                            <p>Visibility: <span className="font-medium capitalize text-foreground">{item.visibility}</span></p>
                                                        </div>

                                                        <div className="flex gap-2 mt-auto">
                                                            <Link href={`/partner/clothes/edit/${itemId}`} className="flex-1">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full"
                                                                >
                                                                    <Edit className="h-3 w-3 mr-1" />
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(itemId)}
                                                            >
                                                                <Trash2 className="h-3 w-3 mr-1" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
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
