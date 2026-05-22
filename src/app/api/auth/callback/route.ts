import { NextRequest, NextResponse } from 'next/server'
import { getOAuthClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const client = getOAuthClient()
  const { tokens } = await client.getToken(code)
  client.setCredentials(tokens)

  const idToken = tokens.id_token!
  const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
  const payload = ticket.getPayload()!
  const email = payload.email!

  const user = await prisma.user.upsert({
    where: { email },
    update: { token: tokens, googleId: payload.sub },
    create: { email, token: tokens, googleId: payload.sub, name: payload.name },
  })

  const res = NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL))
  res.cookies.set('uid', user.id, { httpOnly: true, path: '/' })
  return res
}
