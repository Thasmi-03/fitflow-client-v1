import apiClient from '@/lib/apiClient';

// Types
export interface Category {
    _id: string;
    id?: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    createdAt?: string;
}

export interface Product {
    _id: string;
    id?: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    seller: string; // Partner name or ID
    sellerEmail?: string;
    description?: string;
    images?: string[];
    createdAt?: string;
}

export interface Order {
    _id: string;
    id?: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    items: {
        productName: string;
        quantity: number;
        price: number;
    }[];
    createdAt: string;
}

// Categories
export const getCategories = async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/admin/categories');
    return response.data;
};

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.post<Category>('/admin/categories', data);
    return response.data;
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.put<Category>(`/admin/categories/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
};

// Products (Admin View)
export const getAllProducts = async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/admin/products');
    return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`);
};

// Orders (Admin View)
export const getAllOrders = async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/admin/orders');
    return response.data;
};

export const getOrderDetails = async (id: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/admin/orders/${id}`);
    return response.data;
};
