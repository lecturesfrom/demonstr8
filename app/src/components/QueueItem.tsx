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

import { useState } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)

  // Wrapper handlers with loading state
  const handleApproveClick = async () => {
    if (loading) return
    setLoading(true)
    try {
      await onApprove?.(id)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayClick = async () => {
    if (loading) return
    setLoading(true)
    try {
      await onPlay?.(id)
    } finally {
      setLoading(false)
    }
  }

  const handleSkipClick = () => {
    setShowSkipConfirm(true)
  }

  const handleConfirmSkip = async () => {
    if (loading) return
    setLoading(true)
    setShowSkipConfirm(false)
    try {
      await onSkip?.(id)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSkip = () => {
    setShowSkipConfirm(false)
  }

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
                onClick={handleApproveClick}
                disabled={loading}
                className="border border-border-dw-strong text-dw-text px-4 py-2 rounded-sm hover:bg-dw-surface-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Approve
              </button>
            )}

            {status === 'approved' && (
              <>
                {/* THE 1% ACCENT - Only solid accent background in the UI */}
                <button
                  onClick={handlePlayClick}
                  disabled={!playback_id || loading}
                  className="bg-dw-accent text-dw-base px-6 py-3 rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Play
                </button>
                {!showSkipConfirm ? (
                  <button
                    onClick={handleSkipClick}
                    disabled={loading}
                    className="border border-dw-alert text-dw-alert px-4 py-2 rounded-sm hover:bg-dw-alert/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Skip
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleConfirmSkip}
                      disabled={loading}
                      className="bg-dw-alert text-dw-text px-4 py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading && (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      Confirm Skip
                    </button>
                    <button
                      onClick={handleCancelSkip}
                      className="border border-border-dw-muted text-dw-text px-4 py-2 rounded-sm hover:bg-dw-surface-alt transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </>
            )}

            {status === 'playing' && (
              <>
                {!showSkipConfirm ? (
                  <button
                    onClick={handleSkipClick}
                    disabled={loading}
                    className="border border-dw-alert text-dw-alert px-4 py-2 rounded-sm hover:bg-dw-alert/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Skip
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleConfirmSkip}
                      disabled={loading}
                      className="bg-dw-alert text-dw-text px-4 py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading && (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      Confirm Skip
                    </button>
                    <button
                      onClick={handleCancelSkip}
                      className="border border-border-dw-muted text-dw-text px-4 py-2 rounded-sm hover:bg-dw-surface-alt transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
