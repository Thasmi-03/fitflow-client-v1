import apiClient from "@/lib/apiClient";
import { PartnerStats, PartnerDashboardData } from "@/types/partner";

export const partnerService = {
    getAnalytics: async () => {
        const response = await apiClient.get("/partners/analytics");
        return response.data;
    },
    getOwnAnalytics: async () => {
        const response = await apiClient.get("/partners/my-analytics");
        return response.data;
    },
    getClothes: async () => {
        const response = await apiClient.get("/partnerclothes/mine");
        return response.data;
    },
    getPublicClothes: async (params?: any) => {
        const response = await apiClient.get("/partnerclothes", { params });
        return response.data;
    },
    getClothById: async (id: string) => {
        const response = await apiClient.get(`/partnerclothes/${id}`);
        return response.data;
    },
    addCloth: async (data: any) => {
        const response = await apiClient.post("/partnerclothes", data);
        return response.data;
    },
    updateCloth: async (id: string, data: any) => {
        const response = await apiClient.put(`/partnerclothes/${id}`, data);
        return response.data;
    },
    deleteCloth: async (id: string) => {
        const response = await apiClient.delete(`/partnerclothes/${id}`);
        return response.data;
    },
    getSmartSuggestions: async (params: any) => {
        const response = await apiClient.get("/partnerclothes/suggestions", { params });
        return response.data;
    },
    recordView: async (id: string) => {
        const response = await apiClient.post(`/partnerclothes/${id}/view`);
        return response.data;
    },
    toggleLike: async (id: string) => {
        const response = await apiClient.post(`/partnerclothes/${id}/like`);
        return response.data;
    },
};
