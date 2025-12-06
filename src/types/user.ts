export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'styler' | 'partner' | 'user';
    profilePhoto?: string;
    skinTone?: string;
    preferredStyle?: string;
    phone?: string;
    location?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name?: string;
    fullName?: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    age?: number;
}

export interface UserProfile extends User { }
