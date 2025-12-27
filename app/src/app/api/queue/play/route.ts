import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { submissionId, eventId } = body

    if (!submissionId || !eventId) {
      return NextResponse.json(
        { error: 'submissionId and eventId are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Mark any other playing submissions as done first
    await supabase
      .from('submissions')
      .update({ status: 'done' })
      .eq('event_id', eventId)
      .eq('status', 'playing')
      .neq('id', submissionId)

    // Update submission status to playing
    const { data: submission, error: updateError } = await supabase
      .from('submissions')
      .update({ status: 'playing' })
      .eq('id', submissionId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update submission:', updateError)
      return NextResponse.json(
        { error: 'Failed to update submission' },
        { status: 500 }
      )
    }

    // Update now_playing
    const { error: nowPlayingError } = await supabase
      .from('now_playing')
      .upsert({
        event_id: eventId,
        submission_id: submissionId,
        updated_at: new Date().toISOString()
      })
      .select()

    if (nowPlayingError) {
      console.error('Failed to update now playing:', nowPlayingError)
    }

    // Log the action
    await supabase
      .from('event_logs')
      .insert({
        event_id: eventId,
        action: 'play',
        payload: { submission_id: submissionId }
      })

    return NextResponse.json({ data: submission })
  } catch (error) {
    console.error('Play endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}