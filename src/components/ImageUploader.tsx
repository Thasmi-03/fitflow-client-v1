// src/components/ImageUploader.tsx
import { useState, ChangeEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface ImageUploaderProps {
  onUploadComplete?: (imageUrl: string) => void;
  onUploadStart?: () => void;
  useCloudinaryDirect?: boolean;
  autoUpload?: boolean;
}

export default function ImageUploader({
  onUploadComplete,
  onUploadStart,
  useCloudinaryDirect = false,
  autoUpload = true
}: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));

    if (autoUpload) {
      handleUpload(f);
    }
  };

  // Upload directly to Cloudinary (client-side)
  const uploadToCloudinary = async (fileToUpload: File) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      return alert("Cloudinary not configured");
    }

    setUploading(true);
    onUploadStart?.();

    const formData = new FormData();
    formData.append("file", fileToUpload);
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
  const uploadViaBackend = async (fileToUpload: File) => {
    setUploading(true);
    onUploadStart?.();

    const formData = new FormData();
    formData.append("image", fileToUpload);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.details || data.error || "Upload failed");
      }

      if (data.success) {
        setImageUrl(data.imageUrl);
        onUploadComplete?.(data.imageUrl);
      } else {
        throw new Error(data.message || data.error || "Upload failed");
      }
    } catch (err: any) {
      console.error("Upload error details:", err);
      alert(`Upload error: ${err.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = (fileToUpload: File = file!) => {
    if (!fileToUpload) return alert("Choose an image first");

    if (useCloudinaryDirect && CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
      uploadToCloudinary(fileToUpload);
    } else {
      uploadViaBackend(fileToUpload);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={onFileChange} />
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="preview" style={{ width: 150, height: "auto" }} />
        </div>
      )}

      {!autoUpload && (
        <button onClick={() => handleUpload()} disabled={uploading} className="mt-2">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      )}

      {uploading && autoUpload && (
        <div className="mt-2 text-sm text-gray-500">Uploading...</div>
      )}

      {imageUrl && !autoUpload && (
        <div className="mt-2">
          <p>Uploaded image:</p>
          <img src={imageUrl} alt="uploaded" style={{ width: 200 }} />
        </div>
      )}
    </div>
  );
}
