import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { submissionId, eventId } = await request.json()

    if (!submissionId || !eventId) {
      return NextResponse.json(
        { error: 'submissionId and eventId required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // 1. Mark current submission as playing
    await supabase
      .from('submissions')
      .update({ status: 'playing' })
      .eq('id', submissionId)

    // 2. Mark previous "playing" as "done"
    await supabase
      .from('submissions')
      .update({ status: 'done' })
      .eq('event_id', eventId)
      .eq('status', 'playing')
      .neq('id', submissionId)

    // 3. Update now_playing
    await supabase
      .from('now_playing')
      .upsert({ event_id: eventId, submission_id: submissionId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Play failed:', error)
    return NextResponse.json(
      { error: 'Failed to play submission' },
      { status: 500 }
    )
  }
}
