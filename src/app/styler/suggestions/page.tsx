'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, Search, Sparkles, Shirt } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { partnerService } from '@/services/partner.service';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';
import { PARTNER_CATEGORIES, COLORS } from '@/types/clothes';

export default function SuggestionsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterColor, setFilterColor] = useState('all');
    const [detectedSkinTone, setDetectedSkinTone] = useState<string>('');

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 12;

    // Debounce search term
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1); // Reset to page 1 on search change
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [filterCategory, filterColor]);

    useEffect(() => {
        loadUserProfile();
    }, []);

    useEffect(() => {
        loadItems();
    }, [page, debouncedSearchTerm, filterCategory, filterColor]);

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

    const loadItems = async () => {
        try {
            setLoading(true);
            const params: any = {
                page,
                limit,
            };

            if (debouncedSearchTerm) params.search = debouncedSearchTerm;
            if (filterCategory !== 'all') params.category = filterCategory;
            if (filterColor !== 'all') params.color = filterColor;
            if (detectedSkinTone) params.skinTone = detectedSkinTone;

            const response = await partnerService.getPublicClothes(params);
            setItems(response.data || []);
            setTotalPages(response.totalPages || 1);
            setTotalItems(response.total || 0);
        } catch (error) {
            console.error('Error loading items:', error);
            toast.error('Failed to load marketplace items', {
                duration: Infinity,
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['styler']}>
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar role="styler" />

                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Store className="h-8 w-8 text-primary" />
                                <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
                            </div>
                            <p className="text-muted-foreground">
                                {detectedSkinTone
                                    ? `Personalized suggestions for ${detectedSkinTone} skin tone`
                                    : 'Discover clothes from partner shops'}
                            </p>
                        </div>

                        {/* Search and Filters */}
                        <Card className="mb-6 bg-card border-border">
                            <CardContent className="pt-6">
                                <div className="grid gap-4 md:grid-cols-3">
                                    {/* Search */}
                                    <div className="md:col-span-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search marketplace..."
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
                                                {PARTNER_CATEGORIES.map((cat) => (
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
                                                {COLORS.map((color) => (
                                                    <SelectItem key={color} value={color}>
                                                        {color.charAt(0).toUpperCase() + color.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items Grid */}
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <Sparkles className="h-5 w-5" />
                                    {detectedSkinTone ? 'AI Picks for You' : 'All Items'} ({totalItems})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                        <p className="mt-4 text-muted-foreground">Loading...</p>
                                    </div>
                                ) : items.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground mb-4">
                                            {totalItems === 0 && !searchTerm && filterCategory === 'all'
                                                ? 'No items available in marketplace yet'
                                                : 'No items match your filters'}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                                            {items.map((item) => {
                                                const itemId = item._id || item.id;
                                                const imageUrl = item.image || item.imageUrl;

                                                return (
                                                    <Link
                                                        key={itemId}
                                                        href={`/styler/suggestions/${itemId}`}
                                                        className="block"
                                                    >
                                                        <Card className="overflow-hidden hover:bg-muted/50 transition-colors duration-300 h-full bg-card border-border">
                                                            <div className="h-48 bg-muted relative">
                                                                {imageUrl ? (
                                                                    <img
                                                                        src={imageUrl}
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
                                                                <h3 className="font-semibold text-lg mb-2 text-foreground">{item.name}</h3>
                                                                <div className="space-y-1 text-sm text-muted-foreground">
                                                                    <p className="capitalize">
                                                                        <span className="font-medium text-foreground">Category:</span> {item.category}
                                                                    </p>
                                                                    <p className="capitalize">
                                                                        <span className="font-medium text-foreground">Color:</span> {item.color}
                                                                    </p>
                                                                    {typeof item.ownerId === 'object' && item.ownerId !== null && item.ownerId.name && (
                                                                        <p className="flex items-center gap-1 text-xs pt-2 border-t border-border">
                                                                            <Store className="h-3 w-3" />
                                                                            {item.ownerId.name}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </Link>
                                                );
                                            })}
                                        </div>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 mt-8">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                                    disabled={page === 1}
                                                >
                                                    Previous
                                                </Button>
                                                <span className="text-sm text-muted-foreground">
                                                    Page {page} of {totalPages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={page === totalPages}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
