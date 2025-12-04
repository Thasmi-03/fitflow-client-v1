# FitFlow Frontend - Production Deployment Guide

This guide covers deploying the Next.js frontend to production with backend API and Cloudinary integration.

## Environment Variables

Set these environment variables in your deployment platform:

```bash
# Required: Backend API URL
NEXT_PUBLIC_API_URL=https://api-v1-cyan.vercel.app

# Optional: Cloudinary Configuration (for direct image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Deployment Commands

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run start
```

## Configuration Summary

### 1. API Client (`src/lib/api/client.ts`)
- Uses `NEXT_PUBLIC_API_URL` environment variable
- Falls back to `localhost:5000` for local development
- All API calls go through this centralized client

### 2. Next.js Config (`next.config.ts`)
- Cloudinary images enabled via `remotePatterns`
- Standalone output mode for containerized deployments
- Supports images from:
  - `res.cloudinary.com`
  - `images.unsplash.com`
  - `via.placeholder.com`

### 3. Image Uploads
Two options available:
- **Backend Upload**: Via `/api/upload` endpoint on your backend
- **Direct Cloudinary**: Client-side upload when Cloudinary env vars are set

## Cloudinary Setup

1. Create a Cloudinary account at https://cloudinary.com
2. Go to Settings > Upload > Upload presets
3. Create an **unsigned** upload preset
4. Copy your Cloud Name and Upload Preset name
5. Set the environment variables

## Usage Examples

### Upload Image (Cloudinary Direct)
```tsx
import { uploadToCloudinary } from '@/lib/cloudinary';

const handleUpload = async (file: File) => {
  const url = await uploadToCloudinary(file);
  console.log('Uploaded:', url);
};
```

### Display Image with Next.js
```tsx
import Image from 'next/image';

<Image
  src="https://res.cloudinary.com/your_cloud/image/upload/sample.jpg"
  alt="Description"
  width={400}
  height={300}
/>
```

## Checklist Before Deployment

- [ ] Set `NEXT_PUBLIC_API_URL` to your live backend
- [ ] Verify backend CORS allows your frontend domain
- [ ] Set Cloudinary environment variables (if using)
- [ ] Test locally with production env vars
- [ ] Run `npm run build` to verify no build errors
