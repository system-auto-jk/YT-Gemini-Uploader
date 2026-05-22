import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enqueue } from '@/lib/bull'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { videoId, meta, publishAt, visibility } = body

  await prisma.video.update({
    where: { id: videoId },
    data: {
      title: meta.title,
      description: meta.description,
      tags: meta.tags || [],
      chapters: meta.chapters || undefined,
      publishAt: publishAt ? new Date(publishAt) : undefined,
      visibility: visibility || 'PRIVATE',
      status: 'QUEUED',
    },
  })

  await enqueue('upload', { videoId, meta })
  return NextResponse.json({ ok: true })
}
