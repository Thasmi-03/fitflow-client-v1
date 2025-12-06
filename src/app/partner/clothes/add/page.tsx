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
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { partnerService } from '@/services/partner.service';
import { toast } from 'sonner';
import { PARTNER_CATEGORIES } from '@/types/clothes';
import { Upload, X, Loader2 } from 'lucide-react';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'brown', 'pink', 'purple', 'orange', 'beige', 'navy', 'maroon', 'teal', 'coral', 'multi', 'gold', 'silver'] as const;
const skinTones = ['fair', 'light', 'medium', 'tan', 'deep', 'dark'];

export default function AddPartnerClothesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        color: '',
        brand: '',
        price: '',
        stock: '',
        description: '',
        imageUrl: '',
        size: '',
        visibility: 'public',
        suitableSkinTones: [] as string[],
    });

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

    // Cloudinary image upload handler
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            toast.error('Cloudinary is not configured');
            return;
        }

        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: uploadFormData }
            );
            const data = await res.json();

            if (data.secure_url) {
                setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
                toast.success('Image uploaded successfully!');
            } else {
                toast.error(data.error?.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.name || !formData.category || !formData.color || !formData.brand || !formData.price || !formData.stock || !formData.size) {
            toast.error('Please fill in all required fields');
            setLoading(false);
            return;
        }

        try {
            await partnerService.addCloth({
                name: formData.name,
                category: formData.category,
                color: formData.color,
                brand: formData.brand,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0,
                description: formData.description,
                image: formData.imageUrl || undefined,
                size: formData.size,
                visibility: formData.visibility as 'public' | 'private',
                suitableSkinTones: formData.suitableSkinTones,
            } as any); // Type assertion to allow extra fields

            toast.success('Product added successfully!');
            router.push('/partner/clothes');
        } catch (error: any) {
            console.error('Error adding product:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
            }
            toast.error(error?.response?.data?.error || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['partner']}>
            <div className="flex min-h-screen bg-gray-50">
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
                            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                            <p className="mt-2 text-gray-600">
                                Add a new item to your store inventory
                            </p>
                        </div>

                        {/* Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="name">Product Name *</Label>
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
                                            <Label htmlFor="brand">Brand *</Label>
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
                                            <Label htmlFor="category">Category *</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(value) => handleSelectChange('category', value)}
                                                required
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PARTNER_CATEGORIES.map((cat) => (
                                                        <SelectItem key={cat} value={cat}>
                                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="color">Color *</Label>
                                            <Select
                                                value={formData.color}
                                                onValueChange={(value) => handleSelectChange('color', value)}
                                                required
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
                                            <Label htmlFor="price">Price ($) *</Label>
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.price}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                required
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="stock">Stock Quantity *</Label>
                                            <Input
                                                id="stock"
                                                name="stock"
                                                type="number"
                                                min="0"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                placeholder="0"
                                                required
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="size">Size *</Label>
                                            <Select
                                                value={formData.size}
                                                onValueChange={(value) => handleSelectChange('size', value)}
                                                required
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select size" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map((size) => (
                                                        <SelectItem key={size} value={size}>
                                                            {size}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="visibility">Visibility *</Label>
                                            <Select
                                                value={formData.visibility}
                                                onValueChange={(value) => handleSelectChange('visibility', value)}
                                                required
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
                                            <Label htmlFor="image">Product Image</Label>
                                            {formData.imageUrl ? (
                                                <div className="mt-2 relative">
                                                    <img
                                                        src={formData.imageUrl}
                                                        alt="Product preview"
                                                        className="w-full h-48 object-cover rounded-lg border"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={removeImage}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="mt-2">
                                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            {uploading ? (
                                                                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                                                            ) : (
                                                                <Upload className="h-8 w-8 text-gray-400" />
                                                            )}
                                                            <p className="mt-2 text-sm text-gray-500">
                                                                {uploading ? 'Uploading...' : 'Click to upload image'}
                                                            </p>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            disabled={uploading}
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
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
                                        <Button type="submit" disabled={loading} className="flex-1 bg-[#e2c2b7] hover:bg-[#d4b5a8] text-gray-900">
                                            {loading ? 'Adding...' : 'Add Product'}
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
