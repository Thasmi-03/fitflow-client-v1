import apiClient from "@/lib/apiClient";
import { Order, CreateOrderInput } from "@/types/orders";

export const ordersService = {
    getAll: async () => {
        const response = await apiClient.get<{ data: Order[] }>("/payment");
        return response.data;
    },
    create: async (data: CreateOrderInput) => {
        const response = await apiClient.post<{ payment: Order }>("/payment", data);
        return response.data;
    },
};
