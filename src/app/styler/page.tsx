'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Shirt, Plus, ArrowRight, Heart, Store, Calendar, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { clothesService } from '@/services/clothes.service';
import { userService } from '@/services/user.service';
import { occasionsService } from '@/services/occasions.service';
import { Clothes } from '@/types/clothes';
import { Occasion } from '@/types/occasions';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AddClothesModal } from '@/components/modals/AddClothesModal';
import AnalyticsSidebar from '@/components/styler/AnalyticsSidebar';

export default function StylerDashboard() {
    const router = useRouter();
    const [myClothes, setMyClothes] = useState<Clothes[]>([]);
    const [occasions, setOccasions] = useState<Occasion[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [occasionsCount, setOccasionsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalClothesCount, setTotalClothesCount] = useState(0);
    const [addClothesModalOpen, setAddClothesModalOpen] = useState(false);

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

            // Load favorites
            try {
                const favoritesRes = await userService.getFavorites();
                setFavorites(favoritesRes.favorites || []);
                setFavoriteCount(favoritesRes.favorites?.length || 0);
            } catch (favoritesError) {
                console.warn('Could not load favorites:', favoritesError);
                setFavorites([]);
                setFavoriteCount(0);
            }

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
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

                <main className="flex-1 p-6 flex gap-6 overflow-hidden h-[calc(100vh-theme(spacing.16))]">
                    <div className="flex-1 overflow-y-auto pr-2">
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

                            {/* Favorites Section */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-primary" />
                                        Favorites
                                    </h2>
                                    {/* Link to a full favorites page if it exists, otherwise just show the section */}
                                </div>
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                        <p className="mt-4 text-muted-foreground">Loading favorites...</p>
                                    </div>
                                ) : favorites.length === 0 ? (
                                    <Card className="p-8 text-center bg-muted/50 border-dashed border-border">
                                        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-foreground">No favorites yet</h3>
                                        <p className="text-muted-foreground">Browse suggestions and save items you love!</p>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-3">
                                        {favorites.slice(0, 6).map((item) => (
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
                                                        <div className="absolute top-2 right-2 bg-card px-2 py-1 rounded-full text-xs font-bold text-primary shadow-sm border border-[#a57c65]">
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
                                )}
                            </div>

                            {/* My Clothes Section */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        My Clothes
                                    </h2>
                                    <div className="flex gap-2">

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
                        </div>
                    </div>
                    {/* Analytics Sidebar */}
                    <div className="w-80 border-l bg-background hidden lg:block">
                        <AnalyticsSidebar />
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