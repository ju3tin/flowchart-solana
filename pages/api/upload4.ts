// pages/api/upload4.ts

import { v2 as cloudinary } from 'cloudinary';
import type { NextApiRequest, NextApiResponse } from 'next';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body.file;
    
    if (!formData) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const result = await cloudinary.uploader.upload(formData);
    return res.status(200).json(result);

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
