import * as z from 'zod';
import { PARTNER_CATEGORIES } from '@/types/clothes';

const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'brown', 'pink', 'purple', 'orange', 'beige', 'navy', 'maroon', 'teal', 'coral', 'multi', 'gold', 'silver'] as const;

export const addPartnerClothSchema = z.object({
    name: z
        .string()
        .min(3, 'Product name must be at least 3 characters')
        .max(100, 'Product name must not exceed 100 characters')
        .regex(/^[a-zA-Z0-9\s\-&',\.]+$/, 'Product name contains invalid characters'),
    brand: z
        .string()
        .min(2, 'Brand name must be at least 2 characters')
        .max(50, 'Brand name must not exceed 50 characters'),
    category: z.string().refine((val) => PARTNER_CATEGORIES.includes(val as any), {
        message: 'Please select a valid category',
    }),
    color: z.string().refine((val) => colors.includes(val as any), {
        message: 'Please select a valid color',
    }),
    price: z
        .string()
        .min(1, 'Price is required')
        .refine((val) => {
            const num = parseFloat(val);
            return !isNaN(num) && num > 0 && num <= 25000;
        }, 'Price must be between LKR 1 and LKR 25,000'),
    stock: z
        .string()
        .min(1, 'Stock quantity is required')
        .refine((val) => {
            const num = parseInt(val);
            return !isNaN(num) && num >= 0 && num <= 50;
        }, 'Stock must be between 0 and 50'),
    size: z.string().min(1, 'Please select a size'),
    visibility: z.enum(['public', 'private']),
    description: z
        .string()
        .max(500, 'Description must be 500 characters or less')
        .optional(),
    imageUrl: z
        .string()
        .min(1, 'Please upload a product image')
        .url('Invalid image URL'),
    suitableSkinTones: z
        .array(z.string())
        .min(1, 'Please select at least one suitable skin tone')
        .max(6, 'Maximum 6 skin tones allowed'),
    occasion: z
        .array(z.string())
        .min(1, 'Please select at least one occasion')
        .max(4, 'Maximum 4 occasions allowed'),
});

export type AddPartnerClothFormValues = z.infer<typeof addPartnerClothSchema>;
