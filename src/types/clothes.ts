// Category constants and type
export const CATEGORIES = [
    'dress', 'shirt', 'pants', 'jacket', 'skirt', 'top', 'shorts',
    'suit', 'blazer', 'sweater', 'coat', 'tshirt', 'frock'
] as const;

export const PARTNER_CATEGORIES = [
    ...CATEGORIES,
    'saree', 'kurta', 'lehenga'
] as const;

export type Category = typeof CATEGORIES[number];
export type PartnerCategory = typeof PARTNER_CATEGORIES[number];

// Occasion constants and type
export const OCCASIONS = [
    'casual', 'formal', 'business', 'party', 'wedding', 'sports', 'beach'
] as const;

export type Occasion = typeof OCCASIONS[number];

// Other types
export type SkinTone = 'fair' | 'light' | 'medium' | 'tan' | 'deep' | 'dark';
export type Gender = 'male' | 'female' | 'unisex';
export type Color = 'red' | 'blue' | 'green' | 'yellow' | 'black' | 'white' | 'gray' | 'brown' | 'pink' | 'purple' | 'orange' | 'beige' | 'navy' | 'maroon' | 'teal' | 'coral' | 'multi';

export interface Clothes {
    id: string;
    _id?: string; // MongoDB ID (for backward compatibility)
    name: string;
    category: string;
    color: string;
    // Styler-specific fields
    skinTone?: SkinTone;
    gender?: Gender;
    age?: number;
    // Partner-specific fields
    size?: string; // Only for partner clothes
    price?: number;
    description?: string;
    imageUrl?: string;
    image?: string; // Backend field name
    note?: string; // Backend field name
    userId: string;
    createdAt: string;
    updatedAt: string;
    // New fields for suggestions and matching
    occasion?: Occasion[]; // Array of occasions (1-4)
    usageCount?: number;
    // Partner-specific fields
    stock?: number;
    sales?: number;
}

export interface CreateClothesInput {
    name: string;
    category: string;
    color: string;
    description?: string;
    imageUrl?: string;
    // Backend field names
    note?: string;
    image?: string;
    // Styler-specific fields
    skinTone?: SkinTone;
    gender?: Gender;
    age?: number;
    // Partner-specific fields
    size?: string;
    price?: number;
    occasion?: Occasion[]; // Array of occasions (1-4)
    stock?: number;
}

export interface UpdateClothesInput extends Partial<CreateClothesInput> {
    id: string;
}

export interface PartnerClothesInput {
    name: string;
    category: string;
    color: string;
    brand: string;
    price: number;
    stock?: number;
    image?: string;
    description?: string;
    note?: string;
    visibility?: 'public' | 'private';
}

