import * as z from 'zod';
import { CATEGORIES, COLORS, OCCASIONS, SKIN_TONES } from '@/types/clothes';

export const addClothesSchema = z.object({
    name: z
        .string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must not exceed 100 characters')
        .regex(/^[a-zA-Z0-9\s\-&',\.]+$/, 'Name contains invalid characters'),
    category: z.string().refine((val) => CATEGORIES.includes(val as any), {
        message: 'Please select a valid category',
    }),
    color: z.string().refine((val) => COLORS.includes(val as any), {
        message: 'Please select a valid color',
    }),
    occasion: z
        .array(z.string())
        .min(1, 'Please select at least 1 occasion')
        .max(4, 'Please select maximum 4 occasions')
        .refine((items) => items.every((item) => OCCASIONS.includes(item as any)), {
            message: 'Invalid occasion selected',
        }),
    skinTone: z
        .array(z.string())
        .min(1, 'Please select at least one suitable skin tone')
        .max(6, 'Maximum 6 skin tones allowed')
        .refine((items) => items.every((item) => SKIN_TONES.includes(item as any)), {
            message: 'Invalid skin tone selected',
        }),
    description: z
        .string()
        .max(500, 'Description must be 500 characters or less')
        .optional(),
    imageUrl: z
        .string()
        .min(1, 'Please upload a clothes image')
        .url('Invalid image URL'),
});

export type AddClothesFormValues = z.infer<typeof addClothesSchema>;
