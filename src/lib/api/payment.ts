import apiClient from '@/lib/apiClient';

export interface Payment {
    _id: string;
    userId: string;
    amount: number;
    currency: string;
    method: string;
    status: 'pending' | 'completed' | 'failed';
    description: string;
    occasion?: string;
    productName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentInput {
    amount: number;
    currency?: string;
    method?: string;
    status?: 'pending' | 'completed' | 'failed';
    description?: string;
    occasion?: string;
    productName?: string;
}

// Get all payments (orders)
export const getPayments = async (): Promise<{ data: Payment[] }> => {
    const response = await apiClient.get('/payment');
    return response.data;
};

// Create a new payment (order)
export const createPayment = async (data: PaymentInput): Promise<{ payment: Payment }> => {
    const response = await apiClient.post('/payment', data);
    return response.data;
};
