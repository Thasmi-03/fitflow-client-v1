'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Upload, X, Loader2 } from 'lucide-react';
import { clothesService } from '@/services/clothes.service';
import { toast } from 'sonner';
import { CATEGORIES, OCCASIONS, Occasion, SKIN_TONES, SkinTone } from '@/types/clothes';
import { toTitleCase } from '@/lib/utils';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'brown', 'pink', 'purple', 'orange', 'beige', 'navy', 'maroon', 'teal', 'coral', 'multi'] as const;

const addClothesSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    category: z.string().min(1, 'Please select a category'),
    color: z.string().min(1, 'Please select a color'),
    occasion: z.array(z.string()).min(1, 'Please select at least 1 occasion').max(4, 'Please select maximum 4 occasions'),
    skinTone: z.array(z.string()).optional(),
    description: z.string().max(500, 'Description must be 500 characters or less').optional(),
    imageUrl: z.string().optional(),
});

type AddClothesFormValues = z.infer<typeof addClothesSchema>;

interface AddClothesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AddClothesModal({ open, onOpenChange, onSuccess }: AddClothesModalProps) {
    const [uploading, setUploading] = useState(false);

    const form = useForm<AddClothesFormValues>({
        resolver: zodResolver(addClothesSchema),
        defaultValues: {
            name: '',
            category: '',
            color: '',
            occasion: [],
            skinTone: [],
            description: '',
            imageUrl: '',
        },
    });

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
                toast.info('Analyzing image for attributes...', { duration: 2000 });
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

                        // Auto-fill and lock fields
                        if (aiData.suitableSkinTones && Array.isArray(aiData.suitableSkinTones)) {
                            form.setValue('skinTone', aiData.suitableSkinTones);
                        }
                        if (aiData.occasions && Array.isArray(aiData.occasions)) {
                            form.setValue('occasion', aiData.occasions);
                        }
                        if (aiData.color) {
                            const detectedColor = aiData.color.toLowerCase();
                            if (colors.includes(detectedColor as any)) {
                                form.setValue('color', detectedColor);
                            }
                        }
                        toast.success('Attributes auto-detected by AI!', { duration: 3000 });
                    } else {
                        console.error('AI analysis failed:', await aiResponse.text());
                        toast.warning('Could not auto-detect attributes.', { duration: 4000 });
                    }
                } catch (aiError) {
                    console.error('Error calling AI service:', aiError);
                    toast.warning('Could not auto-detect attributes.', { duration: 4000 });
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

    const onSubmit = async (data: AddClothesFormValues) => {
        try {
            const payload = {
                name: data.name,
                category: data.category,
                color: data.color,
                occasion: data.occasion,
                skinTone: data.skinTone && data.skinTone.length > 0 ? data.skinTone : undefined,
                note: data.description || undefined,
                image: data.imageUrl || undefined,
            };

            await clothesService.create(payload);

            toast.success('Clothes added successfully!', {
                duration: 3000,
            });

            // Reset form
            form.reset();

            // Close modal
            onOpenChange(false);

            // Call success callback
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('Error adding clothes:', error);

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Clothes</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
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
                                        <FormLabel>Color (Auto-detected)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled>
                                            <FormControl>
                                                <SelectTrigger className="w-full bg-muted">
                                                    <SelectValue placeholder="AI will detect color" />
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
                                        <FormLabel>Occasions (Auto-detected)</FormLabel>
                                        <div className="mt-2 grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg border">
                                            {OCCASIONS.map((occasion) => (
                                                <label
                                                    key={occasion}
                                                    className={`flex items-center space-x-2 p-2 rounded border ${field.value.includes(occasion) ? 'bg-primary/10 border-primary' : 'bg-background border-border opacity-50'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value.includes(occasion)}
                                                        readOnly
                                                        disabled
                                                        className="w-4 h-4 rounded border-border"
                                                    />
                                                    <span className="text-sm">
                                                        {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="skinTone"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Suitable Skin Tones (Auto-detected)</FormLabel>
                                        <div className="mt-2 grid grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg border">
                                            {SKIN_TONES.map((tone) => (
                                                <label
                                                    key={tone}
                                                    className={`flex items-center space-x-2 p-2 rounded border ${field.value?.includes(tone) ? 'bg-primary/10 border-primary' : 'bg-background border-border opacity-50'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value?.includes(tone)}
                                                        readOnly
                                                        disabled
                                                        className="w-4 h-4 rounded border-border"
                                                    />
                                                    <span className="text-sm">
                                                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
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
                                className="flex-1"
                            >
                                {form.formState.isSubmitting ? 'Adding...' : 'Add Clothes'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
