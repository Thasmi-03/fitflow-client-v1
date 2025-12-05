import apiClient from './client';
import { User, PendingUser } from '@/types/auth';

export interface AdminUser {
    _id: string;
    id?: string;
    email: string;
    role: 'styler' | 'partner' | 'admin';
    isApproved: boolean;
    name?: string;
    location?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AdminAnalytics {
    weeklyTrend: {
        week: string;
        registrations: number;
        logins: number;
    }[];
    totalUsers: number;
    totalStylists: number;
    totalPartners: number;
    totalPayments: number;
    totalRevenue: number;
}

/**
 * Get pending users (admin only)
 * Uses correct admin endpoint
 */
export const getPendingUsers = async (): Promise<{ users: PendingUser[] }> => {
    const response = await apiClient.get('/api/admin/pending-users');
    return response.data;
};

/**
 * Approve a user (admin only)
 */
export const approveUser = async (userId: string): Promise<{ message: string; user: User }> => {
    const response = await apiClient.put(`/api/admin/approve/${userId}`);
    return response.data;
};

/**
 * Reject a user (admin only)
 */
export const rejectUser = async (userId: string): Promise<{ message: string }> => {
    const response = await apiClient.patch(`/api/admin/partners/${userId}/reject`);
    return response.data;
};

/**
 * Get admin analytics
 */
export const getAdminAnalytics = async (): Promise<AdminAnalytics> => {
    const response = await apiClient.get('/api/admin/analytics');
    return response.data;
};

/**
 * Get all users (admin only)
 */
export const getUsers = async (): Promise<{ users: AdminUser[] }> => {
    const response = await apiClient.get('/api/admin/users');
    return response.data;
};

/**
 * Get all partners (admin only)
 */
export const getAllPartners = async (): Promise<{ users: AdminUser[] }> => {
    const response = await apiClient.get('/api/admin/users?role=partner');
    return response.data;
};

/**
 * Get pending partners (admin only)
 */
export const getPendingPartners = async (): Promise<{ users: PendingUser[] }> => {
    const response = await apiClient.get('/api/admin/partners/pending');
    return response.data;
};

/**
 * Approve a partner (admin only)
 * Alias for approveUser for consistency
 */
export const approvePartner = approveUser;

/**
 * Reject a partner (admin only)
 * Alias for rejectUser for consistency
 */
export const rejectPartner = rejectUser;
