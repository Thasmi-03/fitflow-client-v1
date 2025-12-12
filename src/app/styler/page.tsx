'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Sparkles, Shirt, Plus, ArrowRight, Heart, Store, Calendar, Settings as SettingsIcon, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { clothesService } from '@/services/clothes.service';
import { partnerService } from '@/services/partner.service';
import { userService } from '@/services/user.service';
import { occasionsService } from '@/services/occasions.service';
import { aiService } from '@/services/ai.service';
import { Clothes } from '@/types/clothes';
import { SmartSuggestion } from '@/types/partner';
import { Occasion } from '@/types/occasions';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AddClothesModal } from '@/components/modals/AddClothesModal';
import ImageUploader from '@/components/ImageUploader';
import { toast } from 'sonner';

export default function StylerDashboard() {
    const router = useRouter();
    const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
    const [myClothes, setMyClothes] = useState<Clothes[]>([]);
    const [occasions, setOccasions] = useState<Occasion[]>([]);
    const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [occasionsCount, setOccasionsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalClothesCount, setTotalClothesCount] = useState(0);
    const [addClothesModalOpen, setAddClothesModalOpen] = useState(false);

    // AI Picks state
    const [uploadedPhoto, setUploadedPhoto] = useState<string>('');
    const [detectedSkinTone, setDetectedSkinTone] = useState<string>('');
    const [detectingTone, setDetectingTone] = useState(false);
    const [aiPicksLoading, setAiPicksLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load user's own clothes
            const myClothesRes = await clothesService.getAll({ limit: 4 });
            setMyClothes(myClothesRes.clothes);
            setTotalClothesCount(myClothesRes.total);

            // Load occasions
            try {
                const occasionsRes = await occasionsService.getAll();
                setOccasions(occasionsRes.data.slice(0, 3)); // Show only 3 most recent
                setOccasionsCount(occasionsRes.data.length);
            } catch (occasionError) {
                console.warn('Could not load occasions:', occasionError);
            }

            // Load favorites count
            const favoritesRes = await userService.getFavorites().catch(() => ({ favorites: [] }));
            setFavoriteCount(favoritesRes.favorites.length);

            // Load user profile to check for detected skin tone
            try {
                const profileRes = await userService.getProfile();
                if (profileRes.skinTone) {
                    setDetectedSkinTone(profileRes.skinTone);
                    // Load AI picks based on detected skin tone
                    loadAIPicks(profileRes.skinTone);
                }
            } catch (profileError) {
                console.warn('Could not load profile:', profileError);
            }

            // Load marketplace items (partner clothes)
            try {
                const marketplaceRes = await partnerService.getPublicClothes();
                setMarketplaceItems(marketplaceRes.data?.slice(0, 6) || []);
            } catch (marketplaceError) {
                console.warn('Could not load marketplace items:', marketplaceError);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAIPicks = async (skinTone: string) => {
        try {
            setAiPicksLoading(true);
            const suggestionsRes = await partnerService.getSmartSuggestions({
                limit: 6,
                skinTone: skinTone
            });
            setSmartSuggestions(suggestionsRes.data || []);
        } catch (error) {
            console.warn('Could not load AI picks:', error);
        } finally {
            setAiPicksLoading(false);
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

            // Load AI picks based on detected skin tone
            loadAIPicks(data.skinTone);
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

    const handleAddClothesSuccess = () => {
        // Reload clothes data
        loadData();
    };

    return (
        <ProtectedRoute allowedRoles={['styler']}>
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar role="styler" />

                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Styler Dashboard</h1>
                                    <p className="mt-2 text-muted-foreground">
                                        Your personalized fashion assistant
                                    </p>
                                </div>
                                <Link href="/styler/profile">
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <SettingsIcon className="h-4 w-4" />
                                        Settings
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-3 mb-6">
                            <Card className="bg-card border-border">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        My Clothes
                                    </CardTitle>
                                    <Package className="h-5 w-5 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-foreground">{totalClothesCount}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Items in wardrobe</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        My Occasions
                                    </CardTitle>
                                    <Calendar className="h-5 w-5 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-foreground">{occasionsCount}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Upcoming events</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Favorites
                                    </CardTitle>
                                    <Heart className="h-5 w-5 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-foreground">{favoriteCount}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Saved items</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* AI Picks Section */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        AI Picks
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {detectedSkinTone
                                            ? `Personalized suggestions for ${detectedSkinTone} skin tone`
                                            : 'Upload your photo to get personalized suggestions'}
                                    </p>
                                </div>
                                <Link href="/styler/suggestions">
                                    <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-muted">
                                        View All <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Photo Upload for Skin Tone Detection */}
                            {!detectedSkinTone && (
                                <Card className="mb-6 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-primary/20">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            {uploadedPhoto ? (
                                                <div className="relative">
                                                    <img
                                                        src={uploadedPhoto}
                                                        alt="Uploaded"
                                                        className="w-32 h-32 object-cover rounded-lg border-2 border-primary"
                                                    />
                                                </div>
                                            ) : (
                                                <ImageUploader
                                                    useCloudinaryDirect={true}
                                                    autoUpload={true}
                                                    onUploadComplete={handlePhotoUpload}
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground mb-2">Upload Your Photo</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Upload a clear photo to automatically detect your skin tone and get personalized clothing suggestions
                                                </p>
                                                {detectingTone && (
                                                    <p className="text-sm text-primary mt-2 flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Analyzing skin tone...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* AI Picks Grid */}
                            {aiPicksLoading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                    <p className="mt-4 text-muted-foreground">Loading AI picks...</p>
                                </div>
                            ) : smartSuggestions.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-3">
                                    {smartSuggestions.slice(0, 6).map((item: SmartSuggestion) => (
                                        <Card key={item._id} className="overflow-hidden hover:bg-muted/50 transition-colors duration-300 bg-card border-border">
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
                                                <h3 className="font-semibold text-foreground">{item.name}</h3>
                                                <p className="text-sm text-muted-foreground capitalize">{item.category} • {item.color}</p>
                                                {item.occasion && (
                                                    <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                                                        {item.occasion}
                                                    </span>
                                                )}
                                                <p className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" />
                                                    {item.matchReason}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : detectedSkinTone ? (
                                <Card className="p-8 text-center bg-muted/50 border-dashed border-border">
                                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-foreground">No AI picks available yet</h3>
                                    <p className="text-muted-foreground">Check back later for personalized suggestions</p>
                                </Card>
                            ) : null}
                        </div>

                        {/* My Clothes Section */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" />
                                    My Clothes
                                </h2>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setAddClothesModalOpen(true)}
                                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Clothes
                                    </Button>
                                    <Link href="/styler/clothes">
                                        <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-muted">
                                            View All <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                    <p className="mt-4 text-muted-foreground">Loading wardrobe...</p>
                                </div>
                            ) : myClothes.length === 0 ? (
                                <Card className="p-8 text-center bg-muted/50 border-dashed border-border">
                                    <div className="flex flex-col items-center justify-center">
                                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium text-foreground">Your wardrobe is empty</h3>
                                        <p className="text-muted-foreground mb-4">Start adding clothes to get personalized suggestions</p>
                                        <Button
                                            onClick={() => setAddClothesModalOpen(true)}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                        >
                                            Add First Item
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-4">
                                    {myClothes.slice(0, 4).map((item) => (
                                        <Card key={item._id || item.id} className="overflow-hidden hover:bg-muted/50 transition-colors duration-300 bg-card border-border">
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
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                                                <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* My Occasions Section */}
                        {occasions.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        My Occasions
                                    </h2>
                                    <Link href="/styler/occasions">
                                        <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-muted">
                                            View All <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {occasions.map((occasion) => (
                                        <Card key={occasion._id} className="overflow-hidden hover:bg-muted/50 transition-colors bg-card border-border">
                                            <CardHeader className="bg-muted/30">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-foreground">{occasion.title}</CardTitle>
                                                        <CardDescription className="text-muted-foreground mt-1">
                                                            {new Date(occasion.date).toLocaleDateString()}
                                                        </CardDescription>
                                                    </div>
                                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
                                                        {occasion.type}
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4">
                                                {occasion.location && (
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        <span className="font-medium text-foreground">Location:</span> {occasion.location}
                                                    </p>
                                                )}
                                                <Link href="/styler/occasions">
                                                    <Button variant="outline" size="sm" className="w-full mt-2">
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                        View Suggestions
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Marketplace Section */}
                        {marketplaceItems.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                            <Store className="h-5 w-5 text-primary" />
                                            Marketplace
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Discover clothes from partner shops
                                        </p>
                                    </div>
                                    <Link href="/styler/suggestions">
                                        <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-muted">
                                            Browse All <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {marketplaceItems.slice(0, 6).map((item) => (
                                        <Card key={item._id} className="overflow-hidden hover:bg-muted/50 transition-colors duration-300 bg-card border-border">
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
                                                <h3 className="font-semibold text-foreground">{item.name}</h3>
                                                <p className="text-sm text-muted-foreground capitalize">{item.category} • {item.color}</p>
                                                {typeof item.ownerId === 'object' && item.ownerId !== null && item.ownerId.name && (
                                                    <div className="mt-3 pt-3 border-t border-border">
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Store className="h-3 w-3" />
                                                            {item.ownerId.name}
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Add Clothes Modal */}
            <AddClothesModal
                open={addClothesModalOpen}
                onOpenChange={setAddClothesModalOpen}
                onSuccess={handleAddClothesSuccess}
            />
        </ProtectedRoute>
    );
}