/**
 * Host Dashboard Server Component
 * Handles authentication and authorization before rendering the dashboard
 */

import { requireHost } from '@/lib/auth'
import HostDashboardClient from './HostDashboardClient'

export default async function HostDashboard({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  // Check if user is authorized to manage this event
  // This will redirect to home if not authorized
  const event = await requireHost(eventId)

  // Render the client component with event data
  return <HostDashboardClient eventId={eventId} eventName={event.name} eventToken={event.token} />
}
