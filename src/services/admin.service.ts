import apiClient from "@/lib/apiClient";
import { AdminStats, PendingUser } from "@/types/admin";

export const adminService = {
    getStats: async () => {
        const response = await apiClient.get<AdminStats>("/admin/analytics");
        return response.data;
    },
    getPendingUsers: async () => {
        const response = await apiClient.get<{ count: number; users: PendingUser[] }>("/admin/pending");
        return response.data;
    },
    approveUser: async (userId: string) => {
        const response = await apiClient.put(`/admin/approve/${userId}`);
        return response.data;
    },
    rejectUser: async (userId: string) => {
        const response = await apiClient.patch(`/admin/partners/${userId}/reject`);
        return response.data;
    },
    getUsers: async (role?: string) => {
        const response = await apiClient.get(`/admin/users${role ? `?role=${role}` : ''}`);
        return response.data;
    },
    deleteUser: async (userId: string) => {
        const response = await apiClient.delete(`/admin/users/${userId}`);
        return response.data;
    },
    getAllPayments: async () => {
        const response = await apiClient.get("/admin/payments");
        return response.data;
    },
    getAllStylists: async () => {
        const response = await apiClient.get("/admin/stylists");
        return response.data;
    },
};
