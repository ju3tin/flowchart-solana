import { put } from '@vercel/blob';
import { NextRequest } from 'next/server'; // If using App Router

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return new Response('No file uploaded.', { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: 'public', // or 'private' if you want secured files
  });

  return Response.json(blob); // blob.url is the file URL!
}
