import { Queue, QueueEvents, JobsOptions } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL!)
export const videoQueue = new Queue('videoQueue', { connection })
export const queueEvents = new QueueEvents('videoQueue', { connection })

export async function enqueue(name: string, payload: any, opts?: JobsOptions) {
  return videoQueue.add(name, payload, opts)
}
