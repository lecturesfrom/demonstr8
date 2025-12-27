import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

/**
 * Standard error response format
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Standard success response format
 */
export function successResponse(data: Record<string, unknown> = { success: true }) {
  return NextResponse.json(data)
}

/**
 * Validate required fields in request body
 */
export function validateRequired(
  body: Record<string, unknown>,
  requiredFields: string[]
): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter(field => !body[field])
  return {
    valid: missing.length === 0,
    missing: missing.length > 0 ? missing : undefined
  }
}

interface DatabaseError {
  code?: string
  message?: string
}

/**
 * Handle database errors consistently
 */
export function handleDatabaseError(error: DatabaseError | unknown, operation: string) {
  console.error(`[${operation}] Database error:`, error)

  const dbError = error as DatabaseError
  if (dbError?.code === 'PGRST116') {
    return errorResponse('Record not found', 404)
  }

  if (dbError?.code === '23505') {
    return errorResponse('Duplicate entry', 409)
  }

  return errorResponse(`Failed to ${operation}`, 500)
}

/**
 * Log events to event_logs table
 */
export async function logEvent(
  eventId: string,
  action: string,
  payload?: Record<string, unknown>,
  profileId?: string
) {
  try {
    const supabase = createClient()

    await supabase.from('event_logs').insert({
      event_id: eventId,
      profile_id: profileId,
      action,
      payload: payload || {}
    })
  } catch (error) {
    console.error('[logEvent] Failed to log event:', error)
    // Don't throw - logging failures shouldn't break the main operation
  }
}

/**
 * Update submission status with error handling
 */
export async function updateSubmissionStatus(
  submissionId: string,
  status: 'pending' | 'approved' | 'playing' | 'skipped' | 'done',
  additionalFields?: Record<string, unknown>
) {
  const supabase = createClient()

  const updateData = {
    status,
    ...additionalFields
  }

  const { data, error } = await supabase
    .from('submissions')
    .update(updateData)
    .eq('id', submissionId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Get next queue position for an event
 */
export async function getNextQueuePosition(eventId: string): Promise<number> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submissions')
    .select('queue_position')
    .eq('event_id', eventId)
    .eq('status', 'approved')
    .order('queue_position', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
    throw error
  }

  return (data?.queue_position || 0) + 1
}

/**
 * Update now_playing table
 */
export async function updateNowPlaying(eventId: string, submissionId: string | null) {
  const supabase = createClient()

  const { error } = await supabase
    .from('now_playing')
    .upsert({
      event_id: eventId,
      submission_id: submissionId,
      updated_at: new Date().toISOString()
    })
    .eq('event_id', eventId)

  if (error) {
    throw error
  }
}

/**
 * Batch update queue positions
 */
export async function batchUpdateQueuePositions(
  updates: Array<{ id: string; queue_position: number }>
) {
  const supabase = createClient()

  const errors: Array<{ id: string; error: unknown }> = []

  // Use Promise.all for parallel updates
  await Promise.all(
    updates.map(async ({ id, queue_position }) => {
      const { error } = await supabase
        .from('submissions')
        .update({ queue_position })
        .eq('id', id)

      if (error) {
        errors.push({ id, error })
      }
    })
  )

  return { success: errors.length === 0, errors }
}