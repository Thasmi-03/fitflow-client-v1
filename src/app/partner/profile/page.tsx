'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Shield, Store, Save, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import { UserProfile } from '@/types/user';
import ImageUploader from '@/components/ImageUploader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partnerProfileSchema, PartnerProfileFormValues } from '@/schemas/profile.schema';

export default function PartnerProfilePage() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<PartnerProfileFormValues>({
        resolver: zodResolver(partnerProfileSchema),
        defaultValues: {
            name: '',
            phone: '',
            location: '',
            profilePhoto: ''
        }
    });

    const profilePhoto = watch('profilePhoto');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await userService.getProfile();
            const data = response;
            setProfile(data);

            // Update form values
            setValue('name', data.name || '');
            setValue('phone', data.phone || '');
            setValue('location', data.location || '');
            setValue('profilePhoto', data.profilePhoto || '');
        } catch (error) {
            console.error('Error loading profile:', error);
            toast.error('Failed to load profile', {
                duration: Infinity,
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: PartnerProfileFormValues) => {
        try {
            await userService.updateProfile(data);
            toast.success('Profile updated successfully!', {
                duration: 3000,
            });
            await refreshUser();
            loadProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile', {
                duration: Infinity,
                closeButton: true,
            });
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['partner']}>
                <div className="flex min-h-screen bg-background">
                    <DashboardSidebar role="partner" />
                    <main className="flex-1 p-8 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                            <p className="text-muted-foreground">Loading profile...</p>
                        </div>
                    </main>
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
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <User className="h-8 w-8 text-primary" />
                                Partner Profile
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Manage your account and shop settings
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {/* Account Info Card */}
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-foreground">
                                        <Shield className="h-5 w-5 text-info" />
                                        Account Information
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">Your login credentials and role status</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label className="text-foreground">Email Address</Label>
                                            <div className="flex items-center mt-1 p-2 bg-muted rounded-md text-foreground">
                                                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {profile?.email || user?.email}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-foreground">Account Role</Label>
                                            <div className="flex items-center mt-1 p-2 bg-muted rounded-md text-foreground capitalize">
                                                <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {profile?.role || user?.role}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shop Details Form */}
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-foreground">
                                        <Store className="h-5 w-5 text-primary" />
                                        Shop Details
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">Information visible to stylists when they view your products</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="flex justify-center mb-6">
                                            <div className="w-32">
                                                <Label className="mb-2 block text-center text-foreground">Shop Logo / Photo</Label>
                                                <div className="flex flex-col items-center gap-2">
                                                    {profilePhoto && (
                                                        <img
                                                            src={profilePhoto}
                                                            alt="Profile"
                                                            className="w-24 h-24 rounded-full object-cover border-2 border-border"
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

                                        <div>
                                            <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
                                                <Store className="h-4 w-4" />
                                                Shop Name
                                            </Label>
                                            <Input
                                                {...register('name')}
                                                id="name"
                                                placeholder="Enter your shop name"
                                                className="mt-1"
                                            />
                                            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                This will be displayed as your shop's name
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="location" className="flex items-center gap-2 text-foreground">
                                                <MapPin className="h-4 w-4" />
                                                Location / Address
                                            </Label>
                                            <Input
                                                {...register('location')}
                                                id="location"
                                                placeholder="Enter your shop address"
                                                className="mt-1"
                                            />
                                            {errors.location && <p className="text-destructive text-sm mt-1">{errors.location.message}</p>}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Stylists will see this location when viewing your products
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="phone" className="flex items-center gap-2 text-foreground">
                                                <Phone className="h-4 w-4" />
                                                Phone Number
                                            </Label>
                                            <Input
                                                {...register('phone')}
                                                id="phone"
                                                placeholder="Enter your contact number"
                                                className="mt-1"
                                            />
                                            {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Contact number for customer inquiries
                                            </p>
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || isUploadingPhoto}
                                                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                                            >
                                                {isSubmitting || isUploadingPhoto ? (
                                                    <>
                                                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                                                        {isUploadingPhoto ? 'Uploading Photo...' : 'Saving...'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
