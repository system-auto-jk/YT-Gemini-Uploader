import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enqueue } from '@/lib/bull'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const uid = cookies().get('uid')?.value
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('video') as File
  if (!file) return NextResponse.json({ error: 'missing file' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const dir = path.join(process.cwd(), 'uploads', uid)
  await mkdir(dir, { recursive: true })
  const filename = `${randomUUID()}-${file.name}`
  const full = path.join(dir, filename)
  await new Promise<void>((resolve, reject) => {
    const ws = createWriteStream(full)
    ws.on('error', reject)
    ws.on('finish', () => resolve())
    ws.end(buffer)
  })

  const video = await prisma.video.create({ data: { ownerId: uid, filepath: full } })
  await enqueue('process', { videoId: video.id, path: full })

  return NextResponse.json({ id: video.id })
}
