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

    // Update submission status to skipped
    const { data, error } = await supabase
      .from('submissions')
      .update({ status: 'skipped' })
      .eq('id', submissionId)
      .select()
      .single()

    if (error) {
      console.error('Failed to skip submission:', error)
      return NextResponse.json(
        { error: 'Failed to skip submission' },
        { status: 500 }
      )
    }

    // Log the action
    if (data) {
      await supabase
        .from('event_logs')
        .insert({
          event_id: data.event_id,
          action: 'skip',
          payload: { submission_id: submissionId }
        })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Skip endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}