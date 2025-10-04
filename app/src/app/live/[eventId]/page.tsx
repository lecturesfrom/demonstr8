/**
 * Live Page Server Component
 * Public view of live event with stream player and queue
 */

import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import LivePageClient from './LivePageClient'

export default async function LivePage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const supabase = createClient()

  // Fetch event details
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('is_live', true) // Only show live events
    .single()

  if (error || !event) {
    notFound()
  }

  // Use default playback ID from env if event doesn't have one
  const playbackId = event.mux_live_playback_id || process.env.MUX_LIVE_PLAYBACK_ID_DEFAULT || null

  return (
    <LivePageClient
      eventId={eventId}
      eventName={event.name}
      muxPlaybackId={playbackId}
    />
  )
}
