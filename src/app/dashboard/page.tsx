import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const videos = await prisma.video.findMany({ orderBy: { createdAt: 'desc' }, take: 20 })
  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-semibold">Seus envios</h2>
      <div className="grid gap-3">
        {videos.map(v => (
          <div key={v.id} className="p-4 bg-white rounded-2xl shadow">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{v.title || '(sem título)'}</p>
                <p className="text-sm text-slate-500">
                  Status: {v.status} {v.ytVideoId ? ` • https://youtube.com/watch?v=${v.ytVideoId}` : ''}
                </p>
              </div>
              <span className="text-sm text-slate-500">{new Date(v.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
