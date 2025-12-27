'use client'

import { useState } from 'react'
import { useRealtimeQueue } from '@/lib/hooks/useRealtimeQueue'
import { useRealtimeNowPlaying } from '@/lib/hooks/useRealtimeNowPlaying'
import { QueueItem } from '@/components/QueueItem'
import { NowPlaying } from '@/components/NowPlaying'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableQueueItem } from '@/components/SortableQueueItem'

interface HostDashboardClientProps {
  eventId: string
  eventName: string
}

export default function HostDashboardClient({ eventId, eventName }: HostDashboardClientProps) {
  const { submissions, loading: queueLoading } = useRealtimeQueue(eventId)
  const { nowPlaying, loading: npLoading } = useRealtimeNowPlaying(eventId)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleApprove = async (submissionId: string) => {
    setLoadingStates(prev => ({ ...prev, [`approve-${submissionId}`]: true }))
    try {
      const response = await fetch('/api/queue/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      })
      if (!response.ok) throw new Error('Failed to approve')
    } catch (error) {
      console.error('Approve failed:', error)
      alert('Failed to approve submission')
    } finally {
      setLoadingStates(prev => ({ ...prev, [`approve-${submissionId}`]: false }))
    }
  }

  const handlePlay = async (submissionId: string) => {
    setLoadingStates(prev => ({ ...prev, [`play-${submissionId}`]: true }))
    try {
      const response = await fetch('/api/queue/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, eventId }),
      })
      if (!response.ok) throw new Error('Failed to play')
    } catch (error) {
      console.error('Play failed:', error)
      alert('Failed to play submission')
    } finally {
      setLoadingStates(prev => ({ ...prev, [`play-${submissionId}`]: false }))
    }
  }

  const handleSkip = async (submissionId: string) => {
    setLoadingStates(prev => ({ ...prev, [`skip-${submissionId}`]: true }))
    try {
      const response = await fetch('/api/queue/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      })
      if (!response.ok) throw new Error('Failed to skip')
    } catch (error) {
      console.error('Skip failed:', error)
      alert('Failed to skip submission')
    } finally {
      setLoadingStates(prev => ({ ...prev, [`skip-${submissionId}`]: false }))
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = approved.findIndex((item) => item.id === active.id)
      const newIndex = approved.findIndex((item) => item.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(approved, oldIndex, newIndex)
        const submissionIds = newOrder.map(item => item.id)

        // Call reorder API
        try {
          const response = await fetch('/api/queue/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissionIds, eventId }),
          })
          if (!response.ok) throw new Error('Failed to reorder')
        } catch (error) {
          console.error('Reorder failed:', error)
          alert('Failed to reorder queue')
        }
      }
    }
  }

  if (queueLoading || npLoading) {
    return (
      <div className="min-h-screen bg-dw-base flex items-center justify-center">
        <p className="text-dw-muted">Loading dashboard...</p>
      </div>
    )
  }

  // Filter submissions by status
  const pending = submissions.filter((s) => s.status === 'pending')
  const approved = submissions.filter((s) => s.status === 'approved')
  const done = submissions.filter((s) => s.status === 'done' || s.status === 'skipped')

  return (
    <div className="min-h-screen bg-dw-base p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-dw-text mb-2">Host Dashboard</h1>
          <p className="text-dw-text-muted">Managing: {eventName}</p>
        </div>

        {/* Now Playing */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dw-text mb-4">Now Playing</h2>
          <NowPlaying submission={nowPlaying} />
        </div>

        {/* Queue Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending */}
          <div>
            <h3 className="text-xl font-bold text-dw-text mb-4">
              Pending ({pending.length})
            </h3>
            <div className="space-y-4">
              {pending.length === 0 ? (
                <p className="text-dw-muted text-sm">No pending submissions</p>
              ) : (
                pending.map((sub) => (
                  <QueueItem
                    key={sub.id}
                    submission={sub}
                    onApprove={handleApprove}
                    isHost
                    isLoading={loadingStates[`approve-${sub.id}`] || false}
                  />
                ))
              )}
            </div>
          </div>

          {/* Approved/Queue - With Drag and Drop */}
          <div>
            <h3 className="text-xl font-bold text-dw-text mb-4">
              Queue ({approved.length})
              {approved.length > 1 && (
                <span className="text-sm font-normal text-dw-muted ml-2">
                  (drag to reorder)
                </span>
              )}
            </h3>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={approved.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {approved.length === 0 ? (
                    <p className="text-dw-muted text-sm">No approved tracks</p>
                  ) : (
                    approved.map((sub) => (
                      <SortableQueueItem
                        key={sub.id}
                        submission={sub}
                        onPlay={handlePlay}
                        onSkip={handleSkip}
                        isHost
                        isLoading={{
                          play: loadingStates[`play-${sub.id}`] || false,
                          skip: loadingStates[`skip-${sub.id}`] || false,
                        }}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Done/History */}
          <div>
            <h3 className="text-xl font-bold text-dw-text mb-4">
              History ({done.length})
            </h3>
            <div className="space-y-4">
              {done.length === 0 ? (
                <p className="text-dw-muted text-sm">No completed tracks</p>
              ) : (
                done.map((sub) => (
                  <QueueItem key={sub.id} submission={sub} isHost={false} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}