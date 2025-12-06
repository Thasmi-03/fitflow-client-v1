import apiClient from "@/lib/apiClient";
import { UserProfile, UpdateProfileInput } from "@/types/user";

export const userService = {
    getProfile: async () => {
        const response = await apiClient.get<UserProfile>("/users/profile");
        return response.data;
    },
    updateProfile: async (data: UpdateProfileInput) => {
        const response = await apiClient.put<{ message: string; user: UserProfile }>("/users/profile", data);
        return response.data;
    },
    getFavorites: async () => {
        const response = await apiClient.get<{ favorites: any[] }>("/users/favorites");
        return response.data;
    },
    toggleFavorite: async (clothId: string) => {
        const response = await apiClient.post<{ message: string; isFavorite: boolean; favorites: string[] }>(`/users/favorites/${clothId}`);
        return response.data;
    },
};
