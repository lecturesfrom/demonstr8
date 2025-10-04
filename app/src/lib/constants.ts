/**
 * Shared constants for LecturesFrom
 * Centralized configuration and enums to prevent typos and magic strings
 */

// Submission status constants
export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PLAYING: 'playing',
  SKIPPED: 'skipped',
  DONE: 'done',
} as const

// User role constants
export const USER_ROLE = {
  FAN: 'fan',
  HOST: 'host',
  ADMIN: 'admin',
} as const

// Event action constants for logging
export const EVENT_ACTION = {
  SUBMIT: 'submit',
  APPROVE: 'approve',
  PLAY: 'play',
  SKIP: 'skip',
  UPLOAD_REJECTED: 'upload_rejected',
} as const

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 500,
  MAX_SIZE_BYTES: 500 * 1024 * 1024, // 500MB
  ALLOWED_EXTENSIONS: ['.wav', '.mp3', '.flac', '.aiff', '.m4a', '.ogg'],
  ALLOWED_MIME_TYPES: [
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/flac',
    'audio/aiff',
    'audio/x-aiff',
    'audio/m4a',
    'audio/mp4',
    'audio/ogg',
    'audio/x-m4a',
  ],
  CHUNK_SIZE_MB: 50,
  CHUNK_SIZE_BYTES: 50 * 1024 * 1024, // 50MB chunks for resumable uploads
} as const

// Mux configuration
export const MUX_CONFIG = {
  MAX_DURATION_SECONDS: 3600, // 1 hour max
  PLAYBACK_POLICY: 'public' as const,
  STREAM_TYPE: 'live' as const,
  ASSET_TYPE: 'audio' as const,
} as const

// UI constants
export const UI = {
  QUEUE_PAGE_SIZE: 20,
  HISTORY_PAGE_SIZE: 10,
  DEBOUNCE_DELAY_MS: 300,
  REALTIME_TIMEOUT_MS: 5000,
  TOAST_DURATION_MS: 4000,
} as const

// API endpoints (relative)
export const API_ENDPOINTS = {
  MUX_CREATE_UPLOAD: '/api/mux/create-upload',
  MUX_WEBHOOK: '/api/mux/webhook',
  SUBMISSIONS: '/api/submissions',
  QUEUE_APPROVE: '/api/queue/approve',
  QUEUE_PLAY: '/api/queue/play',
  QUEUE_SKIP: '/api/queue/skip',
  QUEUE_REORDER: '/api/queue/reorder',
  LOG: '/api/log',
} as const

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  UPLOAD_TOO_LARGE: `File must be less than ${FILE_UPLOAD.MAX_SIZE_MB}MB`,
  UPLOAD_WRONG_TYPE: 'Please upload an audio file (WAV, MP3, FLAC, etc.)',
  SUBMISSION_FAILED: 'Failed to submit your track. Please try again.',
  NOT_AUTHORIZED: "You don't have permission to access this resource.",
  EVENT_NOT_FOUND: 'Event not found or is not currently live.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  SUBMISSION_COMPLETE: 'Track submitted successfully!',
  TRACK_APPROVED: 'Track approved and added to queue.',
  TRACK_PLAYING: 'Now playing this track.',
  TRACK_SKIPPED: 'Track skipped.',
  QUEUE_UPDATED: 'Queue order updated.',
} as const

// Page titles
export const PAGE_TITLES = {
  HOME: 'LecturesFrom',
  SUBMIT: 'Submit Your Track',
  HOST: 'Host Dashboard',
  LIVE: 'Live Event',
} as const