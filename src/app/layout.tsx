import './globals.css'
import React from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-6xl mx-auto p-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">YT Gemini Uploader</h1>
            <a className="px-4 py-2 rounded-xl bg-black text-white" href="/api/auth/login">Conectar Google</a>
          </header>
          <main className="mt-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
