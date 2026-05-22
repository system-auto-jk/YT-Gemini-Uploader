import { NextRequest, NextResponse } from 'next/server'
import { suggestMetadata } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = await suggestMetadata(body)
  return NextResponse.json(data)
}
