/**
 * QueueItem Component
 *
 * What: Individual submission card in the queue
 * Why: Shows track info + status + host actions
 * How it helps users: Host can see all submission details and take action (approve/play/skip)
 *
 * States:
 * - pending: Not yet approved (gray border, Approve button)
 * - approved: Ready to play (green border, Play button - THE 1% ACCENT)
 * - playing: Currently active (accent background + border)
 * - skipped: Host skipped it (faded, gray border)
 */

'use client'

import { ProcessingBadge } from './ProcessingBadge'

type SubmissionStatus = 'pending' | 'approved' | 'playing' | 'skipped' | 'done'

interface QueueItemProps {
  submission: {
    id: string
    track_title: string
    artist_name: string
    playback_id: string | null
    status: SubmissionStatus
  }
  onApprove?: (id: string) => void
  onPlay?: (id: string) => void
  onSkip?: (id: string) => void
  isHost?: boolean
}

export function QueueItem({
  submission,
  onApprove,
  onPlay,
  onSkip,
  isHost = false
}: QueueItemProps) {
  const { id, track_title, artist_name, playback_id, status } = submission

  // Determine card styling based on status
  const getCardClasses = () => {
    const base = 'rounded-sm p-6 mb-4 transition-all duration-150'

    switch (status) {
      case 'pending':
        return `${base} bg-dw-surface border border-border-dw-muted`
      case 'approved':
        return `${base} bg-dw-surface border border-dw-success`
      case 'playing':
        // Playing state gets accent treatment (part of the 1% rule)
        return `${base} bg-dw-accent/10 border border-dw-accent`
      case 'skipped':
        return `${base} bg-dw-surface border border-border-dw-muted opacity-60`
      case 'done':
        return `${base} bg-dw-surface border border-border-dw-muted opacity-40`
      default:
        return `${base} bg-dw-surface border border-border-dw-muted`
    }
  }

  return (
    <div className={getCardClasses()}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-dw-text mb-1 truncate">
            {track_title}
          </h3>
          <p className="text-base text-dw-text-muted mb-2 truncate">
            {artist_name}
          </p>
          <ProcessingBadge playback_id={playback_id} />
          {status === 'playing' && (
            <span className="ml-3 text-sm text-dw-accent uppercase tracking-wider">
              🎵 Playing
            </span>
          )}
        </div>

        {/* Host Actions */}
        {isHost && (
          <div className="flex gap-2 ml-4">
            {status === 'pending' && (
              <button
                onClick={() => onApprove?.(id)}
                className="border border-border-dw-strong text-dw-text px-4 py-2 rounded-sm hover:bg-dw-surface-alt transition-colors"
              >
                Approve
              </button>
            )}

            {status === 'approved' && (
              <>
                {/* THE 1% ACCENT - Only solid accent background in the UI */}
                <button
                  onClick={() => onPlay?.(id)}
                  disabled={!playback_id}
                  className="bg-dw-accent text-dw-base px-6 py-3 rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                >
                  Play
                </button>
                <button
                  onClick={() => onSkip?.(id)}
                  className="border border-dw-alert text-dw-alert px-4 py-2 rounded-sm hover:bg-dw-alert/10 transition-colors"
                >
                  Skip
                </button>
              </>
            )}

            {status === 'playing' && (
              <button
                onClick={() => onSkip?.(id)}
                className="border border-dw-alert text-dw-alert px-4 py-2 rounded-sm hover:bg-dw-alert/10 transition-colors"
              >
                Skip
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
