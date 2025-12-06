import apiClient from "@/lib/apiClient";

export const userService = {
    getMyProfile: async () => {
        const response = await apiClient.get("/auth/profile");
        return response.data;
    },
    updateMyProfile: async (data: any) => {
        const response = await apiClient.put("/auth/updatedetails", data);
        return response.data;
    }
};
