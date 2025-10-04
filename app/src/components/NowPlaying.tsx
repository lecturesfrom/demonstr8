/**
 * NowPlaying Component
 *
 * What: Displays currently playing track
 * Why: Shows what's live on both host dashboard and public live page
 * How it helps users: Everyone sees the same "Now Playing" in real-time
 */

import { ProcessingBadge } from './ProcessingBadge'

interface NowPlayingProps {
  submission: {
    track_title: string
    artist_name: string
    playback_id: string | null
  } | null
}

export function NowPlaying({ submission }: NowPlayingProps) {
  if (!submission) {
    return (
      <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-8 text-center">
        <p className="text-dw-muted dw-body">No track playing</p>
        <p className="text-dw-text-muted text-sm mt-2">
          Approve a track and click Play to start
        </p>
      </div>
    )
  }

  return (
    <div className="bg-dw-surface border border-dw-accent rounded-sm p-8">
      <span className="dw-label text-dw-muted mb-4 block">Now Playing</span>
      <h2 className="dw-h2 text-dw-text mb-2">{submission.track_title}</h2>
      <p className="dw-body text-dw-text-muted mb-4">{submission.artist_name}</p>
      <ProcessingBadge playback_id={submission.playback_id} />
    </div>
  )
}
