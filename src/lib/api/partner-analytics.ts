import apiClient from '@/lib/apiClient';

export interface PartnerClothItem {
    _id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    uploadedAt: string;
    visibility: string;
    stock: number;
    sales: number;
    brand: string;
    color: string;
    size: string;
    gender: string;
    occasion: string;
    description: string;
    suitableSkinTones: string[];
}

export interface PartnerAnalytics {
    _id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    isApproved: boolean;
    createdAt: string;
    totalClothes: number;
    clothes: PartnerClothItem[];
}

export interface PartnerAnalyticsResponse {
    count: number;
    partners: PartnerAnalytics[];
}

export const getPartnerAnalytics = async (): Promise<PartnerAnalyticsResponse> => {
    const response = await apiClient.get<PartnerAnalyticsResponse>('/partners/analytics');
    return response.data;
};
