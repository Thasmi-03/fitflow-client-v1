import apiClient from './client';

export interface UserProfile {
    _id: string;
    email: string;
    role: 'styler' | 'partner' | 'admin';
    isApproved: boolean;
    name?: string;
    location?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
    favorites?: string[];
    profilePhoto?: string;
}

export interface UpdateProfileInput {
    name?: string;
    location?: string;
    phone?: string;
    profilePhoto?: string;
}

export const getMyProfile = async (): Promise<UserProfile> => {
    const response = await apiClient.get('/api/users/profile');
    return response.data;
};

export const updateMyProfile = async (data: UpdateProfileInput): Promise<{ message: string; user: UserProfile }> => {
    const response = await apiClient.put('/api/users/profile', data);
    return response.data;
};

export const toggleFavorite = async (clothId: string): Promise<{ message: string; isFavorite: boolean; favorites: string[] }> => {
    const response = await apiClient.post(`/api/users/favorites/${clothId}`);
    return response.data;
};

export const getFavorites = async (): Promise<{ favorites: any[] }> => {
    const response = await apiClient.get('/api/users/favorites');
    return response.data;
};
