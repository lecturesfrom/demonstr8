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

import { TrackInfo } from './common/TrackInfo'
import { ActionButton } from './common/ActionButton'
import type { SubmissionStatus } from '@/types'

interface QueueItemProps {
  submission: {
    id: string
    track_title: string
    artist_name: string
    file_url: string | null
    status: SubmissionStatus
  }
  onApprove?: (id: string) => void
  onPlay?: (id: string) => void
  onSkip?: (id: string) => void
  isHost?: boolean
  isLoading?: boolean
}

export function QueueItem({
  submission,
  onApprove,
  onPlay,
  onSkip,
  isHost = false,
  isLoading = false
}: QueueItemProps) {
  const { id, track_title, artist_name, file_url, status } = submission

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
          <TrackInfo
            trackTitle={track_title}
            artistName={artist_name}
            fileUrl={file_url}
            status={status}
          />
        </div>

        {/* Host Actions */}
        {isHost && (
          <div className="flex gap-2 ml-4">
            {status === 'pending' && (
              <ActionButton
                onClick={() => onApprove?.(id)}
                isLoading={isLoading}
                loadingText="Approving..."
                variant="secondary"
                className="border-border-dw-strong text-dw-text hover:bg-dw-surface-alt"
              >
                Approve
              </ActionButton>
            )}

            {status === 'approved' && (
              <>
                {/* THE 1% ACCENT - Only solid accent background in the UI */}
                <ActionButton
                  onClick={() => onPlay?.(id)}
                  disabled={!file_url}
                  variant="primary"
                  className="px-6 py-3 font-medium"
                >
                  Play
                </ActionButton>
                <ActionButton
                  onClick={() => onSkip?.(id)}
                  variant="danger"
                >
                  Skip
                </ActionButton>
              </>
            )}

            {status === 'playing' && (
              <ActionButton
                onClick={() => onSkip?.(id)}
                variant="danger"
              >
                Skip
              </ActionButton>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
