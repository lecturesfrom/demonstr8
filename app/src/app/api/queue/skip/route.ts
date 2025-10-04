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

    // Update submission status to skipped
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'skipped' })
      .eq('id', submissionId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Skip failed:', error)
    return NextResponse.json(
      { error: 'Failed to skip submission' },
      { status: 500 }
    )
  }
}
