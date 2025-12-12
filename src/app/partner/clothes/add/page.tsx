'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { partnerService } from '@/services/partner.service';
import { toast } from 'sonner';
import { PARTNER_CATEGORIES } from '@/types/clothes';
import { Upload, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toTitleCase } from '@/lib/utils';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'brown', 'pink', 'purple', 'orange', 'beige', 'navy', 'maroon', 'teal', 'coral', 'multi', 'gold', 'silver'] as const;
const skinTones = ['fair', 'light', 'medium', 'tan', 'deep', 'dark'];
const occasions = ['casual', 'formal', 'business', 'party', 'wedding', 'sports', 'beach'];

// Zod validation schema
const addClothSchema = z.object({
    name: z.string().min(3, 'Product name must be at least 3 characters'),
    brand: z.string().min(2, 'Brand name must be at least 2 characters'),
    category: z.string().min(1, 'Please select a category'),
    color: z.string().min(1, 'Please select a color'),
    price: z.string().min(1, 'Price is required').refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
    }, 'Price must be a positive number'),
    stock: z.string().min(1, 'Stock quantity is required').refine((val) => {
        const num = parseInt(val);
        return !isNaN(num) && num >= 0;
    }, 'Stock must be 0 or greater'),
    size: z.string().min(1, 'Please select a size'),
    visibility: z.enum(['public', 'private']),
    description: z.string().max(500, 'Description must be 500 characters or less').optional(),
    imageUrl: z.string().optional(),
    suitableSkinTones: z.array(z.string()).optional(),
    occasion: z.array(z.string()).optional(),
});

type AddClothFormValues = z.infer<typeof addClothSchema>;

