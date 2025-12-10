'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Upload, Loader2, Palette, ShoppingBag, Shirt } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { aiService } from '@/services/ai.service';
import { partnerService } from '@/services/partner.service';
import { userService } from '@/services/user.service';
import ImageUploader from '@/components/ImageUploader';
import { toast } from 'sonner';

// Color recommendations for each skin tone
const SKIN_TONE_COLORS: Record<string, { name: string; hex: string; description: string }[]> = {
    fair: [
        { name: 'Soft Pink', hex: '#FFB6C1', description: 'Complements fair skin beautifully' },
        { name: 'Light Blue', hex: '#ADD8E6', description: 'Creates a fresh, clean look' },
        { name: 'Lavender', hex: '#E6E6FA', description: 'Soft and elegant' },
        { name: 'Mint Green', hex: '#98FF98', description: 'Light and refreshing' },
        { name: 'Peach', hex: '#FFDAB9', description: 'Warm and flattering' },
        { name: 'Coral', hex: '#FF7F50', description: 'Vibrant and cheerful' },
    ],
    light: [
        { name: 'Rose', hex: '#FF69B4', description: 'Adds warmth and glow' },
        { name: 'Sky Blue', hex: '#87CEEB', description: 'Fresh and bright' },
        { name: 'Lilac', hex: '#C8A2C8', description: 'Soft and sophisticated' },
        { name: 'Aqua', hex: '#00FFFF', description: 'Cool and vibrant' },
        { name: 'Cream', hex: '#FFFDD0', description: 'Classic and elegant' },
        { name: 'Salmon', hex: '#FA8072', description: 'Warm and flattering' },
    ],
    medium: [
        { name: 'Emerald', hex: '#50C878', description: 'Rich and vibrant' },
        { name: 'Royal Blue', hex: '#4169E1', description: 'Bold and striking' },
        { name: 'Burgundy', hex: '#800020', description: 'Deep and elegant' },
        { name: 'Teal', hex: '#008080', description: 'Sophisticated and modern' },
        { name: 'Mustard', hex: '#FFDB58', description: 'Warm and earthy' },
        { name: 'Plum', hex: '#8E4585', description: 'Rich and luxurious' },
    ],
    tan: [
        { name: 'Olive', hex: '#808000', description: 'Earthy and natural' },
        { name: 'Burnt Orange', hex: '#CC5500', description: 'Warm and bold' },
        { name: 'Deep Purple', hex: '#9B30FF', description: 'Rich and regal' },
        { name: 'Forest Green', hex: '#228B22', description: 'Deep and natural' },
        { name: 'Terracotta', hex: '#E2725B', description: 'Warm and earthy' },
        { name: 'Navy', hex: '#000080', description: 'Classic and versatile' },
    ],
    deep: [
        { name: 'Gold', hex: '#FFD700', description: 'Luxurious and radiant' },
        { name: 'Crimson', hex: '#DC143C', description: 'Bold and powerful' },
        { name: 'Cobalt Blue', hex: '#0047AB', description: 'Vibrant and striking' },
        { name: 'Magenta', hex: '#FF00FF', description: 'Bold and energetic' },
        { name: 'Amber', hex: '#FFBF00', description: 'Warm and glowing' },
        { name: 'Turquoise', hex: '#40E0D0', description: 'Bright and fresh' },
    ],
    dark: [
        { name: 'Bright Yellow', hex: '#FFFF00', description: 'Radiant and eye-catching' },
        { name: 'Hot Pink', hex: '#FF1493', description: 'Bold and vibrant' },
        { name: 'Electric Blue', hex: '#7DF9FF', description: 'Striking and modern' },
        { name: 'Lime Green', hex: '#32CD32', description: 'Fresh and energetic' },
        { name: 'Orange', hex: '#FFA500', description: 'Warm and vibrant' },
        { name: 'White', hex: '#FFFFFF', description: 'Clean and elegant' },
    ],
};

