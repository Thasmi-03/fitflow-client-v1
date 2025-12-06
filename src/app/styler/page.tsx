'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Sparkles, Shirt, Plus, ArrowRight, Heart, Store } from 'lucide-react';
import Link from 'next/link';

import { clothesService } from '@/services/clothes.service';
import { partnerService } from '@/services/partner.service';
import { userService } from '@/services/user.service';
import { Clothes } from '@/types/clothes';
import { SmartSuggestion } from '@/types/partner';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StylerDashboard() {
    const router = useRouter();
    const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
    const [myClothes, setMyClothes] = useState<Clothes[]>([]);
    const [favoriteSuggestions, setFavoriteSuggestions] = useState<any[]>([]);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [suggestionFilters, setSuggestionFilters] = useState<{
        occasion: string | null;
        gender: string | undefined;
        skinTone: string | undefined;
        userOccasions: string[];
    } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const [totalClothesCount, setTotalClothesCount] = useState(0);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load user's own clothes
            const myClothesRes = await clothesService.getAll({ limit: 4 });
            setMyClothes(myClothesRes.clothes);
            setTotalClothesCount(myClothesRes.total);

            // Load smart suggestions from Partner clothes based on user's profile
            // This API filters by skin tone, gender, and occasion
            try {
                const suggestionsRes = await partnerService.getSmartSuggestions({ limit: 6 });
                setSmartSuggestions(suggestionsRes.data || []);
                setSuggestionFilters(suggestionsRes.meta?.filters || null);
                console.log('Smart Suggestions loaded:', suggestionsRes);
            } catch (suggestionError) {
                console.warn('Could not load smart suggestions:', suggestionError);
                setSmartSuggestions([]);
            }

            // Load favorites
            const favoritesRes = await userService.getFavorites().catch(() => ({ favorites: [] }));
            setFavoriteCount(favoritesRes.favorites.length);
            setFavoriteSuggestions(favoritesRes.favorites.slice(0, 3));
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['styler']}>
            <div className="flex min-h-screen bg-gray-50">
                <DashboardSidebar role="styler" />

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Styler Dashboard</h1>
                                    <p className="mt-2 text-gray-600">
                                        Manage your wardrobe and get personalized suggestions
                                    </p>
                                </div>
                                <Link href="/styler/clothes/add">
                                    <Button className="flex items-center gap-2 bg-[#e2c2b7] hover:bg-[#d4b5a8] text-gray-900">
                                        <Plus className="h-4 w-4" />
                                        Add New Clothes
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid gap-6 md:grid-cols-2 mb-8">
                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-purple-900">
                                        Total Clothes
                                    </CardTitle>
                                    <Package className="h-5 w-5 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-purple-900">{totalClothesCount}</div>
                                    <p className="text-xs text-purple-700 mt-1">Items in your wardrobe</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-pink-900">
                                        Favorites
                                    </CardTitle>
                                    <Heart className="h-5 w-5 text-pink-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-pink-900">{favoriteCount}</div>
                                    <p className="text-xs text-pink-700 mt-1">Saved items</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Smart Dress Suggestions - Based on your skin tone, gender, and occasions */}
                        {smartSuggestions.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-[#e2c2b7]" />
                                            Smart Suggestions
                                        </h2>
                                        {suggestionFilters && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Based on: {suggestionFilters.occasion && `${suggestionFilters.occasion} occasion`}
                                                {suggestionFilters.gender && ` • ${suggestionFilters.gender}`}
                                                {suggestionFilters.skinTone && ` • ${suggestionFilters.skinTone} skin tone`}
                                            </p>
                                        )}
                                    </div>
                                    <Link href="/styler/occasions">
                                        <Button variant="ghost" className="text-[#e2c2b7] hover:text-[#d4b5a8]">
                                            View Occasions <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                                <div className="grid gap-6 md:grid-cols-3">
                                    {smartSuggestions.slice(0, 6).map((item: SmartSuggestion) => (
                                        <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                                            <div className="h-48 bg-gray-100 relative">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Shirt className="h-12 w-12 text-gray-300" />
                                                    </div>
                                                )}
                                                {item.price && (
                                                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-bold text-[#e2c2b7]">
                                                        ${item.price}
                                                    </div>
                                                )}
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                                <p className="text-sm text-gray-500 capitalize">{item.category} • {item.color}</p>
                                                {item.occasion && (
                                                    <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full capitalize">
                                                        {item.occasion}
                                                    </span>
                                                )}
                                                {/* Match Reason */}
                                                <p className="mt-2 text-xs text-[#e2c2b7] font-medium flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" />
                                                    {item.matchReason}
                                                </p>
                                                {/* Partner Shop Info */}
                                                {item.partner && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <p className="text-xs text-gray-600 flex items-center gap-1">
                                                            <Store className="h-3 w-3" />
                                                            {item.partner.name} • {item.partner.location}
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* My Wardrobe Preview */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-[#e2c2b7]" />
                                    My Wardrobe
                                </h2>
                                <Link href="/styler/clothes">
                                    <Button variant="ghost" className="text-[#e2c2b7] hover:text-[#d4b5a8]">
                                        View All <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                                    <p className="mt-4 text-gray-600">Loading wardrobe...</p>
                                </div>
                            ) : myClothes.length === 0 ? (
                                <Card className="p-8 text-center bg-gray-50 border-dashed">
                                    <div className="flex flex-col items-center justify-center">
                                        <Package className="h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900">Your wardrobe is empty</h3>
                                        <p className="text-gray-500 mb-4">Start adding clothes to get personalized suggestions</p>
                                        <Link href="/styler/clothes/add">
                                            <Button className="bg-[#e2c2b7] hover:bg-[#d4b5a8] text-gray-900">
                                                Add First Item
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-4">
                                    {myClothes.slice(0, 4).map((item) => (
                                        <Card key={item._id || item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                                            <div className="h-48 bg-gray-100 relative">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Shirt className="h-12 w-12 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                                <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Favorite Suggestions */}
                        {favoriteSuggestions.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-[#e2c2b7]" />
                                        Favorite Suggestions
                                    </h2>
                                </div>
                                <div className="grid gap-6 md:grid-cols-3">
                                    {favoriteSuggestions.map((item) => (
                                        <Card key={item._id || item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                                            <div className="h-48 bg-gray-100 relative">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Shirt className="h-12 w-12 text-gray-300" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-bold text-[#e2c2b7]">
                                                    ${item.price}
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                                <p className="text-sm text-gray-500 capitalize">{item.brand}</p>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                        {item.category}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}