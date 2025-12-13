'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { partnerService } from '@/services/partner.service';
import { toast } from 'sonner';
import { Category, Color } from '@/types/clothes';

const categories: Category[] = ['dress', 'shirt', 'pants', 'jacket', 'skirt', 'top', 'shorts', 'suit', 'frock', 'blazer', 'sweater', 'coat', 'tshirt'];
const colors: Color[] = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'brown', 'pink', 'purple', 'orange', 'beige', 'navy', 'maroon', 'teal', 'coral', 'multi'];

export default function EditPartnerClothesPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        color: '',
        brand: '',
        price: '',
        stock: '',
        description: '',
        imageUrl: '',
        visibility: 'public',
        size: '',
        occasion: [] as string[],
        suitableSkinTones: [] as string[],
    });

    useEffect(() => {
        loadClothes();
    }, [id]);

    const loadClothes = async () => {
        try {
            setFetching(true);
            const response = await partnerService.getClothById(id);
            const item = response;

            if (!item) {
                toast.error('Product not found', {
                    duration: Infinity,
                    closeButton: true,
                });
                router.push('/partner/clothes');
                return;
            }

            setFormData({
                name: item.name || '',
                category: item.category || '',
                color: item.color || '',
                brand: item.brand || '',
                price: item.price?.toString() || '',
                stock: item.stock?.toString() || '0',
                description: item.description || (item as any).note || '',
                imageUrl: item.image || '',
                visibility: item.visibility || 'public',
                size: item.size || '',
                occasion: Array.isArray(item.occasion) ? item.occasion : (item.occasion ? [item.occasion] : []),
                suitableSkinTones: item.suitableSkinTones || [],
            });
        } catch (error: any) {
            console.error('Error loading product:', error);
            toast.error(error?.response?.data?.error || 'Failed to load product', {
                duration: Infinity,
                closeButton: true,
            });
            router.push('/partner/clothes');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleMultiSelectChange = (name: string, value: string) => {
        const currentValues = formData[name as keyof typeof formData] as string[];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

        setFormData({
            ...formData,
            [name]: newValues,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await partnerService.updateCloth(id, {
                name: formData.name,
                category: formData.category,
                color: formData.color,
                brand: formData.brand,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0,
                description: formData.description,
                image: formData.imageUrl || undefined,
                visibility: formData.visibility as 'public' | 'private',
                size: formData.size,
                occasion: formData.occasion,
                suitableSkinTones: formData.suitableSkinTones,
            });

            toast.success('Product updated successfully!', {
                duration: 3000,
            });
            router.push('/partner/clothes');
        } catch (error: any) {
            console.error('Error updating product:', error);
            toast.error(error?.response?.data?.error || 'Failed to update product', {
                duration: Infinity,
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <ProtectedRoute allowedRoles={['partner']}>
                <div className="flex min-h-screen bg-background items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                        <p className="text-muted-foreground">Loading product details...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['partner']}>
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar role="partner" />

                <main className="flex-1 p-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <Link href="/partner/clothes">
                                <Button variant="ghost" className="mb-4">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Inventory
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
                            <p className="mt-2 text-muted-foreground">
                                Update product information
                            </p>
                        </div>

                        {/* Form */}
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-foreground">Product Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="name" className="text-foreground">Product Name *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="e.g., Summer Floral Dress"
                                                required
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="brand" className="text-foreground">Brand *</Label>
                                            <Input
                                                id="brand"
                                                name="brand"
                                                value={formData.brand}
                                                onChange={handleChange}
                                                placeholder="e.g., Zara, H&M"
                                                required
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="category" className="text-foreground">Category *</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(value) => handleSelectChange('category', value)}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat} value={cat}>
                                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="color" className="text-foreground">Color *</Label>
                                            <Select
                                                value={formData.color}
                                                onValueChange={(value) => handleSelectChange('color', value)}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select color" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {colors.map((color) => (
                                                        <SelectItem key={color} value={color}>
                                                            {color.charAt(0).toUpperCase() + color.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="price" className="text-foreground">Price (LKR) *</Label>
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.price}
                                                onChange={handleChange}
                                                placeholder="0"
                                                required
                                                max="25000"
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="stock" className="text-foreground">Stock Quantity *</Label>
                                            <Input
                                                id="stock"
                                                name="stock"
                                                type="number"
                                                min="0"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                placeholder="0"
                                                required
                                                max="50"
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="size" className="text-foreground">Size</Label>
                                            <Input
                                                id="size"
                                                name="size"
                                                value={formData.size}
                                                onChange={handleChange}
                                                placeholder="e.g., S, M, L, XL, 32, 34"
                                                className="mt-1"
                                            />
                                        </div>



                                        <div>
                                            <Label htmlFor="visibility" className="text-foreground">Visibility *</Label>
                                            <Select
                                                value={formData.visibility}
                                                onValueChange={(value) => handleSelectChange('visibility', value)}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select visibility" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="public">Public (Visible to Stylers)</SelectItem>
                                                    <SelectItem value="private">Private (Hidden)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="imageUrl" className="text-foreground">Image URL</Label>
                                            <Input
                                                id="imageUrl"
                                                name="imageUrl"
                                                value={formData.imageUrl}
                                                onChange={handleChange}
                                                placeholder="https://example.com/image.jpg"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-foreground mb-2 block">Occasions (Select up to 4)</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {['casual', 'formal', 'business', 'party', 'wedding', 'sports', 'beach'].map((occ) => (
                                                <div key={occ} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`occ-${occ}`}
                                                        checked={formData.occasion.includes(occ)}
                                                        onChange={() => handleMultiSelectChange('occasion', occ)}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <Label htmlFor={`occ-${occ}`} className="text-sm font-normal cursor-pointer capitalize">
                                                        {occ}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-foreground mb-2 block">Suitable Skin Tones</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {['fair', 'light', 'medium', 'tan', 'deep', 'dark'].map((tone) => (
                                                <div key={tone} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`tone-${tone}`}
                                                        checked={formData.suitableSkinTones.includes(tone)}
                                                        onChange={() => handleMultiSelectChange('suitableSkinTones', tone)}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <Label htmlFor={`tone-${tone}`} className="text-sm font-normal cursor-pointer capitalize">
                                                        {tone}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="description" className="text-foreground">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe the product features, material, care instructions..."
                                            rows={4}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                                            {loading ? 'Updating...' : 'Update Product'}
                                        </Button>
                                        <Link href="/partner/clothes" className="flex-1">
                                            <Button type="button" variant="outline" className="w-full">
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
