'use client'

import { SubmissionForm } from '@/components/SubmissionForm'

interface Event {
  id: string
  name: string
  is_live: boolean
}

export function SubmitPageClient({
  event,
}: {
  event: Event
}) {
  return (
    <div className="min-h-screen bg-dw-base p-8">
      <div className="max-w-2xl mx-auto">
        {/* Event Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-dw-text mb-2">{event.name}</h1>
          <div className="inline-flex items-center gap-2 bg-dw-accent/10 border border-dw-accent rounded-sm px-4 py-2">
            <span className="w-2 h-2 bg-dw-accent rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-dw-accent uppercase tracking-wider">
              Live Now
            </span>
          </div>
        </div>

        {/* Submission Form */}
        <SubmissionForm
          eventId={event.id}
          onSubmitSuccess={() => {
            window.location.href = `/live/${event.id}`
          }}
        />
      </div>
    </div>
  )
}
