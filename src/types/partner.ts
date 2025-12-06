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
    ownerId?: {
        _id: string;
        name: string;
        location: string;
        phone?: string;
    } | string;
    createdAt: string;
    id?: string;
    views?: string[];
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

export type PartnerClothes = PartnerClothItem;

export interface PartnerStats {
    totalSales: number;
    totalRevenue: number;
    totalProducts: number;
}

export interface PartnerDashboardData {
    stats: PartnerStats;
    recentOrders: any[]; // Replace with Order type when available
    topProducts: any[]; // Replace with Cloth type when available
}

export interface SmartSuggestion {
    _id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    color: string;
    occasion?: string;
    matchReason: string;
    partner: {
        name: string;
        location: string;
    };
}
