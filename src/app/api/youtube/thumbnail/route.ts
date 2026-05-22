import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Recebe imagem e associa ao vídeo; worker aplicará após upload
  return NextResponse.json({ ok: true })
}
