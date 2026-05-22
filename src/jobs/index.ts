import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import { processVideo } from './videoProcess'
import { uploadToYouTube } from './youtubeUpload'

const connection = new IORedis(process.env.REDIS_URL!)

new Worker('videoQueue', async job => {
  if (job.name === 'process') return processVideo(job.data)
  if (job.name === 'upload') return uploadToYouTube(job.data)
}, { connection })

console.log('BullMQ worker running...')
