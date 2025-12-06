export interface Order {
    _id: string;
    userId: string;
    items: {
        clothId: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: string;
    paymentStatus: 'pending' | 'paid' | 'failed';
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderInput {
    items: {
        clothId: string;
        quantity: number;
    }[];
    shippingAddress: string;
}
