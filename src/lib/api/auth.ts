import apiClient from '@/lib/apiClient';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth';

/**
 * Register a new user
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
    await apiClient.post('/auth/logout');
};

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<{ user: User }> => {
    const response = await apiClient.get<{ user: User }>('/auth/profile');
    return response.data;
};

/**
 * Update current user profile
 */
export const updateProfile = async (data: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await apiClient.put<{ message: string; user: User }>('/users/profile', data);
    return response.data;
};


