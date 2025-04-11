'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.text(); // If the response is not JSON
        throw new Error(`Upload failed: ${errorData}`);
      }
      
      const data = await res.json();
      console.log('File uploaded:', data.url);

  return (
    <div className="p-4">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={handleUpload} className="mt-2 p-2 bg-blue-500 text-white">
        Upload
      </button>
    </div>
  );
}
}
