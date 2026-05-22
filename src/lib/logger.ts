import { prisma } from './prisma'

export function logFor(videoId: string) {
  return async (level: 'info'|'warn'|'error', message: string) => {
    await prisma.log.create({ data: { videoId, level, message } })
    console.log(`[${level}]`, message)
  }
}
