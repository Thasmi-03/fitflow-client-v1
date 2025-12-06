import apiClient from "@/lib/apiClient";
import { Cloth, CreateClothInput, UpdateClothInput } from "@/types/clothes";

export const clothesService = {
    getAll: async (params?: any) => {
        const response = await apiClient.get("/stylerclothes/mine", { params });
        return response.data;
    },
    getById: async (id: string) => {
        const response = await apiClient.get<{ clothes: Cloth }>(`/stylerclothes/${id}`);
        return response.data;
    },
    create: async (data: CreateClothInput) => {
        const response = await apiClient.post<{ clothes: Cloth }>("/stylerclothes", data);
        return response.data;
    },
    update: async (id: string, data: UpdateClothInput) => {
        const response = await apiClient.put<{ clothes: Cloth }>(`/stylerclothes/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await apiClient.delete<{ message: string }>(`/stylerclothes/${id}`);
        return response.data;
    },
    getSkinToneSuggestions: async (skinTone: string) => {
        const response = await apiClient.get(`/styler/suggestions/skin-tone?skinTone=${skinTone}`);
        return response.data;
    },
    getUsageStats: async (sort: 'asc' | 'desc' = 'desc') => {
        const response = await apiClient.get(`/styler/suggestions/usage?sort=${sort}`);
        return response.data;
    },
    getOccasionSuggestions: async (occasion: string) => {
        const response = await apiClient.get(`/styler/suggestions/occasion?occasion=${occasion}`);
        return response.data;
    },
};
