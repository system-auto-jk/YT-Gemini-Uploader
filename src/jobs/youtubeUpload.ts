import { prisma } from '@/lib/prisma'
import { getOAuthClient } from '@/lib/auth'
import { uploadResumable, setThumbnail } from '@/lib/youtube'
import { logFor } from '@/lib/logger'

export async function uploadToYouTube(data: { videoId: string; meta: any; thumbnailPath?: string; }) {
  const video = await prisma.video.findUnique({ where: { id: data.videoId }, include: { owner: true } })
  if (!video || !video.owner?.token) throw new Error('Video/owner not found')

  const log = logFor(video.id)
  const oauth = getOAuthClient()
  oauth.setCredentials(video.owner.token as any)

  const res = await uploadResumable({
    oauth,
    filepath: video.filepath,
    title: data.meta.title,
    description: data.meta.description,
    tags: data.meta.tags,
    visibility: (video.visibility.toLowerCase() as any),
    publishAt: video.publishAt?.toISOString(),
  })

  const vidId = (res as any).id as string
  await prisma.video.update({ where: { id: video.id }, data: { ytVideoId: vidId, status: 'UPLOADING' } })
  log('info', `YouTube id: ${vidId}`)

  if (data.thumbnailPath) {
    await setThumbnail({ oauth, videoId: vidId, imagePath: data.thumbnailPath })
    log('info', 'Thumbnail set')
  }

  await prisma.video.update({ where: { id: video.id }, data: { status: 'PUBLISHED' } })
  log('info', 'Done')
  return { ytVideoId: vidId }
}
