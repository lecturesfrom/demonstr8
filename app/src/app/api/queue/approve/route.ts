import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { submissionId } = body

    if (!submissionId) {
      return NextResponse.json(
        { error: 'submissionId is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get current max queue position
    const { data: maxPosData } = await supabase
      .from('submissions')
      .select('queue_position')
      .eq('status', 'approved')
      .order('queue_position', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextPosition = (maxPosData?.queue_position || 0) + 1

    // Update submission status to approved with queue position
    const { data, error } = await supabase
      .from('submissions')
      .update({
        status: 'approved',
        queue_position: nextPosition
      })
      .eq('id', submissionId)
      .select()
      .single()

    if (error) {
      console.error('Failed to approve submission:', error)
      return NextResponse.json(
        { error: 'Failed to approve submission' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase
      .from('event_logs')
      .insert({
        event_id: data.event_id,
        action: 'approve',
        payload: { submission_id: submissionId, queue_position: nextPosition }
      })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Approve endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}