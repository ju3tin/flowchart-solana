'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    try {
      const res = await fetch('/api/upload4', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Upload failed: ${errorData}`);
      }

      const data = await res.json();
      console.log('Uploaded successfully:', data);
      setImageUrl(data.secure_url);
    } catch (err) {
      console.error(err);
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Upload to Cloudinary</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {imageUrl && (
        <div className="mt-6">
          <p>Uploaded Image:</p>
          <img src={imageUrl} alt="Uploaded" className="mt-2 max-w-full" />
        </div>
      )}
    </div>
  );
}
