import apiClient from "@/lib/apiClient";
import { LoginCredentials, RegisterData } from "@/types/user";

export const authService = {
    login: async (credentials: LoginCredentials) => {
        const response = await apiClient.post("/auth/login", credentials);
        return response.data;
    },
    register: async (data: RegisterData) => {
        const response = await apiClient.post("/auth/register", data);
        return response.data;
    },
    getCurrentUser: async () => {
        const response = await apiClient.get("/auth/profile");
        return response.data;
    },
    updateProfile: async (data: any) => {
        const response = await apiClient.put("/auth/updatedetails", data);
        return response.data;
    }
};
