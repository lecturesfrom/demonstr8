/**
 * Shared TypeScript type definitions for LecturesFrom
 * Centralized types to avoid duplication and ensure consistency
 */

// Submission status as a union type for type safety
export type SubmissionStatus = 'pending' | 'approved' | 'playing' | 'skipped' | 'done'

// User roles
export type UserRole = 'fan' | 'host' | 'admin'

// Event log actions
export type EventAction = 'submit' | 'approve' | 'play' | 'skip' | 'upload_rejected'

// Database table types
export interface Profile {
  id: string
  display_name: string | null
  role: UserRole
  created_at: string
}

export interface Event {
  id: string
  host_id: string | null
  name: string
  token: string
  mux_live_playback_id: string | null
  is_live: boolean
  starts_at: string | null
  created_at: string
}

export interface Submission {
  id: string
  event_id: string
  artist_name: string
  track_title: string
  upload_id: string | null
  playback_id: string | null
  tip_cents: number
  status: SubmissionStatus
  queue_position: number | null
  created_at: string
}

export interface NowPlayingEntry {
  event_id: string
  submission_id: string | null
  updated_at: string
  submission?: Submission // Joined data
}

export interface EventLog {
  id: number
  event_id: string | null
  profile_id: string | null
  action: EventAction
  payload: Record<string, unknown>
  created_at: string
}

// Component prop types
export interface QueueItemProps {
  submission: Submission
  onApprove?: (id: string) => void | Promise<void>
  onPlay?: (id: string) => void | Promise<void>
  onSkip?: (id: string) => void | Promise<void>
  isHost?: boolean
}

export interface ProcessingBadgeProps {
  playback_id: string | null
}

export interface NowPlayingProps {
  submission: Submission | null
}

// API response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  success?: boolean
}

export interface MuxUploadResponse {
  uploadUrl: string
  uploadId: string
}

export interface MuxWebhookEvent {
  type: string
  data: {
    id: string
    upload_id?: string
    playback_ids?: Array<{ id: string }>
    [key: string]: unknown
  }
}

// Form types
export interface SubmissionFormData {
  artist_name: string
  track_title: string
  upload_id: string
  event_id: string
}