export default function AIPickPage() {
    const [uploadedPhoto, setUploadedPhoto] = useState<string>('');
    const [detectedSkinTone, setDetectedSkinTone] = useState<string>('');
    const [detectingTone, setDetectingTone] = useState(false);
    const [suggestedClothes, setSuggestedClothes] = useState<any[]>([]);
    const [loadingClothes, setLoadingClothes] = useState(false);

    useEffect(() => {
        // Load user profile to check if skin tone is already detected
        loadUserProfile();
    }, []);

    useEffect(() => {
        // Load suggested clothes when skin tone is detected
        if (detectedSkinTone) {
            loadSuggestedClothes();
        }
    }, [detectedSkinTone]);

    const loadUserProfile = async () => {
        try {
            const profileRes = await userService.getProfile();
            if (profileRes.skinTone) {
                setDetectedSkinTone(profileRes.skinTone);
            }
        } catch (error) {
            console.warn('Could not load profile:', error);
        }
    };

    const handlePhotoUpload = async (url: string) => {
        setUploadedPhoto(url);
        setDetectingTone(true);

        try {
            const data = await aiService.detectSkinTone(url);
            setDetectedSkinTone(data.skinTone);
            toast.success(`Skin tone detected: ${data.skinTone}`, {
                duration: 3000,
            });
        } catch (error: any) {
            console.error('Error detecting skin tone:', error);
            const errorMessage = error.message || 'Failed to detect skin tone. Please try another photo.';
            toast.error(errorMessage, {
                duration: Infinity,
                closeButton: true,
            });
        } finally {
            setDetectingTone(false);
        }
    };

    const loadSuggestedClothes = async () => {
        try {
            setLoadingClothes(true);
            const response = await partnerService.getSmartSuggestions({
                limit: 6,
                skinTone: detectedSkinTone
            });
            setSuggestedClothes(response.data || []);
        } catch (error) {
            console.error('Error loading suggested clothes:', error);
            toast.error('Failed to load clothing suggestions', {
                duration: Infinity,
                closeButton: true,
            });
        } finally {
            setLoadingClothes(false);
        }
    };

    const recommendedColors = detectedSkinTone ? SKIN_TONE_COLORS[detectedSkinTone] || [] : [];

    return (
        <ProtectedRoute allowedRoles={['styler']}>
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar role="styler" />

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-8 w-8 text-primary" />
                                <h1 className="text-3xl font-bold text-foreground">AI Pick</h1>
                            </div>
                            <p className="text-muted-foreground">
                                Upload your photo to get personalized color and clothing suggestions
                            </p>
                        </div>

                        {/* Photo Upload Section */}
                        {!detectedSkinTone && (
                            <Card className="mb-8 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-primary/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Upload className="h-5 w-5" />
                                        Upload Your Photo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col md:flex-row items-start gap-6">
                                        {uploadedPhoto ? (
                                            <div className="relative">
                                                <img
                                                    src={uploadedPhoto}
                                                    alt="Uploaded"
                                                    className="w-48 h-48 object-cover rounded-lg border-2 border-primary"
                                                />
                                                {detectingTone && (
                                                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <ImageUploader
                                                useCloudinaryDirect={true}
                                                autoUpload={true}
                                                onUploadComplete={handlePhotoUpload}
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground mb-2">How it works:</h3>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary font-bold">1.</span>
                                                    Upload a clear photo showing your face and skin
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary font-bold">2.</span>
                                                    Our AI will analyze and detect your skin tone
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary font-bold">3.</span>
                                                    Get personalized color recommendations
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary font-bold">4.</span>
                                                    Discover clothing that complements your skin tone
                                                </li>
                                            </ul>
                                            {detectingTone && (
                                                <p className="text-sm text-primary mt-4 flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Analyzing your skin tone...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Detected Skin Tone */}
                        {detectedSkinTone && (
                            <>
                                <Card className="mb-8 bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-primary" />
                                            Your Detected Skin Tone
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            {uploadedPhoto && (
                                                <img
                                                    src={uploadedPhoto}
                                                    alt="Your photo"
                                                    className="w-24 h-24 object-cover rounded-lg border-2 border-primary"
                                                />
                                            )}
                                            <div>
                                                <p className="text-3xl font-bold text-primary capitalize mb-2">
                                                    {detectedSkinTone}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Based on this, we've curated the perfect colors and clothing for you
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-3"
                                                    onClick={() => {
                                                        setDetectedSkinTone('');
                                                        setUploadedPhoto('');
                                                        setSuggestedClothes([]);
                                                    }}
                                                >
                                                    Upload New Photo
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Color Recommendations */}
                                <Card className="mb-8 bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Palette className="h-5 w-5 text-primary" />
                                            Recommended Colors for You
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {recommendedColors.map((color, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                                >
                                                    <div
                                                        className="w-12 h-12 rounded-full border-2 border-border shadow-sm flex-shrink-0"
                                                        style={{ backgroundColor: color.hex }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-foreground">{color.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {color.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Suggested Clothes */}
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <ShoppingBag className="h-5 w-5 text-primary" />
                                                Clothing Suggestions
                                            </CardTitle>
                                            <Link href="/styler/suggestions">
                                                <Button variant="ghost" size="sm" className="text-primary">
                                                    View All
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {loadingClothes ? (
                                            <div className="text-center py-12">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                                                <p className="text-muted-foreground">Loading suggestions...</p>
                                            </div>
                                        ) : suggestedClothes.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Shirt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                <p className="text-muted-foreground mb-4">
                                                    No clothing suggestions available yet
                                                </p>
                                                <Link href="/styler/suggestions">
                                                    <Button variant="outline">
                                                        Browse Marketplace
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {suggestedClothes.map((item) => (
                                                    <Link
                                                        key={item._id}
                                                        href={`/styler/suggestions/${item._id}`}
                                                        className="block"
                                                    >
                                                        <Card className="overflow-hidden hover:bg-muted/50 transition-colors duration-300 h-full border-border">
                                                            <div className="h-48 bg-muted relative">
                                                                {item.image ? (
                                                                    <img
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Shirt className="h-12 w-12 text-muted-foreground/30" />
                                                                    </div>
                                                                )}
                                                                {item.price && (
                                                                    <div className="absolute top-2 right-2 bg-card px-2 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                                                                        Rs. {item.price}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <CardContent className="p-4">
                                                                <h3 className="font-semibold text-foreground mb-1">
                                                                    {item.name}
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground capitalize">
                                                                    {item.category} • {item.color}
                                                                </p>
                                                                {item.matchReason && (
                                                                    <p className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
                                                                        <Sparkles className="h-3 w-3" />
                                                                        {item.matchReason}
                                                                    </p>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
