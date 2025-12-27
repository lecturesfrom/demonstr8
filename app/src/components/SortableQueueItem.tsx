'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type SubmissionStatus = 'pending' | 'approved' | 'playing' | 'skipped' | 'done'

interface SortableQueueItemProps {
  submission: {
    id: string
    track_title: string
    artist_name: string
    file_url: string | null
    status: SubmissionStatus
  }
  onPlay?: (id: string) => void
  onSkip?: (id: string) => void
  isHost?: boolean
  isLoading?: {
    play: boolean
    skip: boolean
  }
}

export function SortableQueueItem({
  submission,
  onPlay,
  onSkip,
  isHost = false,
  isLoading = { play: false, skip: false }
}: SortableQueueItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: submission.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const { id, track_title, artist_name, file_url, status } = submission

  // Determine card styling based on status
  const getCardClasses = () => {
    const base = 'rounded-sm p-6 mb-4 transition-all duration-150'

    switch (status) {
      case 'approved':
        return `${base} bg-dw-surface border border-dw-success ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`
      case 'playing':
        return `${base} bg-dw-accent/10 border border-dw-accent`
      default:
        return `${base} bg-dw-surface border border-border-dw-muted`
    }
  }

  return (
    <div ref={setNodeRef} style={style} className={getCardClasses()}>
      <div className="flex items-center justify-between">
        {/* Drag Handle and Content */}
        <div className="flex items-center flex-1 min-w-0" {...attributes} {...listeners}>
          {/* Drag Handle Icon */}
          {status === 'approved' && isHost && (
            <div className="mr-4 text-dw-muted hover:text-dw-text cursor-grab">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7 2a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0zM7 18a2 2 0 11-4 0 2 2 0 014 0zM17 2a2 2 0 11-4 0 2 2 0 014 0zM17 10a2 2 0 11-4 0 2 2 0 014 0zM17 18a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-dw-text mb-1 truncate">
              {track_title}
            </h3>
            <p className="text-base text-dw-text-muted mb-2 truncate">
              {artist_name}
            </p>
            {/* File ready indicator */}
            {file_url ? (
              <span className="text-sm text-dw-success">✓ Ready</span>
            ) : (
              <span className="text-sm text-dw-muted animate-pulse">⏳ Processing</span>
            )}
            {status === 'playing' && (
              <span className="ml-3 text-sm text-dw-accent uppercase tracking-wider">
                🎵 Playing
              </span>
            )}
          </div>
        </div>

        {/* Host Actions */}
        {isHost && status === 'approved' && (
          <div className="flex gap-2 ml-4">
            {/* THE 1% ACCENT - Only solid accent background in the UI */}
            <button
              onClick={() => onPlay?.(id)}
              disabled={!file_url || isLoading.play}
              className="bg-dw-accent text-dw-base px-6 py-3 rounded-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {isLoading.play ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-dw-base/30 border-t-dw-base rounded-full animate-spin" />
                  Playing...
                </>
              ) : (
                'Play'
              )}
            </button>
            <button
              onClick={() => onSkip?.(id)}
              disabled={isLoading.skip}
              className="border border-dw-alert text-dw-alert px-4 py-2 rounded-sm hover:bg-dw-alert/10 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading.skip ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-dw-alert/30 border-t-dw-alert rounded-full animate-spin" />
                  Skipping...
                </>
              ) : (
                'Skip'
              )}
            </button>
          </div>
        )}

        {isHost && status === 'playing' && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onSkip?.(id)}
              disabled={isLoading.skip}
              className="border border-dw-alert text-dw-alert px-4 py-2 rounded-sm hover:bg-dw-alert/10 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading.skip ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-dw-alert/30 border-t-dw-alert rounded-full animate-spin" />
                  Skipping...
                </>
              ) : (
                'Skip'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}