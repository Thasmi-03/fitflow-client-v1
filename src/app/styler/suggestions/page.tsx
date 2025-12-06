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
import { PartnerClothes } from '@/types/partner';
import { toast } from 'sonner';
import { SkinTone } from '@/types/clothes';

const skinTones: SkinTone[] = ['fair', 'light', 'medium', 'tan', 'deep', 'dark'];

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
            setClothes(clothesRes.clothes);
            if (profileRes.favorites) {
                setFavorites(profileRes.favorites);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load dress suggestions');
        } finally {
            setLoading(false);
        }
    };

    const handleFavorite = async (e: React.MouseEvent, clothId: string) => {
        e.stopPropagation(); // Prevent card click
        try {
            const res = await userService.toggleFavorite(clothId);
            setFavorites(res.favorites);
            toast.success(res.isFavorite ? 'Added to favorites' : 'Removed from favorites');
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error('Failed to update favorites');
        }
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

            return matchesSearch && matchesCategory && matchesColor && matchesBrand;
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
            <div className="flex min-h-screen bg-gray-50">
                <DashboardSidebar role="styler" />

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Sparkles className="h-8 w-8 text-[#e2c2b7]" />
                                Dress Suggestions
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Curated dresses from our partner shops
                            </p>
                        </div>

                        {/* Search and Filters */}
                        <Card className="mb-6">
                            <CardContent className="pt-6">
                                <div className="grid gap-4 md:grid-cols-4">
                                    {/* Search */}
                                    <div className="md:col-span-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Total Suggestions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalSuggestions}</div>
                                    <p className="text-xs text-gray-500 mt-1">Available for you</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Partner Shops
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {partnerShopsCount}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Contributing partners</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Categories
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {categoriesCount}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Different styles</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Suggestions Grid */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                                <p className="mt-4 text-gray-600">Loading suggestions...</p>
                            </div>
                        ) : filteredClothes.length === 0 ? (
                            <Card className="p-12">
                                <div className="text-center">
                                    <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {clothes.length === 0 ? 'No Suggestions Available' : 'No matches found'}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
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
                                        <Card key={itemId} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                            {/* Image Placeholder */}
                                            <div className="aspect-[3/4] bg-gradient-to-br from-[#e2c2b7] to-[#d4b5a8] flex items-center justify-center relative overflow-hidden">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="h-24 w-24 text-white opacity-30 group-hover:scale-110 transition-transform" />
                                                )}
                                                <div className="absolute top-3 right-3">
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        className={`rounded-full h-8 w-8 ${isFavorite ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-white/80 hover:bg-white'}`}
                                                        onClick={(e) => handleFavorite(e, itemId)}
                                                    >
                                                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                                                    </Button>
                                                </div>
                                            </div>

                                            <CardContent className="p-5">
                                                <div className="mb-3">
                                                    <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                                                    <p className="text-sm text-gray-600">{item.category}</p>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Color:</span>
                                                        <span className="font-medium capitalize">{item.color}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Brand:</span>
                                                        <span className="font-medium">{item.brand}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Price:</span>
                                                        <span className="font-bold text-[#e2c2b7]">${item.price.toFixed(2)}</span>
                                                    </div>
                                                    {typeof item.ownerId === 'object' && item.ownerId !== null && item.ownerId.location && (
                                                        <div className="pt-2 border-t border-gray-200">
                                                            <div className="text-xs text-gray-500">
                                                                <div className="font-medium text-gray-700">
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
                                                    className="w-full bg-[#e2c2b7] hover:bg-[#d4b5a8] text-gray-900"
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
