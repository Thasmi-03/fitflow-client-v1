'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Edit, Trash2, X, Sparkles } from 'lucide-react';
import { occasionsService } from '@/services/occasions.service';
import { partnerService } from '@/services/partner.service';
import { Occasion, CreateOccasionInput } from '@/types/occasions';
import { toast } from 'sonner';

export default function OccasionsPage() {
    const [occasions, setOccasions] = useState<Occasion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null);
    const [formData, setFormData] = useState<CreateOccasionInput>({
        title: '',
        type: 'casual',
        date: '',
        location: '',
        dressCode: '',
        notes: '',
        skinTone: '',
        clothesList: []
    });

    // Suggestions state
    const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [currentOccasion, setCurrentOccasion] = useState<any>(null);

    const occasionTypes = ['casual', 'formal', 'business', 'party', 'wedding', 'sports', 'beach', 'other'];
    const skinTones = ['fair', 'light', 'medium', 'tan', 'deep', 'dark'];

    const occasionColors: Record<string, string> = {
        business: 'bg-blue-100 text-blue-800',
        party: 'bg-pink-100 text-pink-800',
        formal: 'bg-purple-100 text-purple-800',
        casual: 'bg-green-100 text-green-800',
        wedding: 'bg-rose-100 text-rose-800',
        sports: 'bg-orange-100 text-orange-800',
        beach: 'bg-yellow-100 text-yellow-800',
        other: 'bg-gray-100 text-gray-800'
    };

    useEffect(() => {
        loadOccasions();
    }, []);

    const loadOccasions = async () => {
        try {
            setLoading(true);
            const response = await occasionsService.getAll();
            setOccasions(response.data);
        } catch (error) {
            console.error('Error loading occasions:', error);
            toast.error('Failed to load occasions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.date) {
            toast.error('Title and date are required');
            return;
        }

        try {
            if (editingOccasion) {
                await occasionsService.update(editingOccasion._id, formData);
                toast.success('Occasion updated successfully');
            } else {
                await occasionsService.create(formData);
                toast.success('Occasion created successfully');
            }
            loadOccasions();
            closeModal();
        } catch (error) {
            console.error('Error saving occasion:', error);
            toast.error('Failed to save occasion');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this occasion?')) return;

        try {
            await occasionsService.delete(id);
            toast.success('Occasion deleted successfully');
            loadOccasions();
        } catch (error) {
            console.error('Error deleting occasion:', error);
            toast.error('Failed to delete occasion');
        }
    };

    const openModal = (occasion?: Occasion) => {
        if (occasion) {
            setEditingOccasion(occasion);
            setFormData({
                title: occasion.title,
                type: occasion.type,
                date: occasion.date.split('T')[0],
                location: occasion.location || '',
                dressCode: occasion.dressCode || '',
                notes: occasion.notes || '',
                skinTone: occasion.skinTone || '',
                clothesList: occasion.clothesList || []
            });
        } else {
            setEditingOccasion(null);
            setFormData({
                title: '',
                type: 'casual',
                date: '',
                location: '',
                dressCode: '',
                notes: '',
                skinTone: '',
                clothesList: []
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingOccasion(null);
    };

    const openSuggestionsModal = async (occasion: Occasion) => {
        setCurrentOccasion(occasion);
        setIsSuggestionsModalOpen(true);
        setSuggestionsLoading(true);

        try {
            const response = await occasionsService.getSuggestions(occasion._id);
            setSuggestions(response.suggestions);

            // Record views for partner clothes shown in suggestions
            for (const item of response.suggestions) {
                if (item.partner) {
                    try {
                        await partnerService.recordView(item._id);
                    } catch (viewError) {
                        // Silently handle view recording errors
                        console.log('View recording skipped:', viewError);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            toast.error('Failed to load suggestions');
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const closeSuggestionsModal = () => {
        setIsSuggestionsModalOpen(false);
        setSuggestions([]);
        setCurrentOccasion(null);
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
                                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                        <Calendar className="h-8 w-8 text-[#e2c2b7]" />
                                        My Occasions
                                    </h1>
                                    <p className="mt-2 text-gray-600">
                                        Manage your events and special occasions
                                    </p>
                                </div>
                                <Button onClick={() => openModal()} className="flex items-center gap-2 bg-[#e2c2b7] hover:bg-[#d4b5a8] text-gray-900">
                                    <Plus className="h-4 w-4" />
                                    Add Occasion
                                </Button>
                            </div>
                        </div>

                        {/* Occasions Grid */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                                <p className="mt-4 text-gray-600">Loading occasions...</p>
                            </div>
                        ) : occasions.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Occasions Yet</h3>
                                <p className="text-gray-600 mb-6">Start by adding your first occasion</p>
                                <Button onClick={() => openModal()} className="bg-[#e2c2b7] hover:bg-[#d4b5a8] text-gray-900">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Occasion
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {occasions.map((occasion) => (
                                    <Card key={occasion._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <CardHeader className="bg-gradient-to-r from-[#e2c2b7]/20 to-[#d4b5a8]/20">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-gray-900">{occasion.title}</CardTitle>
                                                    <CardDescription className="text-gray-700 mt-1">
                                                        {new Date(occasion.date).toLocaleDateString()}
                                                    </CardDescription>
                                                </div>
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${occasionColors[occasion.type] || 'bg-gray-100 text-gray-800'}`}>
                                                    {occasion.type}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="space-y-2 mb-4">
                                                {occasion.location && (
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Location:</span> {occasion.location}
                                                    </p>
                                                )}
                                                {occasion.dressCode && (
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Dress Code:</span> {occasion.dressCode}
                                                    </p>
                                                )}
                                                {occasion.notes && (
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Notes:</span> {occasion.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2 pt-4 border-t">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full bg-gradient-to-r from-[#e2c2b7]/10 to-[#d4b5a8]/10 hover:from-[#e2c2b7]/20 hover:to-[#d4b5a8]/20 border-[#e2c2b7]"
                                                    onClick={() => openSuggestionsModal(occasion)}
                                                >
                                                    <Sparkles className="h-4 w-4 mr-2" /> View Suggestions
                                                </Button>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openModal(occasion)}>
                                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(occasion._id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold">{editingOccasion ? 'Edit Occasion' : 'Create New Occasion'}</h2>
                                        <button onClick={closeModal}><X className="h-6 w-6" /></button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Label>Title *</Label>
                                            <Input
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g., Birthday Party"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Type *</Label>
                                                <select
                                                    className="w-full p-2 border rounded-md"
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    required
                                                >
                                                    {occasionTypes.map(type => (
                                                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <Label>Date *</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Location</Label>
                                            <Input
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="e.g., Central Park"
                                            />
                                        </div>

                                        <div>
                                            <Label>Dress Code</Label>
                                            <Input
                                                value={formData.dressCode}
                                                onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                                                placeholder="e.g., Formal, Casual"
                                            />
                                        </div>

                                        <div>
                                            <Label>Skin Tone</Label>
                                            <select
                                                className="w-full p-2 border rounded-md"
                                                value={formData.skinTone}
                                                onChange={(e) => setFormData({ ...formData, skinTone: e.target.value })}
                                            >
                                                <option value="">Select skin tone</option>
                                                {skinTones.map(tone => (
                                                    <option key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <Label>Notes</Label>
                                            <Textarea
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                placeholder="Additional notes..."
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 mt-6">
                                            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                                            <Button type="submit" className="bg-[#e2c2b7] hover:bg-[#d4b5a8] text-gray-900">
                                                {editingOccasion ? 'Update Occasion' : 'Create Occasion'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Suggestions Modal */}
                    {isSuggestionsModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                                <Sparkles className="h-6 w-6 text-[#e2c2b7]" />
                                                Outfit Suggestions
                                            </h2>
                                            {currentOccasion && (
                                                <p className="text-gray-600 mt-1">
                                                    For {currentOccasion.title} ({currentOccasion.type})
                                                </p>
                                            )}
                                        </div>
                                        <button onClick={closeSuggestionsModal}>
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {suggestionsLoading ? (
                                        <div className="text-center py-12">
                                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                                            <p className="mt-4 text-gray-600">Finding perfect outfits...</p>
                                        </div>
                                    ) : suggestions.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matching Outfits Found</h3>
                                            <p className="text-gray-600 mb-4">
                                                We couldn't find any clothes in your wardrobe that match this occasion.
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Try adding clothes with the "{currentOccasion?.type}" occasion tag to see suggestions here.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {suggestions.map((item) => (
                                                <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                                    {item.image && (
                                                        <div className="aspect-square overflow-hidden bg-gray-100">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <CardContent className="p-4">
                                                        <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                                                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                                                            <p><span className="font-medium">Category:</span> {item.category}</p>
                                                            <p><span className="font-medium">Color:</span> {item.color}</p>
                                                            {item.brand && (
                                                                <p><span className="font-medium">Brand:</span> {item.brand}</p>
                                                            )}
                                                            {item.price && (
                                                                <p className="text-[#e2c2b7] font-bold text-lg mt-2">${item.price}</p>
                                                            )}
                                                        </div>

                                                        {/* Partner Details */}
                                                        {item.partner && (
                                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                                <p className="text-xs font-semibold text-gray-700 mb-2">Partner Shop</p>
                                                                <div className="space-y-1 text-xs text-gray-600">
                                                                    <p><span className="font-medium">Shop:</span> {item.partner.name}</p>
                                                                    <p><span className="font-medium">Location:</span> {item.partner.location}</p>
                                                                    {item.partner.phone && item.partner.phone !== 'N/A' && (
                                                                        <p><span className="font-medium">Contact:</span> {item.partner.phone}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="mt-3 pt-3 border-t">
                                                            <p className="text-xs text-[#e2c2b7] font-medium flex items-center gap-1">
                                                                <Sparkles className="h-3 w-3" />
                                                                {item.matchReason}
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
