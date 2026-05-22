import { logFor } from '@/lib/logger'
import { probe } from '@/lib/ffmpeg'

export async function processVideo(data: { videoId: string; path: string; }) {
  const log = logFor(data.videoId)
  const info = await probe(data.path)
  log('info', `Video streams: ${JSON.stringify(info.streams?.map((s:any)=>({codec:s.codec_name, w:s.width, h:s.height})))}`)
  return { ok: true }
}
