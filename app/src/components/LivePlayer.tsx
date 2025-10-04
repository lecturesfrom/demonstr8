/**
 * LivePlayer Component
 *
 * What: Embedded Mux Player for live stream playback
 * Why: Fans watch the live event with synchronized audio
 * How it helps users: See and hear the live performance
 *
 * Technical: Uses @mux/mux-player-react with Digital Workwear theme
 */

'use client'

import MuxPlayer from '@mux/mux-player-react'

interface LivePlayerProps {
  playbackId: string
  eventName?: string
}

export function LivePlayer({ playbackId, eventName = 'Live Event' }: LivePlayerProps) {
  if (!playbackId) {
    return (
      <div className="bg-dw-surface border border-dw-muted rounded-lg p-12 text-center">
        <p className="text-dw-muted mb-2">Stream not available</p>
        <p className="text-dw-text-muted text-sm">
          The host hasn&apos;t started streaming yet. Please check back soon.
        </p>
      </div>
    )
  }

  return (
    <div className="relative rounded-lg overflow-hidden bg-dw-base">
      <MuxPlayer
        streamType="live"
        playbackId={playbackId}
        metadata={{
          video_title: eventName,
          video_id: playbackId,
        }}
        theme="minimal"
        accentColor="#C8D400" // dw-accent color
        primaryColor="#E8E5D8" // dw-text color
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          '--media-object-fit': 'contain',
          '--media-object-position': 'center',
        } as React.CSSProperties}
        autoPlay={false} // User must click to start (better UX)
        muted={false} // Start with audio on for live events
      />
    </div>
  )
}