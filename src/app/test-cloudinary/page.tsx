'use client';

import { useState } from 'react';

export default function CloudinaryTestPage() {
    const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [result, setResult] = useState<string>('');
    const [imageUrl, setImageUrl] = useState<string>('');

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const testConnection = async () => {
        setStatus('testing');
        setResult('');

        // Check env vars
        if (!cloudName) {
            setStatus('error');
            setResult('❌ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
            return;
        }

        if (!uploadPreset) {
            setStatus('error');
            setResult('❌ NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not set');
            return;
        }

        try {
            // Upload a tiny 1x1 transparent PNG
            const formData = new FormData();
            formData.append('file', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
            formData.append('upload_preset', uploadPreset);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: 'POST', body: formData }
            );

            const data = await response.json();

            if (data.secure_url) {
                setStatus('success');
                setResult(`✅ Cloudinary is working!\n\nUploaded test image: ${data.secure_url}`);
                setImageUrl(data.secure_url);
            } else if (data.error) {
                setStatus('error');
                setResult(`❌ Cloudinary error: ${data.error.message}`);
            }
        } catch (err: any) {
            setStatus('error');
            setResult(`❌ Network error: ${err.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Cloudinary Connection Test</h1>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
                    <div className="space-y-2 font-mono text-sm">
                        <p>
                            <span className="text-gray-500">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:</span>{' '}
                            <span className={cloudName ? 'text-green-600' : 'text-red-600'}>
                                {cloudName || 'NOT SET'}
                            </span>
                        </p>
                        <p>
                            <span className="text-gray-500">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:</span>{' '}
                            <span className={uploadPreset ? 'text-green-600' : 'text-red-600'}>
                                {uploadPreset || 'NOT SET'}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Upload Test</h2>

                    <button
                        onClick={testConnection}
                        disabled={status === 'testing'}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {status === 'testing' ? 'Testing...' : 'Test Cloudinary Upload'}
                    </button>

                    {result && (
                        <pre className={`mt-4 p-4 rounded-lg text-sm whitespace-pre-wrap ${status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                            }`}>
                            {result}
                        </pre>
                    )}

                    {imageUrl && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Test image (1x1 transparent pixel):</p>
                            <img src={imageUrl} alt="Test upload" className="border rounded" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
