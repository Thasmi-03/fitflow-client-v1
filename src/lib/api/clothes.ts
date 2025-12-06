import apiClient from '@/lib/apiClient';
import { Clothes, CreateClothesInput, UpdateClothesInput } from '@/types/clothes';

export type { Clothes };

export interface GetClothesParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    color?: string;
    skinTone?: string;
    gender?: string;
    minPrice?: number;
    maxPrice?: number;
}

export interface GetClothesResponse {
    clothes: Clothes[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
}

export const getClothes = async (params: GetClothesParams = {}): Promise<GetClothesResponse> => {
    const response = await apiClient.get('/stylerclothes/mine', { params });
    return response.data;
};

export const getClothesById = async (id: string): Promise<{ clothes: Clothes }> => {
    const response = await apiClient.get(`/stylerclothes/${id}`);
    return { clothes: response.data };
};

// Fashion Hub API
export const getSkinToneSuggestions = async (skinTone: string) => {
    const response = await apiClient.get(`/styler/suggestions/skin-tone?skinTone=${skinTone}`);
    return response.data;
};

export const getUsageStats = async (sort: 'asc' | 'desc' = 'desc') => {
    const response = await apiClient.get(`/styler/suggestions/usage?sort=${sort}`);
    return response.data;
};

export const getOccasionSuggestions = async (occasion: string) => {
    const response = await apiClient.get(`/styler/suggestions/occasion?occasion=${occasion}`);
    return response.data;
};

export const addClothes = async (data: CreateClothesInput): Promise<{ clothes: Clothes }> => {
    const response = await apiClient.post('/stylerclothes', data);
    return response.data;
};

export const updateClothes = async (id: string, data: Partial<CreateClothesInput>): Promise<{ clothes: Clothes }> => {
    const response = await apiClient.put(`/stylerclothes/${id}`, data);
    return response.data;
};

export const deleteClothes = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/stylerclothes/${id}`);
    return response.data;
};
