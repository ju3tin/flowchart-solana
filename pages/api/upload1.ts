// /api/upload1.ts
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const runtime = 'edge'

async function handler(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new Response(
      "Missing BLOB_READ_WRITE_TOKEN. Don't forget to add that to your .env file.",
      { status: 401 }
    )
  }

  const body = req.body;
  if (!body) {
    return new Response('No file found in request body.', { status: 400 });
  }

  // Read the stream into an ArrayBuffer
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let done, value;

  // Read the stream until done
  while (true) {
    const result = await reader.read();
    done = result.done;
    value = result.value;

    if (value) {
      chunks.push(value); // Only push if value is defined
    }

    if (done) break; // Exit the loop if done
  }

  // Combine chunks into a single Uint8Array
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const fileBuffer = new Uint8Array(totalLength);
  let position = 0;

  for (const chunk of chunks) {
    fileBuffer.set(chunk, position);
    position += chunk.length;
  }

  // Convert Uint8Array to Buffer
  const buffer = Buffer.from(fileBuffer);

  const filename = req.headers.get('x-vercel-filename') || 'file.txt';
  const contentType = req.headers.get('content-type') || 'text/plain';
  const fileType = `.${contentType.split('/')[1]}`;

  const finalName = filename.includes(fileType)
    ? filename
    : `${filename}${fileType}`;

  const blob = await put(finalName, buffer, {
    contentType,
    access: 'public'
  });

  return NextResponse.json(blob);
}

// 🧨 ADD THIS
export default handler;
