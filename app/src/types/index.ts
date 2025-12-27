/**
 * Shared types for the application
 */

export type SubmissionStatus = 'pending' | 'approved' | 'playing' | 'skipped' | 'done'

export interface Submission {
  id: string
  event_id: string
  artist_name: string | null
  track_title: string | null
  file_url: string | null
  file_size_bytes: number | null
  tip_cents: number
  status: SubmissionStatus
  queue_position: number | null
  created_at: string
}

export interface Event {
  id: string
  host_id: string
  name: string
  token: string
  ivs_channel_arn: string | null
  ivs_stream_key: string | null
  ivs_playback_url: string | null
  is_live: boolean
  starts_at: string | null
  created_at: string
}

export interface Profile {
  id: string
  display_name: string | null
  role: 'fan' | 'host' | 'admin'
  created_at: string
}

export interface NowPlayingData {
  event_id: string
  submission_id: string | null
  updated_at: string
  submission?: Submission
}

export interface EventLog {
  id: number
  event_id: string
  profile_id: string | null
  action: string
  payload: Record<string, unknown>
  created_at: string
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  success?: boolean
}

export interface QueueActionRequest {
  submissionId: string
  eventId: string
}

export interface ReorderRequest {
  eventId: string
  reorderedItems: Array<{
    id: string
    queue_position: number
  }>
}