import React from 'react'

interface TrackInfoProps {
  trackTitle: string | null
  artistName: string | null
  fileUrl: string | null
  status?: 'pending' | 'approved' | 'playing' | 'skipped' | 'done'
  variant?: 'default' | 'large'
}

export const TrackInfo: React.FC<TrackInfoProps> = ({
  trackTitle,
  artistName,
  fileUrl,
  status,
  variant = 'default'
}) => {
  const titleClass = variant === 'large'
    ? 'dw-h2 text-dw-text mb-2'
    : 'text-xl font-bold text-dw-text mb-1 truncate'

  const artistClass = variant === 'large'
    ? 'dw-body text-dw-text-muted mb-4'
    : 'text-base text-dw-text-muted mb-2 truncate'

  return (
    <>
      <h3 className={titleClass}>
        {trackTitle || 'Untitled Track'}
      </h3>
      <p className={artistClass}>
        {artistName || 'Unknown Artist'}
      </p>
      {/* File ready indicator */}
      {/* File ready indicator */}
      {fileUrl ? (
        <span className="text-sm text-dw-success" aria-label="File ready">✓ Ready</span>
      ) : (
        <span className="text-sm text-dw-muted animate-pulse" aria-label="File processing">⏳ Processing</span>
      )}
      {status === 'playing' && (
        <span className="ml-3 text-sm text-dw-accent uppercase tracking-wider" aria-label="Currently playing">
          🎵 Playing
        </span>
      )}
    </>
  )
}