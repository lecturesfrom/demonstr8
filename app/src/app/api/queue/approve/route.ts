import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { submissionId } = await request.json()

    if (!submissionId) {
      return NextResponse.json(
        { error: 'submissionId required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // First, get the submission to find its event_id
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('event_id')
      .eq('id', submissionId)
      .single()

    if (fetchError || !submission) {
      throw new Error('Submission not found')
    }

    // Get the maximum queue position for approved items in this event
    const { data: maxPositionData } = await supabase
      .from('submissions')
      .select('queue_position')
      .eq('event_id', submission.event_id)
      .eq('status', 'approved')
      .order('queue_position', { ascending: false })
      .limit(1)
      .single()

    // Calculate the next position (1-indexed)
    const nextPosition = maxPositionData?.queue_position
      ? maxPositionData.queue_position + 1
      : 1

    // Update submission status to approved with queue position
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        status: 'approved',
        queue_position: nextPosition
      })
      .eq('id', submissionId)

    if (updateError) throw updateError

    // Log the approval event
    await supabase
      .from('event_logs')
      .insert({
        event_id: submission.event_id,
        action: 'approve',
        payload: {
          submission_id: submissionId,
          queue_position: nextPosition
        }
      })

    return NextResponse.json({
      success: true,
      queue_position: nextPosition
    })
  } catch (error) {
    console.error('Approve failed:', error)
    return NextResponse.json(
      { error: 'Failed to approve submission' },
      { status: 500 }
    )
  }
}
