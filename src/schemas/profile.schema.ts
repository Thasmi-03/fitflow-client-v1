import * as z from 'zod';

/**
 * Partner profile update validation schema
 */
export const partnerProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Shop name must be at least 2 characters')
        .max(100, 'Shop name must not exceed 100 characters'),
    phone: z
        .string()
        .min(1, 'Phone number is required')
        .refine((phone) => {
            // Remove spaces and special characters for validation
            const cleaned = phone.replace(/[\s\-\(\)]/g, '');

            // Sri Lankan mobile: 0771234567 (10 digits starting with 07)
            const localMobile = /^07[0-9]{8}$/;

            // Sri Lankan landline: 0112345678 (10 digits, area code + number)
            const localLandline = /^0[1-9][0-9]{8}$/;

            // International format: +94771234567 or 94771234567
            const intlMobile = /^(\+?94|94)7[0-9]{8}$/;
            const intlLandline = /^(\+?94|94)[1-9][0-9]{8}$/;

            return localMobile.test(cleaned) ||
                localLandline.test(cleaned) ||
                intlMobile.test(cleaned) ||
                intlLandline.test(cleaned);
        }, 'Please enter a valid Sri Lankan phone number (e.g., 0771234567 or +94771234567)'),
    location: z
        .string()
        .min(10, 'Location must be at least 10 characters')
        .max(200, 'Location must not exceed 200 characters'),
    profilePhoto: z.string().optional(),
});

export type PartnerProfileFormValues = z.infer<typeof partnerProfileSchema>;

/**
 * Styler profile update validation schema
 */
export const stylerProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters'),
    skinTone: z.enum(['fair', 'light', 'medium', 'tan', 'deep', 'dark'], {
        message: 'Please select a valid skin tone',
    }),
    preferredStyle: z
        .string()
        .max(50, 'Preferred style must not exceed 50 characters')
        .optional(),
    profilePhoto: z.string().optional(),
});

export type StylerProfileFormValues = z.infer<typeof stylerProfileSchema>;
