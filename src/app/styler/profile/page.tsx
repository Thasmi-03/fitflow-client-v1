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

const skinTones: SkinTone[] = ['fair', 'light', 'medium', 'tan', 'deep', 'dark'];

export default function ProfileSettingsPage() {
    const { user, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        skinTone: (user?.skinTone as SkinTone) || 'medium',
        preferredStyle: user?.preferredStyle || '',
        profilePhoto: user?.profilePhoto || '',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                skinTone: (user.skinTone as SkinTone) || prev.skinTone,
                preferredStyle: user.preferredStyle || prev.preferredStyle,
                profilePhoto: user.profilePhoto || prev.profilePhoto,
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await userService.updateMyProfile({
                name: formData.name,
                // email cannot be updated directly usually
                profilePhoto: formData.profilePhoto,
                skinTone: formData.skinTone,
                preferredStyle: formData.preferredStyle,
            });

            toast.success('Profile updated successfully!');
            setIsEditing(false);
            await refreshUser();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
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
                                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                                        useCloudinaryDirect={false}
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

                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Your name"
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="your.email@example.com"
                                                    className="mt-1"
                                                    disabled
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="skinTone">Skin Tone</Label>
                                                <Select
                                                    value={formData.skinTone}
                                                    onValueChange={(value) => handleSelectChange('skinTone', value)}
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
                                            </div>

                                            <div>
                                                <Label htmlFor="preferredStyle">Preferred Style</Label>
                                                <Input
                                                    id="preferredStyle"
                                                    name="preferredStyle"
                                                    value={formData.preferredStyle}
                                                    onChange={handleChange}
                                                    placeholder="e.g., Casual, Formal, Bohemian"
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <Button type="submit" disabled={loading || isUploadingPhoto} className="flex-1">
                                                {loading || isUploadingPhoto ? (isUploadingPhoto ? 'Uploading Photo...' : 'Saving...') : 'Save Changes'}
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
                                                <p className="font-medium">{formData.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                            <Settings className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Skin Tone</p>
                                                <p className="font-medium capitalize">{formData.skinTone}</p>
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

                        {/* Account Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="p-4 bg-gradient-to-br from-[#e2c2b7] to-[#d4b5a8] rounded-lg text-center">
                                        <p className="text-2xl font-bold text-gray-900">0</p>
                                        <p className="text-sm text-gray-700">Wardrobe Items</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-gray-900">0</p>
                                        <p className="text-sm text-gray-700">Outfit Combinations</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-gray-900">0</p>
                                        <p className="text-sm text-gray-700">Suggestions Viewed</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
