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
import { getMyProfile, updateMyProfile, UserProfile } from '@/lib/api/user';
import ImageUploader from '@/components/ImageUploader';

export default function PartnerProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const [shopDetails, setShopDetails] = useState({
        name: '',
        phone: '',
        location: '',
        profilePhoto: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await getMyProfile();
            setProfile(data);
            setShopDetails({
                name: data.name || '',
                phone: data.phone || '',
                location: data.location || '',
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
            await updateMyProfile(shopDetails);
            toast.success('Profile updated successfully!');
            loadProfile(); // Reload to get updated data
            window.location.reload(); // Force reload to update sidebar
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShopDetails({
            ...shopDetails,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['partner']}>
                <div className="flex min-h-screen bg-gray-50">
                    <DashboardSidebar role="partner" />
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
        <ProtectedRoute allowedRoles={['partner']}>
            <div className="flex min-h-screen bg-gray-50">
                <DashboardSidebar role="partner" />

                <main className="flex-1 p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <User className="h-8 w-8 text-[#e2c2b7]" />
                                Partner Profile
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manage your account and shop settings
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

                            {/* Shop Details Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Store className="h-5 w-5 text-[#e2c2b7]" />
                                        Shop Details
                                    </CardTitle>
                                    <CardDescription>Information visible to stylists when they view your products</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSave} className="space-y-4">
                                        <div className="flex justify-center mb-6">
                                            <div className="w-32">
                                                <Label className="mb-2 block text-center">Shop Logo / Photo</Label>
                                                <div className="flex flex-col items-center gap-2">
                                                    {shopDetails.profilePhoto && (
                                                        <img
                                                            src={shopDetails.profilePhoto}
                                                            alt="Profile"
                                                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                                        />
                                                    )}
                                                    <ImageUploader
                                                        useCloudinaryDirect={true}
                                                        onUploadComplete={(url) => setShopDetails({ ...shopDetails, profilePhoto: url })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="name" className="flex items-center gap-2">
                                                <Store className="h-4 w-4" />
                                                Shop Name
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={shopDetails.name}
                                                onChange={handleChange}
                                                placeholder="Enter your shop name"
                                                className="mt-1"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                This will be displayed as your shop's name
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="location" className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Location / Address
                                            </Label>
                                            <Input
                                                id="location"
                                                name="location"
                                                value={shopDetails.location}
                                                onChange={handleChange}
                                                placeholder="Enter your shop address"
                                                className="mt-1"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Stylists will see this location when viewing your products
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="phone" className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={shopDetails.phone}
                                                onChange={handleChange}
                                                placeholder="Enter your contact number"
                                                className="mt-1"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Contact number for customer inquiries
                                            </p>
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                disabled={saving}
                                                className="w-full md:w-auto bg-[#e2c2b7] hover:bg-[#d4b5a8] text-gray-900"
                                            >
                                                {saving ? (
                                                    <>
                                                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                                                        Saving...
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
