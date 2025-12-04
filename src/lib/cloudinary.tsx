import Image from 'next/image';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

interface CloudinaryImageProps {
    publicId: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    transformations?: {
        quality?: 'auto' | number;
        format?: 'auto' | 'webp' | 'jpg' | 'png';
        crop?: 'fill' | 'fit' | 'scale' | 'thumb';
        gravity?: 'auto' | 'face' | 'center';
    };
}

/**
 * Build a Cloudinary URL with transformations
 */
export function buildCloudinaryUrl(
    publicIdOrUrl: string,
    options?: {
        width?: number;
        height?: number;
        quality?: 'auto' | number;
        format?: 'auto' | 'webp' | 'jpg' | 'png';
        crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    }
): string {
    // If it's already a full URL, return it
    if (publicIdOrUrl.startsWith('http')) {
        return publicIdOrUrl;
    }

    if (!CLOUDINARY_CLOUD_NAME) {
        console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
        return publicIdOrUrl;
    }

    const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options || {};

    let transformation = `f_${format},q_${quality}`;
    if (width) transformation += `,w_${width}`;
    if (height) transformation += `,h_${height}`;
    if (crop) transformation += `,c_${crop}`;

    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/${publicIdOrUrl}`;
}

/**
 * Upload an image to Cloudinary directly from the client
 */
export async function uploadToCloudinary(file: File): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration is missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
    );

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.secure_url;
}

/**
 * CloudinaryImage component using Next.js Image
 */
export function CloudinaryImage({
    publicId,
    alt,
    width,
    height,
    className,
    transformations = {},
}: CloudinaryImageProps) {
    const { quality = 'auto', format = 'auto', crop = 'fill', gravity = 'auto' } = transformations;

    // If publicId is already a full URL, use it directly
    if (publicId.startsWith('http')) {
        return (
            <Image
                src={publicId}
                alt={alt}
                width={width}
                height={height}
                className={className}
            />
        );
    }

    if (!CLOUDINARY_CLOUD_NAME) {
        return <img src={publicId} alt={alt} width={width} height={height} className={className} />;
    }

    const src = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_${format},q_${quality},w_${width},h_${height},c_${crop},g_${gravity}/${publicId}`;

    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
        />
    );
}
