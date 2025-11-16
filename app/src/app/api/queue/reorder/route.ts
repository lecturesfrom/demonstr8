import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { submissionIds, eventId } = await request.json()

    if (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json(
        { error: 'submissionIds array required' },
        { status: 400 }
      )
    }

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Update queue positions for each submission
    // submissionIds are already in the desired order
    const updates = submissionIds.map((id, index) => {
      return supabase
        .from('submissions')
        .update({ queue_position: index + 1 }) // 1-indexed positions
        .eq('id', id)
        .eq('event_id', eventId) // Extra safety check
        .eq('status', 'approved') // Only reorder approved items
    })

    // Execute all updates in parallel
    await Promise.all(updates)

    // Log the reorder event
    await supabase
      .from('event_logs')
      .insert({
        event_id: eventId,
        action: 'reorder',
        payload: {
          submission_ids: submissionIds,
          count: submissionIds.length
        }
      })

    return NextResponse.json({
      success: true,
      updated: submissionIds.length
    })
  } catch (error) {
    console.error('Reorder failed:', error)
    return NextResponse.json(
      { error: 'Failed to reorder queue' },
      { status: 500 }
    )
  }
}
