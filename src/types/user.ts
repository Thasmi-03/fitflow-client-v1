export interface UserProfile {
    _id: string;
    email: string;
    role: 'styler' | 'partner' | 'admin';
    isApproved: boolean;
    name?: string;
    location?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
    favorites?: string[];
    profilePhoto?: string;
    skinTone?: string;
    skinToneDetectedAt?: string;
    preferredStyle?: string;
}

export interface UpdateProfileInput {
    name?: string;
    location?: string;
    phone?: string;
    profilePhoto?: string;
    skinTone?: string;
    preferredStyle?: string;
}
