'use client'
import React, { useState } from 'react'

export default function NewVideoPage() {
  const [file, setFile] = useState<File|null>(null)
  const [brief, setBrief] = useState('')
  const [meta, setMeta] = useState<any>(null)

  async function handleUpload() {
    if (!file) return
    const fd = new FormData()
    fd.append('video', file)
    const r = await fetch('/api/upload/initiate', { method: 'POST', body: fd })
    const j = await r.json()
    ;(window as any).vid = j.id
    alert('Vídeo enviado! Agora gere os metadados.')
  }

  async function handleSuggest() {
    const r = await fetch('/api/gemini/suggest', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief, language: 'pt-BR', channelTone: 'educational' })
    })
    const j = await r.json()
    setMeta(j)
  }

  async function handlePublish() {
    if (!meta) return
    const videoId = (window as any).vid
    await fetch('/api/youtube/publish', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, meta, visibility: 'PRIVATE' })
    })
    alert('Agendado para publicar (fila). Confira no dashboard.')
  }

  return (
    <div className="grid gap-6">
      <div className="p-6 bg-white rounded-2xl shadow grid gap-4">
        <h2 className="text-xl font-semibold">Novo Vídeo</h2>
        <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button className="px-4 py-2 rounded-xl bg-slate-900 text-white" onClick={handleUpload}>Enviar arquivo</button>
      </div>

      <div className="p-6 bg-white rounded-2xl shadow grid gap-3">
        <h3 className="font-semibold">Brief para IA</h3>
        <textarea className="border rounded-xl p-3" rows={5} value={brief} onChange={e=>setBrief(e.target.value)} placeholder="Descreva o vídeo, público-alvo, objetivo, palavras-chave..."/>
        <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={handleSuggest}>Gerar metadados com Gemini</button>
        {meta && (
          <div className="mt-3 border rounded-xl p-3 bg-slate-50">
            <p><b>Título sugerido:</b> {meta.title}</p>
            <p className="whitespace-pre-wrap mt-2"><b>Descrição:</b> {meta.description}</p>
            {meta.tags && <p className="mt-2"><b>Tags:</b> {meta.tags.join(', ')}</p>}
            <button className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white" onClick={handlePublish}>Publicar no YouTube</button>
          </div>
        )}
      </div>
    </div>
  )
}
