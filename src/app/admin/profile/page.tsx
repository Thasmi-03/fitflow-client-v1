'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboardSidebar } from '@/components/layout/AdminDashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Shield, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import { UserProfile } from '@/types/user';
import ImageUploader from '@/components/ImageUploader';

export default function AdminProfilePage() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        profilePhoto: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await userService.getMyProfile();
            // Handle response structure: { success: true, user: { ... } } or just user object depending on backend
            // Based on authService.getCurrentUser, it returns response.data
            // Assuming backend returns { success: true, user: ... } or just user
            const data = response.user || response;

            setProfile(data);
            setFormData({
                name: data.name || '',
                profilePhoto: data.profilePhoto || ''
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await userService.updateMyProfile(formData);
            toast.success('Profile updated successfully!');
            await refreshUser(); // Update context
            loadProfile(); // Reload local state
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['admin']}>
                <div className="flex min-h-screen bg-gray-50">
                    <AdminDashboardSidebar />
                    <main className="flex-1 p-8 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
                            <p className="text-gray-600">Loading profile...</p>
                        </div>
                    </main>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex min-h-screen bg-gray-50">
                <AdminDashboardSidebar />

                <main className="flex-1 p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <User className="h-8 w-8 text-gray-900" />
                                Admin Profile
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manage your admin account settings
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {/* Account Info Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        Account Information
                                    </CardTitle>
                                    <CardDescription>Your login credentials and role status</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label>Email Address</Label>
                                            <div className="flex items-center mt-1 p-2 bg-gray-100 rounded-md text-gray-700">
                                                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                                {profile?.email || user?.email}
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Account Role</Label>
                                            <div className="flex items-center mt-1 p-2 bg-gray-100 rounded-md text-gray-700 capitalize">
                                                <Shield className="h-4 w-4 mr-2 text-gray-500" />
                                                {profile?.role || user?.role}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Personal Details Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-gray-900" />
                                        Personal Details
                                    </CardTitle>
                                    <CardDescription>Update your profile information</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSave} className="space-y-4">
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
                                                            setFormData({ ...formData, profilePhoto: url });
                                                            setIsUploadingPhoto(false);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your full name"
                                                className="mt-1"
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                disabled={saving || isUploadingPhoto}
                                                className="w-full md:w-auto"
                                            >
                                                {saving || isUploadingPhoto ? (
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
