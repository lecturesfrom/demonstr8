'use client'

import { useState } from 'react'
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRealtimeQueue } from '@/lib/hooks/useRealtimeQueue'
import { useRealtimeNowPlaying } from '@/lib/hooks/useRealtimeNowPlaying'
import { QueueItem } from '@/components/QueueItem'
import { NowPlaying } from '@/components/NowPlaying'

// Sortable wrapper for QueueItem
function SortableQueueItem({ submission, onPlay, onSkip }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: submission.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-dw-muted hover:text-dw-text p-2 touch-none"
          aria-label="Drag to reorder"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </button>
        <div className="flex-1">
          <QueueItem
            submission={submission}
            onPlay={onPlay}
            onSkip={onSkip}
            isHost
          />
        </div>
      </div>
    </div>
  )
}

interface HostDashboardClientProps {
  eventId: string
  eventName: string
  eventToken: string
}

export default function HostDashboardClient({ eventId, eventName, eventToken }: HostDashboardClientProps) {
  const { submissions, loading: queueLoading } = useRealtimeQueue(eventId)
  const { nowPlaying, loading: npLoading } = useRealtimeNowPlaying(eventId)
  const [copied, setCopied] = useState(false)

  const submissionUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/submit/${eventToken}`
    : ''

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(submissionUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleApprove = async (submissionId: string) => {
    await fetch('/api/queue/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    })
  }

  const handlePlay = async (submissionId: string) => {
    await fetch('/api/queue/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, eventId }),
    })
  }

  const handleSkip = async (submissionId: string) => {
    await fetch('/api/queue/skip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    // Get current approved queue
    const approved = submissions.filter((s) => s.status === 'approved')
    const oldIndex = approved.findIndex((item) => item.id === active.id)
    const newIndex = approved.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // Reorder locally for immediate feedback
    const reordered = arrayMove(approved, oldIndex, newIndex)

    // Update queue positions on server
    const submissionIds = reordered.map((sub) => sub.id)

    try {
      await fetch('/api/queue/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionIds, eventId }),
      })
    } catch (error) {
      console.error('Failed to reorder queue:', error)
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

        {/* Submission Link Sharing */}
        <div className="mb-8 bg-dw-surface border border-border-dw-muted rounded-sm p-6">
          <h2 className="text-lg font-bold text-dw-text mb-3">Share Submission Link</h2>
          <p className="text-sm text-dw-text-muted mb-4">
            Share this link with your audience so they can submit tracks
          </p>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              readOnly
              value={submissionUrl}
              className="flex-1 bg-dw-base border border-border-dw-muted rounded-sm px-4 py-3 text-dw-text font-mono text-sm"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopyLink}
              className="bg-dw-accent text-dw-base px-6 py-3 rounded-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Now Playing */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dw-text mb-4">Now Playing</h2>
          <NowPlaying submission={nowPlaying} />
        </div>

        {/* Queue Sections */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pending */}
            <div>
            <h3 className="text-xl font-bold text-dw-text mb-4">
              Pending ({pending.length})
            </h3>
            <div className="space-y-4">
              {pending.length === 0 ? (
                <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-6 text-center">
                  <p className="text-dw-muted mb-2">No pending submissions</p>
                  <p className="text-sm text-dw-text-muted">
                    New track submissions will appear here
                  </p>
                </div>
              ) : (
                pending.map((sub) => (
                  <QueueItem
                    key={sub.id}
                    submission={sub}
                    onApprove={handleApprove}
                    isHost
                  />
                ))
              )}
            </div>
          </div>

          {/* Approved/Queue */}
          <div>
            <h3 className="text-xl font-bold text-dw-text mb-4">
              Queue ({approved.length})
            </h3>
            <SortableContext
              items={approved.map((sub) => sub.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {approved.length === 0 ? (
                  <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-6 text-center">
                    <p className="text-dw-muted mb-2">Queue is empty</p>
                    <p className="text-sm text-dw-text-muted">
                      Approve pending submissions to build your queue
                    </p>
                  </div>
                ) : (
                  approved.map((sub) => (
                    <SortableQueueItem
                      key={sub.id}
                      submission={sub}
                      onPlay={handlePlay}
                      onSkip={handleSkip}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </div>

          {/* Done/History */}
          <div>
            <h3 className="text-xl font-bold text-dw-text mb-4">
              History ({done.length})
            </h3>
            <div className="space-y-4">
              {done.length === 0 ? (
                <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-6 text-center">
                  <p className="text-dw-muted mb-2">No history yet</p>
                  <p className="text-sm text-dw-text-muted">
                    Played and skipped tracks will appear here
                  </p>
                </div>
              ) : (
                done.map((sub) => (
                  <QueueItem key={sub.id} submission={sub} isHost={false} />
                ))
              )}
            </div>
          </div>
        </div>
        </DndContext>
      </div>
    </div>
  )
}