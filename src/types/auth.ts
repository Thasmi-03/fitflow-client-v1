export type Role = 'admin' | 'styler' | 'partner';

export interface User {
    id: string;
    email: string;
    role: Role;
    fullName?: string;
    name?: string;
    phone?: string;
    address?: string;
    isApproved: boolean;
    profilePhoto?: string;
    skinTone?: string;
    preferredStyle?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    message: string;
    token?: string;
    user: User;
}

export interface RegisterRequest {
    email: string;
    password: string;
    role: Role;
    fullName?: string;
    phone?: string;
    address?: string;
    shopName?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, role: Role, metadata?: Record<string, any>, isPartnerPage?: boolean) => Promise<AuthResponse>;
    logout: () => void;
    clearError: () => void;
}

export interface PendingUser {
    id: string;
    email: string;
    role: Role;
    isApproved: boolean;
    createdAt: string;
}
