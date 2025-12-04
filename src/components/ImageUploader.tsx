// src/components/ImageUploader.tsx
import { useState, ChangeEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface ImageUploaderProps {
  onUploadComplete?: (imageUrl: string) => void;
  useCloudinaryDirect?: boolean;
}

export default function ImageUploader({ onUploadComplete, useCloudinaryDirect = false }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // Upload directly to Cloudinary (client-side)
  const uploadToCloudinary = async () => {
    if (!file) return alert("Choose an image first");
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      return alert("Cloudinary not configured");
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        onUploadComplete?.(data.secure_url);
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setUploading(false);
    }
  };

  // Upload via backend API
  const uploadViaBackend = async () => {
    if (!file) return alert("Choose an image first");
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.imageUrl);
        onUploadComplete?.(data.imageUrl);
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = () => {
    if (useCloudinaryDirect && CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
      uploadToCloudinary();
    } else {
      uploadViaBackend();
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={onFileChange} />
      {preview && (
        <div>
          <img src={preview} alt="preview" style={{ width: 150, height: "auto" }} />
        </div>
      )}
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {imageUrl && (
        <div>
          <p>Uploaded image:</p>
          <img src={imageUrl} alt="uploaded" style={{ width: 200 }} />
        </div>
      )}
    </div>
  );
}
