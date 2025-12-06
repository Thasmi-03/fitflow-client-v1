import apiClient from "@/lib/apiClient";
import { LoginResponse, RegisterResponse } from "@/types/auth";

export const authService = {
    login: async (credentials: any) => {
        const response = await apiClient.post<LoginResponse>("/auth/login", credentials);
        return response.data;
    },
    register: async (data: any) => {
        const response = await apiClient.post<RegisterResponse>("/auth/register", data);
        return response.data;
    },
    logout: async () => {
        await apiClient.post("/auth/logout");
    },
    getCurrentUser: async () => {
        const response = await apiClient.get("/auth/profile");
        return response.data;
    },
};
