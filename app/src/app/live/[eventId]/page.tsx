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

  // Use IVS playback URL from event
  const playbackUrl = event.ivs_playback_url || null

  return (
    <LivePageClient
      eventId={eventId}
      eventName={event.name}
      ivsPlaybackUrl={playbackUrl}
    />
  )
}
