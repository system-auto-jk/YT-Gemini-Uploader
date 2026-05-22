import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-pro-exp-02-05'

export async function suggestMetadata(input: {
  brief: string
  transcript?: string
  channelTone?: 'educational'|'entertainment'|'news'|'product'|'vlog'
  keywords?: string[]
  language?: 'pt-BR'|'en'
}) {
  const model = genAI.getGenerativeModel({ model: modelName })
  const prompt = `Você é um especialista em YouTube SEO. Gere metadados otimizados:
- Idioma: ${input.language || 'pt-BR'}
- Tom do canal: ${input.channelTone || 'educational'}
- Brief: ${input.brief}
- Palavras-chave: ${(input.keywords||[]).join(', ')}
- Transcrição (se houver): ${input.transcript?.slice(0, 4000) || 'N/A'}

Responda em JSON com campos: {
  "title": string,
  "description": string,
  "tags": string[],
  "chapters": [{"time":"MM:SS","title":string}],
  "thumbnailIdea": string
}`

  const resp = await model.generateContent(prompt)
  const text = resp.response.text()
  try { return JSON.parse(text) } catch { return { raw: text } as any }
}
