export type Role = 'user' | 'admin' | 'styler' | 'partner';

export interface User {
    _id: string;
    email: string;
    role: Role;
    name?: string;
    phone?: string;
    profilePhoto?: string;
    skinTone?: string;
    skinToneDetectedAt?: string;
    preferredStyle?: string;
    // Add other common user fields here
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface RegisterResponse {
    token?: string;
    user?: User;
    message?: string;
}
