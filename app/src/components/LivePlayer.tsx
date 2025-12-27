/**
 * LivePlayer Component
 *
 * What: IVS Player for live stream playback
 * Why: Fans watch the live event with synchronized audio
 * How it helps users: See and hear the live performance
 *
 * Technical: Uses IVSPlayer component for AWS IVS streaming
 */

'use client'

import { IVSPlayer } from './IVSPlayer'

interface LivePlayerProps {
  playbackUrl?: string | null
  eventName?: string
}

export function LivePlayer({ playbackUrl, eventName = 'Live Event' }: LivePlayerProps) {
  return <IVSPlayer playbackUrl={playbackUrl || null} eventId={eventName} />
}