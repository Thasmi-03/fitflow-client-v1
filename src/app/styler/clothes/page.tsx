'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { clothesService } from '@/services/clothes.service';
import { Clothes, CATEGORIES, COLORS, SKIN_TONES } from '@/types/clothes';
import { toast } from 'sonner';
import { AddClothesModal } from '@/components/modals/AddClothesModal';

export default function StylerClothesPage() {
    const [clothes, setClothes] = useState<Clothes[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterColor, setFilterColor] = useState('all');
    const [filterSkinTone, setFilterSkinTone] = useState('all');
    const [filterGender, setFilterGender] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    }, [filterCategory, filterColor, filterSkinTone, filterGender]);

    useEffect(() => {
        loadClothes();
    }, [page, debouncedSearchTerm, filterCategory, filterColor, filterSkinTone, filterGender]);

    const loadClothes = async () => {
        try {
            setLoading(true);
            const params: any = {
                page,
                limit,
            };

            if (debouncedSearchTerm) params.search = debouncedSearchTerm;
            if (filterCategory !== 'all') params.category = filterCategory;
            if (filterColor !== 'all') params.color = filterColor;
            if (filterSkinTone !== 'all') params.skinTone = filterSkinTone;
            if (filterGender !== 'all') params.gender = filterGender;

            const response = await clothesService.getAll(params);
            setClothes(response.clothes);
            setTotalPages(response.totalPages);
            setTotalItems(response.total);
        } catch (error) {
            console.error('Error loading clothes:', error);
            toast.error('Failed to load clothes', {
                duration: Infinity,
                closeButton: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await clothesService.delete(id);
            toast.success('Clothes deleted successfully', {
                duration: 3000,
            });
            loadClothes();
        } catch (error) {
            console.error('Error deleting clothes:', error);
            toast.error('Failed to delete clothes', {
                duration: Infinity,
                closeButton: true,
            });
        }
    };

    // Use imported constants for filters
    const categories = CATEGORIES;
    const colors = COLORS;
    const skinTones = SKIN_TONES;
    const genders = ['male', 'female'];

    return (
        <ProtectedRoute allowedRoles={['styler']}>
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar role="styler" />

                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">My Clothes</h1>
                                <p className="mt-2 text-muted-foreground">
                                    Manage your clothing collection
                                </p>
                            </div>
                            <Button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Clothes
                            </Button>
                        </div>

                        {/* Search and Filters */}
                        <Card className="mb-6 bg-card border-border">
                            <CardContent className="pt-6">
                                <div className="grid gap-4 md:grid-cols-5">
                                    {/* Search */}
                                    <div className="md:col-span-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search clothes..."
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

                                    {/* Skin Tone Filter */}
                                    <div>
                                        <Select value={filterSkinTone} onValueChange={setFilterSkinTone}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Skin Tone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Skin Tones</SelectItem>
                                                {skinTones.map((tone) => (
                                                    <SelectItem key={tone} value={tone}>
                                                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Clothes List */}
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <Package className="h-5 w-5" />
                                    All Clothes ({totalItems})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                        <p className="mt-4 text-muted-foreground">Loading...</p>
                                    </div>
                                ) : clothes.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground mb-4">
                                            {totalItems === 0 && !searchTerm && filterCategory === 'all' ? 'No clothes in wardrobe yet' : 'No clothes match your filters'}
                                        </p>
                                        {totalItems === 0 && !searchTerm && filterCategory === 'all' && (
                                            <Link href="/styler/clothes/add">
                                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Your First Item</Button>
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                                            {clothes.map((item) => {
                                                // Handle both id and _id (for backward compatibility)
                                                const itemId = item.id || (item as any)._id;
                                                const imageUrl = item.imageUrl || (item as any).image;

                                                return (
                                                    <div
                                                        key={itemId}
                                                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors flex flex-col h-full bg-card"
                                                    >
                                                        {imageUrl && (
                                                            <img
                                                                src={imageUrl}
                                                                alt={item.name}
                                                                className="w-full h-48 object-cover rounded-md mb-3"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-lg mb-2 text-foreground">{item.name}</h3>
                                                            <div className="space-y-1 text-sm text-muted-foreground mb-3">
                                                                <p>Category: <span className="font-medium text-foreground">{item.category}</span></p>
                                                                <p>Color: <span className="font-medium text-foreground">{item.color}</span></p>
                                                                {item.skinTone && <p>Skin Tone: <span className="font-medium text-foreground">{item.skinTone}</span></p>}
                                                                {item.gender && <p>Gender: <span className="font-medium text-foreground">{item.gender}</span></p>}
                                                                {item.age && <p>Age: <span className="font-medium text-foreground">{item.age}</span></p>}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 mt-auto">
                                                            <Link href={`/styler/clothes/edit/${itemId}`} className="flex-1">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full"
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(itemId)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
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

                {/* Add Clothes Modal */}
                <AddClothesModal
                    open={isAddModalOpen}
                    onOpenChange={setIsAddModalOpen}
                    onSuccess={loadClothes}
                />
            </div >
        </ProtectedRoute >
    );
}
