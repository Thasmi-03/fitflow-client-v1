'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SkinTone } from '@/types/clothes';
import ImageUploader from '@/components/ImageUploader';
import { userService } from '@/services/user.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { stylerProfileSchema, StylerProfileFormValues } from '@/schemas/profile.schema';

const skinTones: SkinTone[] = ['fair', 'light', 'medium', 'tan', 'deep', 'dark'];

export default function ProfileSettingsPage() {
    const { user, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<StylerProfileFormValues>({
        resolver: zodResolver(stylerProfileSchema),
        defaultValues: {
            name: user?.name || '',
            skinTone: (user?.skinTone as SkinTone) || 'medium',
            preferredStyle: user?.preferredStyle || '',
            profilePhoto: user?.profilePhoto || '',
        },
    });

    const formData = watch();

    useEffect(() => {
        if (user) {
            setValue('name', user.name || '');
            setValue('skinTone', (user.skinTone as SkinTone) || 'medium');
            setValue('preferredStyle', user.preferredStyle || '');
            setValue('profilePhoto', user.profilePhoto || '');
        }
    }, [user, setValue]);

    const onSubmit = async (data: StylerProfileFormValues) => {
        try {
            await userService.updateProfile({
                name: data.name,
                profilePhoto: data.profilePhoto,
                skinTone: data.skinTone,
                preferredStyle: data.preferredStyle,
            });

            toast.success('Profile updated successfully!', {
                duration: 3000,
            });
            setIsEditing(false);
            await refreshUser();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile', {
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
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Settings className="h-8 w-8 text-[#e2c2b7]" />
                                Profile Settings
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manage your account settings and preferences
                            </p>
                        </div>

                        {/* Profile Information */}
                        <Card className="mb-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                    {!isEditing && (
                                        <Button onClick={() => setIsEditing(true)} variant="outline">
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="flex justify-center mb-6">
                                            <div className="w-32">
                                                <Label className="mb-2 block text-center">Profile Photo</Label>
                                                <div className="flex flex-col items-center gap-2">
                                                    {formData.profilePhoto && (
                                                        <img
                                                            src={formData.profilePhoto}
                                                            alt="Profile"
                                                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                                        />
                                                    )}
                                                    <ImageUploader
                                                        useCloudinaryDirect={true}
                                                        autoUpload={true}
                                                        onUploadStart={() => setIsUploadingPhoto(true)}
                                                        onUploadComplete={(url) => {
                                                            setValue('profilePhoto', url);
                                                            setIsUploadingPhoto(false);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    {...register('name')}
                                                    id="name"
                                                    placeholder="Your name"
                                                    className="mt-1"
                                                />
                                                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={user?.email}
                                                    placeholder="your.email@example.com"
                                                    className="mt-1"
                                                    disabled
                                                />
                                            </div>

                                            <div>
                                            </div>

                                            <div>
                                                <Label htmlFor="skinTone">
                                                    Skin Tone
                                                    {formData.skinTone && user?.skinToneDetectedAt && (
                                                        <span className="text-xs text-green-600 ml-2">
                                                            ✓ Auto-detected
                                                        </span>
                                                    )}
                                                </Label>
                                                <Select
                                                    value={formData.skinTone}
                                                    onValueChange={(value) => setValue('skinTone', value as SkinTone)}
                                                >
                                                    <SelectTrigger className="mt-1 w-full">
                                                        <SelectValue placeholder="Select skin tone" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {skinTones.map((tone) => (
                                                            <SelectItem key={tone} value={tone}>
                                                                {tone.charAt(0).toUpperCase() + tone.slice(1)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.skinTone && <p className="text-destructive text-sm mt-1">{errors.skinTone.message}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="preferredStyle">Preferred Style</Label>
                                                <Input
                                                    {...register('preferredStyle')}
                                                    id="preferredStyle"
                                                    placeholder="e.g., Casual, Formal, Bohemian"
                                                    className="mt-1"
                                                />
                                                {errors.preferredStyle && <p className="text-destructive text-sm mt-1">{errors.preferredStyle.message}</p>}
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <Button type="submit" disabled={isSubmitting || isUploadingPhoto} className="flex-1">
                                                {isSubmitting || isUploadingPhoto ? (isUploadingPhoto ? 'Uploading Photo...' : 'Saving...') : 'Save Changes'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsEditing(false)}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Full Name</p>
                                                <p className="font-medium">{formData.name || 'Not set'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Email</p>
                                                <p className="font-medium">{user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                            <Settings className="h-5 w-5 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-600">Skin Tone</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium capitalize">{formData.skinTone || 'Not set'}</p>
                                                    {user?.skinToneDetectedAt && (
                                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                            Auto-detected
                                                        </span>
                                                    )}
                                                </div>
                                                {user?.skinToneDetectedAt && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Detected on {new Date(user.skinToneDetectedAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                            <Settings className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Preferred Style</p>
                                                <p className="font-medium">{formData.preferredStyle || 'Not set'}</p>
                                            </div>
                                        </div>
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
