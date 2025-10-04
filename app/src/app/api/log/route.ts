import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server' // Use server client for API routes

export async function POST(request: Request) {
  try {
    const { event_id, action, payload } = await request.json()

    if (!event_id || !action) {
      return NextResponse.json(
        { error: 'event_id and action are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { error } = await supabase.from('event_logs').insert({
      event_id,
      action,
      payload,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logging failed:', error)
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
  }
}
