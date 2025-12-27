/**
 * NowPlaying Component
 *
 * What: Displays currently playing track with audio player
 * Why: Shows what's live on both host dashboard and public live page
 * How it helps users: Everyone sees and HEARS the same track in real-time
 */

import { AudioPlayer } from './AudioPlayer'

interface NowPlayingProps {
  submission: {
    track_title: string
    artist_name: string
    file_url: string | null
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
    <AudioPlayer
      fileUrl={submission.file_url}
      trackTitle={submission.track_title}
      artistName={submission.artist_name}
    />
  )
}