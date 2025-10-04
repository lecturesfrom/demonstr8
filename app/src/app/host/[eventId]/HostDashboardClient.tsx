'use client'

import { useRealtimeQueue } from '@/lib/hooks/useRealtimeQueue'
import { useRealtimeNowPlaying } from '@/lib/hooks/useRealtimeNowPlaying'
import { QueueItem } from '@/components/QueueItem'
import { NowPlaying } from '@/components/NowPlaying'

interface HostDashboardClientProps {
  eventId: string
  eventName: string
}

export default function HostDashboardClient({ eventId, eventName }: HostDashboardClientProps) {
  const { submissions, loading: queueLoading } = useRealtimeQueue(eventId)
  const { nowPlaying, loading: npLoading } = useRealtimeNowPlaying(eventId)

  const handleApprove = async (submissionId: string) => {
    await fetch('/api/queue/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    })
  }

  const handlePlay = async (submissionId: string) => {
    await fetch('/api/queue/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, eventId }),
    })
  }

  const handleSkip = async (submissionId: string) => {
    await fetch('/api/queue/skip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    })
  }

  if (queueLoading || npLoading) {
    return (
      <div className="min-h-screen bg-dw-base flex items-center justify-center">
        <p className="text-dw-muted">Loading dashboard...</p>
      </div>
    )
  }

  // Filter submissions by status
  const pending = submissions.filter((s) => s.status === 'pending')
  const approved = submissions.filter((s) => s.status === 'approved')
  const done = submissions.filter((s) => s.status === 'done' || s.status === 'skipped')

  return (
    <div className="min-h-screen bg-dw-base p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-dw-text mb-2">Host Dashboard</h1>
          <p className="text-dw-text-muted">Managing: {eventName}</p>
        </div>

        {/* Now Playing */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dw-text mb-4">Now Playing</h2>
          <NowPlaying submission={nowPlaying} />
        </div>

        {/* Queue Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending */}
          <div>
            <h3 className="text-xl font-bold text-dw-text mb-4">
              Pending ({pending.length})
            </h3>
            <div className="space-y-4">
              {pending.length === 0 ? (
                <p className="text-dw-muted text-sm">No pending submissions</p>
              ) : (
                pending.map((sub) => (
                  <QueueItem
                    key={sub.id}
                    submission={sub}
                    onApprove={handleApprove}
                    isHost
                  />
                ))
              )}
            </div>
          </div>

          {/* Approved/Queue */}
          <div>
            <h3 className="text-xl font-bold text-dw-text mb-4">
              Queue ({approved.length})
            </h3>
            <div className="space-y-4">
              {approved.length === 0 ? (
                <p className="text-dw-muted text-sm">No approved tracks</p>
              ) : (
                approved.map((sub) => (
                  <QueueItem
                    key={sub.id}
                    submission={sub}
                    onPlay={handlePlay}
                    onSkip={handleSkip}
                    isHost
                  />
                ))
              )}
            </div>
          </div>

          {/* Done/History */}
          <div>
            <h3 className="text-xl font-bold text-dw-text mb-4">
              History ({done.length})
            </h3>
            <div className="space-y-4">
              {done.length === 0 ? (
                <p className="text-dw-muted text-sm">No completed tracks</p>
              ) : (
                done.map((sub) => (
                  <QueueItem key={sub.id} submission={sub} isHost={false} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}