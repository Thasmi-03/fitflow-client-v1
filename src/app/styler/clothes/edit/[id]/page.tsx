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
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { clothesService } from '@/services/clothes.service';
import { toast } from 'sonner';
import { Category, Color, OCCASIONS, Occasion } from '@/types/clothes';
import { Upload, X, Loader2 } from 'lucide-react';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const categories: Category[] = ['dress', 'shirt', 'pants', 'jacket', 'skirt', 'top', 'shorts', 'suit', 'blazer', 'sweater', 'coat', 'tshirt', 'frock'];
const colors: Color[] = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'brown', 'pink', 'purple', 'orange', 'beige', 'navy', 'maroon', 'teal', 'coral', 'multi'];

export default function EditClothesPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        color: '',
        occasion: [] as Occasion[],
        description: '',
        imageUrl: '',
    });

    useEffect(() => {
        if (id) {
            loadClothes();
        }
    }, [id]);

    const loadClothes = async () => {
        try {
            setFetching(true);
            const response = await clothesService.getById(id);
            const item = response.clothes;

            // Check if item exists
            if (!item) {
                toast.error('Clothes not found');
                router.push('/styler/clothes');
                return;
            }

            setFormData({
                name: item.name || '',
                category: item.category || '',
                color: item.color || '',
                // Handle occasion as array and cast to Occasion[]
                occasion: (Array.isArray(item.occasion) ? item.occasion : (item.occasion ? [item.occasion] : [])) as Occasion[],
                description: item.description || (item as any).note || '',
                imageUrl: item.imageUrl || (item as any).image || '',
            });
        } catch (error: any) {
            console.error('Error loading clothes:', error);
            toast.error(error?.response?.data?.error || 'Failed to load clothes');
            router.push('/styler/clothes');
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

    const handleSelectChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleOccasionToggle = (occasion: Occasion) => {
        setFormData(prev => {
            const currentOccasions = prev.occasion;
            if (currentOccasions.includes(occasion)) {
                // Remove occasion
                return { ...prev, occasion: currentOccasions.filter(o => o !== occasion) };
            } else {
                // Add occasion (max 4)
                if (currentOccasions.length >= 4) {
                    toast.error('You can select maximum 4 occasions');
                    return prev;
                }
                return { ...prev, occasion: [...currentOccasions, occasion] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate occasions (1-4)
            if (formData.occasion.length < 1) {
                toast.error('Please select at least 1 occasion');
                setLoading(false);
                return;
            }
            if (formData.occasion.length > 4) {
                toast.error('Please select maximum 4 occasions');
                setLoading(false);
                return;
            }

            // Build update payload
            const updatePayload: any = {
                name: formData.name,
                category: formData.category,
                color: formData.color,
                occasion: formData.occasion,
            };
            if (formData.description && formData.description.trim() !== '') {
                updatePayload.note = formData.description;
            }
            if (formData.imageUrl && formData.imageUrl.trim() !== '') {
                updatePayload.image = formData.imageUrl;
            }

            console.log('Sending update payload:', updatePayload);

            await clothesService.update(id, updatePayload);

            toast.success('Clothes updated successfully!');
            router.push('/styler/clothes');
        } catch (error: any) {
            console.error('Error updating clothes:', error);
            const errorMessage = error?.response?.data?.message || error?.response?.data?.error || 'Failed to update clothes';
            const errorDetails = error?.response?.data?.details;

            if (errorDetails && Array.isArray(errorDetails)) {
                const detailsMsg = errorDetails.map((d: any) => `${d.field}: ${d.message}`).join(', ');
                toast.error(`${errorMessage} - ${detailsMsg}`);
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <ProtectedRoute allowedRoles={['styler']}>
                <div className="flex min-h-screen bg-gray-50">
                    <DashboardSidebar role="styler" />
                    <main className="flex-1 p-8 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading...</p>
                        </div>
                    </main>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['styler']}>
            <div className="flex min-h-screen bg-gray-50">
                <DashboardSidebar role="styler" />

                <main className="flex-1 p-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <Link href="/styler/clothes">
                                <Button variant="ghost" className="mb-4">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Wardrobe
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Clothes</h1>
                            <p className="mt-2 text-gray-600">
                                Update the details of your clothing item
                            </p>
                        </div>

                        {/* Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Clothes Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="name">Name *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="e.g., Blue Denim Jacket"
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
                                                <SelectTrigger className="mt-1 w-full">
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
                                            <Label htmlFor="color">Color *</Label>
                                            <Select
                                                value={formData.color}
                                                onValueChange={(value) => handleSelectChange('color', value)}
                                                required
                                            >
                                                <SelectTrigger className="mt-1 w-full">
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

                                        <div className="md:col-span-2">
                                            <Label>Occasions * (Select 1-4)</Label>
                                            <div className="mt-2 grid grid-cols-2 gap-3">
                                                {OCCASIONS.map((occasion) => (
                                                    <label
                                                        key={occasion}
                                                        className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-gray-50"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.occasion.includes(occasion)}
                                                            onChange={() => handleOccasionToggle(occasion)}
                                                            className="w-4 h-4 rounded border-gray-300"
                                                        />
                                                        <span className="text-sm">
                                                            {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Selected: {formData.occasion.length}/4
                                            </p>
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label htmlFor="image">Clothes Image</Label>
                                            {formData.imageUrl ? (
                                                <div className="mt-2 relative">
                                                    <img
                                                        src={formData.imageUrl}
                                                        alt="Clothes preview"
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
                                            placeholder="Describe the item, its style, and any special features..."
                                            rows={4}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button type="submit" disabled={loading} className="flex-1">
                                            {loading ? 'Updating...' : 'Update Clothes'}
                                        </Button>
                                        <Link href="/styler/clothes" className="flex-1">
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
