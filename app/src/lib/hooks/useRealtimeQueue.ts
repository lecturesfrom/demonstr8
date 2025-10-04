/**
 * useRealtimeQueue Hook
 *
 * What: Subscribe to queue changes for an event
 * Why: Host dashboard and live page update automatically when submissions change
 * How it helps users: Real-time sync (like Google Docs) - everyone sees the same queue instantly
 *
 * Technical: Supabase Realtime subscription, cleans up on unmount to prevent memory leaks
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../supabase'

type Submission = {
  id: string
  event_id: string
  artist_name: string
  track_title: string
  upload_id: string
  playback_id: string | null
  tip_cents: number
  status: 'pending' | 'approved' | 'playing' | 'skipped' | 'done'
  queue_position: number | null
  created_at: string
}

export function useRealtimeQueue(eventId: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch
    supabase
      .from('submissions')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setSubmissions(data as Submission[])
        }
        setLoading(false)
      })

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`queue:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSubmissions((prev) => [...prev, payload.new as Submission])
          } else if (payload.eventType === 'UPDATE') {
            setSubmissions((prev) =>
              prev.map((s) => (s.id === payload.new.id ? (payload.new as Submission) : s))
            )
          } else if (payload.eventType === 'DELETE') {
            setSubmissions((prev) => prev.filter((s) => s.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Cleanup on unmount (prevents memory leaks)
    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  return { submissions, loading }
}
