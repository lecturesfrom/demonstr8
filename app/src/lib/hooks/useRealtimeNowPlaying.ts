/**
 * useRealtimeNowPlaying Hook
 *
 * What: Subscribe to now_playing changes for an event
 * Why: Live page shows current track instantly when host clicks Play
 * How it helps users: Updates in <1 second, feels like magic (no page refresh needed)
 *
 * Technical: Subscribes to now_playing table, fetches full submission data when it changes
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../supabase'

type NowPlayingSubmission = {
  track_title: string
  artist_name: string
  playback_id: string | null
} | null

export function useRealtimeNowPlaying(eventId: string) {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingSubmission>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch
    supabase
      .from('now_playing')
      .select(`
        submission_id,
        submissions (
          track_title,
          artist_name,
          playback_id
        )
      `)
      .eq('event_id', eventId)
      .single()
      .then(({ data, error }) => {
        if (!error && data?.submissions) {
          // The submissions field is a single object from the join, not an array
          const submission = Array.isArray(data.submissions)
            ? data.submissions[0]
            : data.submissions

          if (submission) {
            setNowPlaying({
              track_title: submission.track_title,
              artist_name: submission.artist_name,
              playback_id: submission.playback_id
            })
          } else {
            setNowPlaying(null)
          }
        } else {
          setNowPlaying(null)
        }
        setLoading(false)
      })

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`live:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'now_playing',
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          const newRecord = payload.new as { submission_id?: string }
          if (newRecord.submission_id) {
            // Fetch full submission data
            const { data } = await supabase
              .from('submissions')
              .select('track_title, artist_name, playback_id')
              .eq('id', newRecord.submission_id)
              .single()

            if (data) {
              setNowPlaying(data as NowPlayingSubmission)
            }
          } else {
            setNowPlaying(null)
          }
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  return { nowPlaying, loading }
}
