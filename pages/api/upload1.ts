import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const runtime = 'edge'

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new Response(
      "Missing BLOB_READ_WRITE_TOKEN. Don't forget to add that to your .env file.",
      {
        status: 401
      }
    )
  }

  const body = await req.blob()
  const arrayBuffer = await body.arrayBuffer()
  const fileBuffer = Buffer.from(arrayBuffer)

  const filename = req.headers.get('x-vercel-filename') || 'file.txt'
  const contentType = req.headers.get('content-type') || 'text/plain'
  const fileType = `.${contentType.split('/')[1]}`

  const finalName = filename.includes(fileType)
    ? filename
    : `${filename}${fileType}`

  const blob = await put(finalName, fileBuffer, {
    contentType,
    access: 'public'
  })

  return NextResponse.json(blob)
}
