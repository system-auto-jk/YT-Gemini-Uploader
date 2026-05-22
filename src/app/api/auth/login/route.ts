import { NextRequest, NextResponse } from 'next/server'
import { getOAuthClient, YT_SCOPES } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const client = getOAuthClient()
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: YT_SCOPES,
    prompt: 'consent',
  })
  return NextResponse.redirect(url)
}
