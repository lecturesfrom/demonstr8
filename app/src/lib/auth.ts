/**
 * Authentication utilities for LecturesFrom
 * Handles authorization checks for protected routes
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

/**
 * Verify that the current user is the host of the specified event
 * For now, we'll just verify the event exists (auth will be added with Supabase Auth setup)
 *
 * @param eventId - The UUID of the event to check
 * @returns The event data if it exists
 * @throws Redirects to home if event not found
 */
export async function requireHost(eventId: string) {
  const supabase = createClient()

  // Fetch the event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (eventError || !event) {
    console.error('Event not found:', eventError)
    redirect('/')
  }

  // TODO: Add actual authentication check once Supabase Auth is set up
  // For now, we'll allow access if the event exists
  // In production, this should check:
  // 1. User is authenticated
  // 2. User is the host_id of the event OR has admin role

  return event
}

/**
 * Get the current user's profile
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

/**
 * Check if a user can manage an event
 * Returns boolean instead of redirecting
 */
export async function canManageEvent(eventId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') return true

  // Check if user is the host
  const { data: event } = await supabase
    .from('events')
    .select('host_id')
    .eq('id', eventId)
    .single()

  return event?.host_id === user.id
}