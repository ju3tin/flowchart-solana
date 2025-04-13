// pages/api/uploadBox.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import FormData from 'form-data';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileContent, fileName } = req.body;

    if (!fileContent || !fileName) {
      return res.status(400).json({ error: 'Missing file content or file name.' });
    }

    const form = new FormData();
    form.append('attributes', JSON.stringify({
      name: fileName,
      parent: { id: '0' } // '0' means upload to root folder
    }));
    form.append('file', Buffer.from(fileContent, 'base64'), fileName);

    const response = await axios.post(
      'https://upload.box.com/api/2.0/files/content',
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.BOX_ACCESS_TOKEN}`, // Your Box token
          ...form.getHeaders(),
        },
      }
    );

    return res.status(200).json({ file: response.data });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: error.response?.data || error.message });
  }
}
