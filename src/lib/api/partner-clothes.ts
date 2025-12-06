import apiClient from '@/lib/apiClient';

export interface PartnerClothes {
    id: string;
    _id?: string; // MongoDB ID (for backward compatibility)
    name: string;
    category: string;
    color: string;
    brand: string;
    price: number;
    stock?: number;
    sales?: number;
    views?: Array<{ stylerId: string; viewedAt: string }>;
    image?: string;
    description?: string;
    note?: string; // Backend field name
    size: string;
    visibility: 'public' | 'private';
    ownerId: string | {
        _id: string;
        name?: string;
        location?: string;
        phone?: string;
        email?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface PartnerClothesInput {
    name: string;
    category: string;
    color: string;
    brand: string;
    price: number;
    stock?: number;
    image?: string;
    description?: string;
    size: string;
    note?: string; // Backend field name
    visibility?: 'public' | 'private';
}

// Get partner's own clothes
export const getPartnerClothes = async (): Promise<{ clothes: PartnerClothes[] }> => {
    const response = await apiClient.get('/partnerclothes/mine');
    return { clothes: response.data.data };
};

// Get public partner clothes (for styler suggestions)
export const getPublicPartnerClothes = async (): Promise<{ clothes: PartnerClothes[] }> => {
    const response = await apiClient.get('/partnerclothes');
    return { clothes: response.data.data };
};

// Get single partner clothes by ID
export const getPartnerClothesById = async (id: string): Promise<{ clothes: PartnerClothes }> => {
    const response = await apiClient.get(`/partnerclothes/${id}`);
    return { clothes: response.data };
};

// Add new partner clothes
// Add new partner clothes
export const addPartnerClothes = async (data: PartnerClothesInput): Promise<{ clothes: PartnerClothes }> => {
    console.log("Sending addPartnerClothes data:", data);
    try {
        const response = await apiClient.post('/partnerclothes', data);
        return { clothes: response.data.cloth };
    } catch (error) {
        console.error("addPartnerClothes error:", error);
        throw error;
    }
};

// Update partner clothes
export const updatePartnerClothes = async (id: string, data: Partial<PartnerClothesInput>): Promise<{ clothes: PartnerClothes }> => {
    const response = await apiClient.put(`/partnerclothes/${id}`, data);
    return { clothes: response.data.cloth };
};

// Delete partner clothes
export const deletePartnerClothes = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/partnerclothes/${id}`);
    return response.data;
};

// Smart Suggestion Response interface
export interface SmartSuggestion {
    _id: string;
    name: string;
    category: string;
    color: string;
    image?: string;
    gender?: string;
    occasion?: string;
    price: number;
    brand: string;
    suitableSkinTones?: string[];
    matchReason: string;
    partner: {
        _id: string;
        name: string;
        location: string;
        phone: string;
        email: string;
    } | null;
}

export interface SmartSuggestionsResponse {
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
        filters: {
            occasion: string | null;
            gender: string | undefined;
            skinTone: string | undefined;
            userOccasions: string[];
        };
    };
    data: SmartSuggestion[];
}

// Get smart suggestions based on user's skin tone, gender, and occasion
export const getSmartSuggestions = async (params?: {
    occasion?: string;
    skinTone?: string;
    gender?: string;
    page?: number;
    limit?: number;
}): Promise<SmartSuggestionsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.occasion) queryParams.append('occasion', params.occasion);
    if (params?.skinTone) queryParams.append('skinTone', params.skinTone);
    if (params?.gender) queryParams.append('gender', params.gender);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = `/partnerclothes/suggestions${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    return response.data;
};

// Record a view on a partner cloth (styler only)
export const recordPartnerClothView = async (id: string): Promise<{ message: string; viewCount: number }> => {
    const response = await apiClient.post(`/partnerclothes/${id}/view`);
    return response.data;
};
