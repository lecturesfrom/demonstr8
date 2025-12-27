'use client'

import { useRealtimeQueue } from '@/lib/hooks/useRealtimeQueue'
import { useRealtimeNowPlaying } from '@/lib/hooks/useRealtimeNowPlaying'
import { QueueItem } from '@/components/QueueItem'
import { NowPlaying } from '@/components/NowPlaying'
import { LivePlayer } from '@/components/LivePlayer'

interface LivePageClientProps {
  eventId: string
  eventName: string
  ivsPlaybackUrl: string | null
}

export default function LivePageClient({
  eventId,
  eventName,
  ivsPlaybackUrl
}: LivePageClientProps) {
  const { submissions } = useRealtimeQueue(eventId)
  const { nowPlaying } = useRealtimeNowPlaying(eventId)

  // Show only approved/playing tracks (not pending)
  const queue = submissions.filter(
    (s) => s.status === 'approved' || s.status === 'playing'
  )

  return (
    <div className="min-h-screen bg-dw-base p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-dw-text mb-4">{eventName}</h1>
          <div className="inline-flex items-center gap-2 bg-dw-accent/10 border border-dw-accent rounded-sm px-4 py-2">
            <span className="w-2 h-2 bg-dw-accent rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-dw-accent uppercase tracking-wider">
              Live Now
            </span>
          </div>
        </div>

        {/* Live Stream Player */}
        {ivsPlaybackUrl && (
          <div className="mb-8">
            <LivePlayer playbackUrl={ivsPlaybackUrl} eventName={eventName} />
          </div>
        )}

        {/* Two Column Layout for Queue and Now Playing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Now Playing */}
          <div>
            <h2 className="text-2xl font-bold text-dw-text mb-4">Now Playing</h2>
            <NowPlaying submission={nowPlaying} />
          </div>

          {/* Upcoming Queue */}
          <div>
            <h2 className="text-2xl font-bold text-dw-text mb-4">
              Up Next ({queue.length})
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {queue.length === 0 ? (
                <div className="bg-dw-surface border border-dw-muted rounded-sm p-8 text-center">
                  <p className="text-dw-muted">No tracks in queue</p>
                </div>
              ) : (
                queue.map((sub) => (
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