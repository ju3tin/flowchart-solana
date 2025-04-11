// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { put } from '@vercel/blob';

const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for simplicity

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to use multer
  },
};

const handler = upload.single('file'), async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const file = req.file; // Access the uploaded file

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const blob = await put(file.originalname, file.buffer, { access: 'public' });

    res.status(200).json(blob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export default handler;
