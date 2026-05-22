import { google } from '@googleapis/youtube'
import { OAuth2Client } from 'google-auth-library'
import fs from 'fs'

export function getYouTube(oauth: OAuth2Client) {
  return google.youtube({ version: 'v3', auth: oauth })
}

export async function uploadResumable({
  oauth, filepath, title, description, tags, visibility, publishAt,
}: {
  oauth: OAuth2Client;
  filepath: string;
  title: string;
  description?: string;
  tags?: string[];
  visibility?: 'public'|'unlisted'|'private';
  publishAt?: string;
}) {
  const youtube = getYouTube(oauth)
  const stream = fs.createReadStream(filepath) as any

  const res = await youtube.videos.insert({
    part: ['snippet','status'],
    requestBody: {
      snippet: { title, description, tags },
      status: {
        privacyStatus: visibility ?? 'private',
        publishAt,
        selfDeclaredMadeForKids: false,
      },
    },
    media: { body: stream },
  })
  return res.data
}

export async function setThumbnail({
  oauth, videoId, imagePath,
}: { oauth: OAuth2Client; videoId: string; imagePath: string; }) {
  const youtube = getYouTube(oauth)
  const media = { body: fs.createReadStream(imagePath) as any }
  const res = await youtube.thumbnails.set({ videoId, media })
  return res.data
}
