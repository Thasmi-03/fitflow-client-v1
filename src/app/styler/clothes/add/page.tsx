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
import { clothesService } from '@/services/clothes.service';
import { toast } from 'sonner';
import { CATEGORIES, OCCASIONS, Occasion } from '@/types/clothes';
import { Upload, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toTitleCase } from '@/lib/utils';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'brown', 'pink', 'purple', 'orange', 'beige', 'navy', 'maroon', 'teal', 'coral', 'multi'] as const;

// Zod validation schema
const addClothesSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    category: z.string().min(1, 'Please select a category'),
    color: z.string().min(1, 'Please select a color'),
    occasion: z.array(z.string()).min(1, 'Please select at least 1 occasion').max(4, 'Please select maximum 4 occasions'),
    description: z.string().max(500, 'Description must be 500 characters or less').optional(),
    imageUrl: z.string().optional(),
});

type AddClothesFormValues = z.infer<typeof addClothesSchema>;

export default function AddClothesPage() {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);

    const form = useForm<AddClothesFormValues>({
        resolver: zodResolver(addClothesSchema),
        defaultValues: {
            name: '',
            category: '',
            color: '',
            occasion: [],
            description: '',
            imageUrl: '',
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

    const handleOccasionToggle = (occasion: Occasion) => {
        const currentOccasions = form.getValues('occasion');
        if (currentOccasions.includes(occasion)) {
            // Remove occasion
            form.setValue('occasion', currentOccasions.filter(o => o !== occasion));
        } else {
            // Add occasion (validation will handle max 4)
            form.setValue('occasion', [...currentOccasions, occasion]);
        }
    };

    const onSubmit = async (data: AddClothesFormValues) => {
        try {
            const payload = {
                name: data.name,
                category: data.category,
                color: data.color,
                occasion: data.occasion,
                note: data.description || undefined,
                image: data.imageUrl || undefined,
            };

            console.log('Submitting clothes data:', payload);

            await clothesService.create(payload);

            toast.success('Clothes added successfully!', {
                duration: 3000,
            });
            router.push('/styler/clothes');
        } catch (error: any) {
            console.error('Error adding clothes:', error);
            console.error('Error response:', error?.response);
            console.error('Error data:', error?.response?.data);

            // Build detailed error message
            const errorMessage = error?.response?.data?.error
                || error?.response?.data?.message
                || error?.message
                || 'Failed to add clothes';

            const errorDetails = error?.response?.data?.details;
            const fullErrorMessage = errorDetails
                ? `${errorMessage}: ${JSON.stringify(errorDetails)}`
                : errorMessage;

            toast.error(fullErrorMessage, {
                duration: Infinity,
                closeButton: true,
            });
        }
    };

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
                            <h1 className="text-3xl font-bold text-gray-900">Add New Clothes</h1>
                            <p className="mt-2 text-gray-600">
                                Add a new item to your wardrobe
                            </p>
                        </div>

                        {/* Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Clothes Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Name *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="e.g., Blue Denim Jacket"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Category *</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select category" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {CATEGORIES.map((cat) => (
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
                                                        <FormLabel>Color *</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
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

                                            <FormField
                                                control={form.control}
                                                name="occasion"
                                                render={({ field }) => (
                                                    <FormItem className="md:col-span-2">
                                                        <FormLabel>Occasions * (Select 1-4)</FormLabel>
                                                        <div className="mt-2 grid grid-cols-2 gap-3">
                                                            {OCCASIONS.map((occasion) => (
                                                                <label
                                                                    key={occasion}
                                                                    className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-gray-50"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={field.value.includes(occasion)}
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
                                                            Selected: {field.value.length}/4
                                                        </p>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="imageUrl"
                                                render={({ field }) => (
                                                    <FormItem className="md:col-span-2">
                                                        <FormLabel>Clothes Image</FormLabel>
                                                        <FormControl>
                                                            <div>
                                                                {field.value ? (
                                                                    <div className="mt-2 relative">
                                                                        <img
                                                                            src={field.value}
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
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="Describe the item, its style, and any special features..."
                                                            rows={4}
                                                        />
                                                    </FormControl>
                                                    <div className="flex justify-between items-center">
                                                        <FormMessage />
                                                        <p className="text-sm text-gray-500">
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
                                                className="flex-1"
                                            >
                                                {form.formState.isSubmitting ? 'Adding...' : 'Add Clothes'}
                                            </Button>
                                            <Link href="/styler/clothes" className="flex-1">
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
