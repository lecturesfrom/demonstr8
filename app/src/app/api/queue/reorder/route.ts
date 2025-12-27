import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { submissionIds, eventId } = body

    if (!submissionIds || !Array.isArray(submissionIds) || !eventId) {
      return NextResponse.json(
        { error: 'submissionIds array and eventId are required' },
        { status: 400 }
      )
    }

    // Update queue positions for each submission
    const updates = submissionIds.map(async (id: string, index: number) => {
      const newPosition = index + 1
      const { data, error } = await supabase
        .from('submissions')
        .update({ queue_position: newPosition })
        .eq('id', id)
        .eq('event_id', eventId)
        .select()

      if (error) {
        throw new Error(`Failed to update submission ${id}: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error(`Submission ${id} not found or doesn't belong to event ${eventId}`)
      }

      return data
    })

    const results = await Promise.all(updates)

    if (results.length !== submissionIds.length) {
      throw new Error('Not all submissions were updated')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
