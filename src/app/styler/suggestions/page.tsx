'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Filter, Heart, ArrowRight, Package, Search } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { partnerService } from '@/services/partner.service';
import { userService } from '@/services/user.service';
import { aiService } from '@/services/ai.service';
import { PartnerClothes } from '@/types/partner';
import { toast } from 'sonner';
import { SkinTone } from '@/types/clothes';
import ImageUploader from '@/components/ImageUploader';

const skinTones: string[] = ['fair', 'light', 'medium', 'tan', 'deep', 'dark', 'reddish', 'olive', 'pale'];

import { useRouter } from 'next/navigation';

export default function SuggestionsPage() {
    const router = useRouter();
    const [clothes, setClothes] = useState<PartnerClothes[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterColor, setFilterColor] = useState('all');
    const [filterBrand, setFilterBrand] = useState('all');
    const [favorites, setFavorites] = useState<string[]>([]);

    // AI State
    const [uploadedPhoto, setUploadedPhoto] = useState<string>('');
    const [selectedSkinTone, setSelectedSkinTone] = useState<string>('');
    const [aiLoading, setAiLoading] = useState(false);
    const [detectingTone, setDetectingTone] = useState(false);
    const [aiAdvice, setAiAdvice] = useState<string>('');
    const [suggestedColors, setSuggestedColors] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [clothesRes, profileRes] = await Promise.all([
                partnerService.getPublicClothes(),
                userService.getProfile().catch(() => ({ favorites: [] }))
            ]);
            setClothes(clothesRes.data || []);
            if (profileRes.favorites) {
                setFavorites(profileRes.favorites);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load dress suggestions', {
                duration: Infinity,
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (url: string) => {
        setUploadedPhoto(url);
        setDetectingTone(true);

        try {
            const data = await aiService.detectSkinTone(url);
            setSelectedSkinTone(data.skinTone);
            toast.success(`Skin tone detected: ${data.skinTone} (${data.confidence} confidence)`, {
                duration: 3000,
            });
        } catch (error) {
            console.error('Error detecting skin tone:', error);
            toast.error('Failed to detect skin tone. Please try another photo.', {
                duration: Infinity,
                closeButton: true,
            });
        } finally {
            setDetectingTone(false);
        }
    };

    const handleFavorite = async (e: React.MouseEvent, clothId: string) => {
        e.stopPropagation(); // Prevent card click
        try {
            const res = await userService.toggleFavorite(clothId);
            setFavorites(res.favorites);
            toast.success(res.isFavorite ? 'Added to favorites' : 'Removed from favorites', {
                duration: 3000,
            });
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error('Failed to update favorites', {
                duration: Infinity,
                closeButton: true,
            });
        }
    };

    const handleGetAiSuggestions = async () => {
        if (!selectedSkinTone) {
            toast.error('Please select a skin tone');
            return;
        }

        try {
            setAiLoading(true);
            const data = await aiService.getSuggestions(selectedSkinTone);
            setAiAdvice(data.advice);
            setSuggestedColors(data.recommendedColors || []);
            toast.success('AI Suggestions generated!');
        } catch (error) {
            console.error('Error getting AI suggestions:', error);
            toast.error('Failed to get AI suggestions');
        } finally {
            setAiLoading(false);
        }
    };

    const clearAiSuggestions = () => {
        setAiAdvice('');
        setSuggestedColors([]);
        setSelectedSkinTone('');
    };

    const handleViewDetails = (clothId: string) => {
        // Navigate to details page
        router.push(`/styler/suggestions/${clothId}`);
    };

    // Filter and search logic
    const filteredClothes = useMemo(() => {
        return clothes.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.color.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
            const matchesColor = filterColor === 'all' || item.color === filterColor;
            const matchesBrand = filterBrand === 'all' || item.brand === filterBrand;

            // AI Color Matching
            const matchesAiColor = suggestedColors.length === 0 || suggestedColors.some(sc =>
                item.color.toLowerCase().includes(sc.toLowerCase()) ||
                sc.toLowerCase().includes(item.color.toLowerCase())
            );

            return matchesSearch && matchesCategory && matchesColor && matchesBrand && matchesAiColor;
        });
    }, [clothes, searchTerm, filterCategory, filterColor, filterBrand]);

    // Get unique values for filters
    const categories = useMemo(() => Array.from(new Set(clothes.map(c => c.category).filter(Boolean))), [clothes]);
    const colors = useMemo(() => Array.from(new Set(clothes.map(c => c.color).filter(Boolean))), [clothes]);
    const brands = useMemo(() => Array.from(new Set(clothes.map(c => c.brand).filter(Boolean))), [clothes]);

    // Stats calculations based on REAL data
    const totalSuggestions = filteredClothes.length;
    const partnerShopsCount = new Set(clothes.map(c => (c.ownerId && typeof c.ownerId === 'object') ? c.ownerId._id : c.ownerId).filter(Boolean)).size;
    const categoriesCount = new Set(clothes.map(c => c.category)).size;

    return (
        <ProtectedRoute allowedRoles={['styler']}>
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar role="styler" />

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <Sparkles className="h-8 w-8 text-primary" />
                                Dress Suggestions
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Curated dresses from our partner shops
                            </p>
                        </div>

                        {/* AI Suggestions Section */}
                        <Card className="mb-8 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    <Sparkles className="h-5 w-5" />
                                    AI Stylist
                                </CardTitle>
                                <CardDescription>
                                    Get personalized dress color recommendations based on your skin tone
                                    {selectedSkinTone && (
                                        <span className="block mt-2 text-sm font-medium text-primary">
                                            Currently using: {selectedSkinTone.charAt(0).toUpperCase() + selectedSkinTone.slice(1)}
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Photo Upload Section */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Upload Your Photo</label>
                                        <div className="flex items-start gap-4">
                                            {uploadedPhoto ? (
                                                <div className="relative">
                                                    <img
                                                        src={uploadedPhoto}
                                                        alt="Uploaded"
                                                        className="w-32 h-32 object-cover rounded-lg border-2 border-primary"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            setUploadedPhoto('');
                                                            setSelectedSkinTone('');
                                                            setAiAdvice('');
                                                            setSuggestedColors([]);
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <ImageUploader
                                                    useCloudinaryDirect={true}
                                                    autoUpload={true}
                                                    onUploadComplete={handlePhotoUpload}
                                                />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Upload a clear photo of yourself to automatically detect your skin tone
                                                </p>
                                                {detectingTone && (
                                                    <p className="text-sm text-primary mt-2 flex items-center gap-2">
                                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent inline-block" />
                                                        Analyzing skin tone...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detected/Selected Skin Tone Display */}
                                    {selectedSkinTone && (
                                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                            <p className="text-sm font-medium mb-1">Detected Skin Tone:</p>
                                            <p className="text-lg font-bold text-primary capitalize">{selectedSkinTone}</p>
                                        </div>
                                    )}

                                    {/* Get Suggestions Button */}
                                    <Button
                                        onClick={handleGetAiSuggestions}
                                        disabled={aiLoading || !selectedSkinTone || detectingTone}
                                        className="w-full bg-primary text-primary-foreground"
                                        size="lg"
                                    >
                                        {aiLoading ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent mr-2" />
                                                Generating Suggestions...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-5 w-5 mr-2" />
                                                Get Dress Suggestions
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {aiAdvice && (
                                    <div className="mt-6 p-4 bg-background/50 rounded-lg border border-border animate-in fade-in slide-in-from-top-2">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                            AI Recommendation
                                        </h4>
                                        <p className="text-muted-foreground mb-4">{aiAdvice}</p>

                                        {suggestedColors.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium mb-2">Recommended Colors:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {suggestedColors.map((color, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                                        >
                                                            {color}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Search and Filters */}
                        <Card className="mb-6 bg-card border-border">
                            <CardContent className="pt-6">
                                <div className="grid gap-4 md:grid-cols-4">
                                    {/* Search */}
                                    <div className="md:col-span-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search dresses..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Category Filter */}
                                    <div>
                                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Color Filter */}
                                    <div>
                                        <Select value={filterColor} onValueChange={setFilterColor}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Color" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Colors</SelectItem>
                                                {colors.map((color) => (
                                                    <SelectItem key={color} value={color}>
                                                        {color.charAt(0).toUpperCase() + color.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Brand Filter */}
                                    <div>
                                        <Select value={filterBrand} onValueChange={setFilterBrand}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Brand" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Brands</SelectItem>
                                                {brands.filter(b => b.toLowerCase() !== 'all').map((brand) => (
                                                    <SelectItem key={brand} value={brand}>
                                                        {brand}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats */}
                        <div className="grid gap-6 md:grid-cols-3 mb-8">
                            <Card className="bg-card border-border">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Suggestions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{totalSuggestions}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Available for you</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Partner Shops
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">
                                        {partnerShopsCount}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Contributing partners</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Categories
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">
                                        {categoriesCount}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Different styles</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Suggestions Grid */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                <p className="mt-4 text-muted-foreground">Loading suggestions...</p>
                            </div>
                        ) : filteredClothes.length === 0 ? (
                            <Card className="p-12 bg-card border-border">
                                <div className="text-center">
                                    <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {clothes.length === 0 ? 'No Suggestions Available' : 'No matches found'}
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        {clothes.length === 0
                                            ? 'Check back later for new dress suggestions from our partner shops'
                                            : 'Try adjusting your filters or search terms'
                                        }
                                    </p>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredClothes.map((item) => {
                                    const itemId = (item._id || item.id) as string;
                                    const isFavorite = favorites.includes(itemId);

                                    return (
                                        <Card key={itemId} className="overflow-hidden hover:bg-muted/50 transition-all duration-300 group bg-card border-border">
                                            {/* Image Placeholder */}
                                            <div className="aspect-[3/4] bg-muted flex items-center justify-center relative overflow-hidden">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="h-24 w-24 text-muted-foreground opacity-30 group-hover:scale-110 transition-transform" />
                                                )}
                                                <div className="absolute top-3 right-3">
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        className={`rounded-full h-8 w-8 ${isFavorite ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-background/80 hover:bg-background'}`}
                                                        onClick={(e) => handleFavorite(e, itemId)}
                                                    >
                                                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                                                    </Button>
                                                </div>
                                            </div>

                                            <CardContent className="p-5">
                                                <div className="mb-3">
                                                    <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{item.category}</p>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Color:</span>
                                                        <span className="font-medium capitalize text-foreground">{item.color}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Brand:</span>
                                                        <span className="font-medium text-foreground">{item.brand}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Price:</span>
                                                        <span className="font-bold text-primary">Rs. {item.price.toFixed(2)}</span>
                                                    </div>
                                                    {typeof item.ownerId === 'object' && item.ownerId !== null && item.ownerId.location && (
                                                        <div className="pt-2 border-t border-border">
                                                            <div className="text-xs text-muted-foreground">
                                                                <div className="font-medium text-foreground">
                                                                    {item.ownerId.name || 'Partner Shop'}
                                                                </div>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                    {item.ownerId.location}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <Button
                                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                                    onClick={() => handleViewDetails(itemId)}
                                                >
                                                    View Details
                                                    <ArrowRight className="h-4 w-4 ml-2" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