export default function AddPartnerClothesPage() {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);

    const form = useForm<AddClothFormValues>({
        resolver: zodResolver(addClothSchema),
        defaultValues: {
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
            suitableSkinTones: [],
            occasion: [],
        },
    });

    // Cloudinary image upload handler
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            toast.error('Cloudinary is not configured', {
                duration: Infinity,
                closeButton: true,
            });
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
                form.setValue('imageUrl', data.secure_url);
                toast.success('Image uploaded successfully!', {
                    duration: 3000,
                });

                // Call AI service to analyze cloth
                toast.info('Analyzing image for skin tones and occasions...', { duration: 2000 });
                try {
                    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/analyze-cloth`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ imageUrl: data.secure_url })
                    });

                    if (aiResponse.ok) {
                        const aiData = await aiResponse.json();
                        if (aiData.suitableSkinTones && Array.isArray(aiData.suitableSkinTones)) {
                            form.setValue('suitableSkinTones', aiData.suitableSkinTones);
                        }
                        if (aiData.occasions && Array.isArray(aiData.occasions)) {
                            form.setValue('occasion', aiData.occasions);
                        }
                        if (aiData.color) {
                            // Ensure the color is one of the allowed options
                            const detectedColor = aiData.color.toLowerCase();
                            if (colors.includes(detectedColor as any)) {
                                form.setValue('color', detectedColor);
                            }
                        }
                        toast.success('Auto-detected attributes!', { duration: 3000 });
                    } else {
                        console.error('AI analysis failed:', await aiResponse.text());
                        toast.warning('Could not auto-detect attributes. Please select manually.', { duration: 4000 });
                    }
                } catch (aiError) {
                    console.error('Error calling AI service:', aiError);
                    toast.warning('Could not auto-detect attributes. Please select manually.', { duration: 4000 });
                }

            } else {
                toast.error(data.error?.message || 'Upload failed', {
                    duration: Infinity,
                    closeButton: true,
                });
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Failed to upload image', {
                duration: Infinity,
                closeButton: true,
            });
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        form.setValue('imageUrl', '');
    };

    const onSubmit = async (data: AddClothFormValues) => {
        try {
            await partnerService.addCloth({
                name: data.name,
                category: data.category,
                color: data.color,
                brand: data.brand,
                price: parseFloat(data.price),
                stock: parseInt(data.stock) || 0,
                description: data.description || '',
                image: data.imageUrl || undefined,
                size: data.size,
                visibility: data.visibility as 'public' | 'private',
                suitableSkinTones: data.suitableSkinTones || [],
                occasion: data.occasion || [],
            } as any);

            toast.success('Product added successfully!', {
                duration: 3000,
            });
            router.push('/partner/clothes');
        } catch (error: any) {
            console.error('Error adding product:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
            }
            toast.error(error?.response?.data?.error || 'Failed to add product', {
                duration: Infinity,
                closeButton: true,
            });
        }
    };

    return (
        <ProtectedRoute allowedRoles={['partner']}>
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar role="partner" />

                <main className="flex-1 p-6">
                    <div className="max-w-3xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <Link href="/partner/clothes">
                                <Button variant="ghost" className="mb-4">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Inventory
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
                            <p className="mt-2 text-muted-foreground">
                                Add a new item to your store inventory
                            </p>
                        </div>

                        {/* Form */}
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-foreground">Product Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-foreground">Product Name *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="e.g., Summer Floral Dress"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="brand"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-foreground">Brand *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="e.g., Zara, H&M"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="imageUrl"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-foreground">Product Image</FormLabel>
                                                        <FormControl>
                                                            <div>
                                                                {field.value ? (
                                                                    <div className="mt-2 relative">
                                                                        <img
                                                                            src={field.value}
                                                                            alt="Product preview"
                                                                            className="w-full h-48 object-cover rounded-lg border border-border"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={removeImage}
                                                                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="mt-2">
                                                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted border-border">
                                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                                {uploading ? (
                                                                                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                                                                                ) : (
                                                                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                                                                )}
                                                                                <p className="mt-2 text-sm text-muted-foreground">
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
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="category"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-foreground">Category *</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select category" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {PARTNER_CATEGORIES.map((cat) => (
                                                                        <SelectItem key={cat} value={cat}>
                                                                            {toTitleCase(cat)}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="color"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-foreground">Color *</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select color" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {colors.map((color) => (
                                                                        <SelectItem key={color} value={color}>
                                                                            {color.charAt(0).toUpperCase() + color.slice(1)}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="price"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-foreground">Price (LKR) *</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    placeholder="0"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="stock"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-foreground">Stock Quantity *</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="0"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="size"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-foreground">Size *</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select size" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map((size) => (
                                                                        <SelectItem key={size} value={size}>
                                                                            {size}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="visibility"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-foreground">Visibility *</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select visibility" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="public">Public (Visible to Stylers)</SelectItem>
                                                                    <SelectItem value="private">Private (Hidden)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="occasion"
                                            render={() => (
                                                <FormItem>
                                                    <div className="mb-4">
                                                        <FormLabel className="text-base">Occasions (Select up to 4)</FormLabel>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                        {occasions.map((item) => (
                                                            <FormField
                                                                key={item}
                                                                control={form.control}
                                                                name="occasion"
                                                                render={({ field }) => {
                                                                    return (
                                                                        <FormItem
                                                                            key={item}
                                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                                        >
                                                                            <FormControl>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={field.value?.includes(item)}
                                                                                    onChange={(checked) => {
                                                                                        return checked.target.checked
                                                                                            ? field.onChange([...(field.value || []), item])
                                                                                            : field.onChange(
                                                                                                field.value?.filter(
                                                                                                    (value) => value !== item
                                                                                                )
                                                                                            )
                                                                                    }}
                                                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                                />
                                                                            </FormControl>
                                                                            <FormLabel className="font-normal capitalize cursor-pointer">
                                                                                {item}
                                                                            </FormLabel>
                                                                        </FormItem>
                                                                    )
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="suitableSkinTones"
                                            render={() => (
                                                <FormItem>
                                                    <div className="mb-4">
                                                        <FormLabel className="text-base">Suitable Skin Tones</FormLabel>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {skinTones.map((item) => (
                                                            <FormField
                                                                key={item}
                                                                control={form.control}
                                                                name="suitableSkinTones"
                                                                render={({ field }) => {
                                                                    return (
                                                                        <FormItem
                                                                            key={item}
                                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                                        >
                                                                            <FormControl>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={field.value?.includes(item)}
                                                                                    onChange={(checked) => {
                                                                                        return checked.target.checked
                                                                                            ? field.onChange([...(field.value || []), item])
                                                                                            : field.onChange(
                                                                                                field.value?.filter(
                                                                                                    (value) => value !== item
                                                                                                )
                                                                                            )
                                                                                    }}
                                                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                                />
                                                                            </FormControl>
                                                                            <FormLabel className="font-normal capitalize cursor-pointer">
                                                                                {item}
                                                                            </FormLabel>
                                                                        </FormItem>
                                                                    )
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-foreground">Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="Describe the product features, material, care instructions..."
                                                            rows={4}
                                                        />
                                                    </FormControl>
                                                    <div className="flex justify-between items-center">
                                                        <FormMessage />
                                                        <p className="text-sm text-muted-foreground">
                                                            {field.value?.length || 0}/500 characters
                                                        </p>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex gap-4">
                                            <Button
                                                type="submit"
                                                disabled={form.formState.isSubmitting}
                                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                                            >
                                                {form.formState.isSubmitting ? 'Adding...' : 'Add Product'}
                                            </Button>
                                            <Link href="/partner/clothes" className="flex-1">
                                                <Button type="button" variant="outline" className="w-full">
                                                    Cancel
                                                </Button>
                                            </Link>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
