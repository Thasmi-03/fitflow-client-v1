import apiClient from "@/lib/apiClient";
import { Occasion, CreateOccasionInput, UpdateOccasionInput } from "@/types/occasions";

export const occasionsService = {
    getAll: async () => {
        const response = await apiClient.get<{ data: Occasion[] }>("/occasion");
        return response.data;
    },
    getById: async (id: string) => {
        const response = await apiClient.get<{ occasion: Occasion }>(`/occasion/${id}`);
        return response.data;
    },
    create: async (data: CreateOccasionInput) => {
        const response = await apiClient.post<{ occasion: Occasion }>("/occasion", data);
        return response.data;
    },
    update: async (id: string, data: UpdateOccasionInput) => {
        const response = await apiClient.put<{ occasion: Occasion }>(`/occasion/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await apiClient.delete<{ message: string }>(`/occasion/${id}`);
        return response.data;
    },
    getSuggestions: async (id: string) => {
        const response = await apiClient.get(`/occasion/${id}/suggestions`);
        return response.data;
    },
};
