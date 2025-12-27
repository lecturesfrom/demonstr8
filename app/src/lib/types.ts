/**
 * Shared TypeScript type definitions for demonstr8
 * Centralized types to avoid duplication and ensure consistency
 */

// Submission status as a union type for type safety
export type SubmissionStatus = 'pending' | 'approved' | 'playing' | 'skipped' | 'done'

// User subscription tiers
export type SubscriptionTier = 'free' | 'pro' | 'platinum'

// User roles
export type UserRole = 'fan' | 'host' | 'admin' | 'creator'

// Session types
export type SessionType = 'standard' | 'premium' | 'exclusive'

// Event log actions
export type EventAction = 'submit' | 'approve' | 'play' | 'skip' | 'upload_rejected' | 'paid_skip'

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
  ivs_channel_arn: string | null
  ivs_stream_key: string | null
  ivs_playback_url: string | null
  session_type: SessionType
  is_live: boolean
  starts_at: string | null
  created_at: string
}

export interface Submission {
  id: string
  event_id: string
  artist_name: string
  track_title: string
  file_url: string | null
  file_size_bytes: number | null
  tip_cents: number
  skip_price_paid_cents: number | null
  submission_method: 'manual' | 'automated'
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

// New demonstr8-specific types
export interface UserSubscription {
  user_id: string
  tier: SubscriptionTier
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  created_at: string
  updated_at: string
}

export interface CreatorAccount {
  user_id: string
  stripe_account_id: string
  onboarding_complete: boolean
  created_at: string
}

export interface UserLocker {
  id: string
  user_id: string
  file_url: string
  file_name: string | null
  file_size_bytes: number | null
  created_at: string
}

export interface ArmedSubmission {
  id: string
  user_id: string
  creator_id: string
  locker_file_id: string | null
  active: boolean
  created_at: string
}

export interface SkipPricingHistory {
  id: string
  session_id: string
  calculated_price_cents: number
  queue_length: number
  factors: Record<string, unknown>
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

export interface NowPlayingProps {
  submission: {
    track_title: string
    artist_name: string
    file_url: string | null
  } | null
}

// API response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  success?: boolean
}

// IVS types
export interface IVSChannelInfo {
  channel_arn: string
  stream_key: string
  ingest_endpoint: string
  playback_url: string
}

// Opportunity Engine types
export interface SkipPriceOption {
  tier: 'instant' | 'priority' | 'standard'
  price_cents: number
  estimated_wait_minutes: number
  queue_position: number
}

export interface OpportunityEngineResponse {
  queue_length: number
  estimated_stream_duration_minutes: number
  pricing_options: SkipPriceOption[]
}

// Form types
export interface SubmissionFormData {
  artist_name: string
  track_title: string
  file_url: string
  event_id: string
}