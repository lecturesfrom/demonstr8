import { createClient } from '@/lib/supabase-server'
import { SubmitPageClient } from './SubmitPageClient'

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = createClient()

  // Look up event by token
  const { data: event, error } = await supabase
    .from('events')
    .select('id, name, is_live')
    .eq('token', token)
    .single()

  // If event not found or not live, show error
  if (error || !event) {
    return (
      <div className="min-h-screen bg-dw-base flex items-center justify-center p-8">
        <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-dw-text mb-4">Event Not Found</h1>
          <p className="text-dw-text-muted">
            This submission link is invalid or the event has ended.
          </p>
        </div>
      </div>
    )
  }

  if (!event.is_live) {
    return (
      <div className="min-h-screen bg-dw-base flex items-center justify-center p-8">
        <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-dw-text mb-4">{event.name}</h1>
          <p className="text-dw-text-muted">
            This event is not currently accepting submissions.
          </p>
        </div>
      </div>
    )
  }

  // Event is live - pass data to client component
  return <SubmitPageClient event={event} />
}
