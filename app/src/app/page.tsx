/**
 * Home Page - Component Showcase
 *
 * What: Displays all UI components with dummy data
 * Why: Lets you see the Digital Workwear design system in action
 * How it helps: Quick visual review before building full pages
 */

'use client'

import { QueueItem } from '@/components/QueueItem'
import { NowPlaying } from '@/components/NowPlaying'
import { ProcessingBadge } from '@/components/ProcessingBadge'

export default function Home() {
  // Dummy data for showcasing components
  const dummySubmissions = [
    {
      id: '1',
      track_title: 'Track in Processing',
      artist_name: 'Pending Artist',
      playback_id: null,
      status: 'pending' as const,
    },
    {
      id: '2',
      track_title: 'Ready to Play Track',
      artist_name: 'Approved Artist',
      playback_id: 'abc123',
      status: 'approved' as const,
    },
    {
      id: '3',
      track_title: 'Currently Playing Track',
      artist_name: 'Active Artist',
      playback_id: 'def456',
      status: 'playing' as const,
    },
    {
      id: '4',
      track_title: 'Skipped Track',
      artist_name: 'Skipped Artist',
      playback_id: 'ghi789',
      status: 'skipped' as const,
    },
  ]

  const nowPlayingSubmission = {
    track_title: 'Currently Playing Track',
    artist_name: 'Active Artist',
    playback_id: 'def456',
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="dw-h1 text-dw-text mb-4">LecturesFrom</h1>
          <p className="dw-body text-dw-text-muted">
            Digital Workwear Design System - Component Showcase
          </p>
        </div>

        {/* Now Playing Section */}
        <section className="mb-12">
          <h2 className="dw-h3 text-dw-text mb-4">Now Playing Component</h2>
          <NowPlaying submission={nowPlayingSubmission} />
        </section>

        {/* Processing Badges */}
        <section className="mb-12">
          <h2 className="dw-h3 text-dw-text mb-4">Processing Badges</h2>
          <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-6 flex gap-8">
            <div>
              <p className="text-dw-text-muted text-sm mb-2">Processing:</p>
              <ProcessingBadge playback_id={null} />
            </div>
            <div>
              <p className="text-dw-text-muted text-sm mb-2">Ready:</p>
              <ProcessingBadge playback_id="abc123" />
            </div>
          </div>
        </section>

        {/* Queue Items */}
        <section className="mb-12">
          <h2 className="dw-h3 text-dw-text mb-6">Queue Items (All States)</h2>
          <div>
            {dummySubmissions.map((submission) => (
              <QueueItem
                key={submission.id}
                submission={submission}
                isHost={true}
                onApprove={(id) => console.log('Approve:', id)}
                onPlay={(id) => console.log('Play:', id)}
                onSkip={(id) => console.log('Skip:', id)}
              />
            ))}
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-12">
          <h2 className="dw-h3 text-dw-text mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dw-base border border-border-dw-muted rounded-sm p-4">
              <div className="w-full h-12 bg-dw-base mb-2 rounded-sm"></div>
              <p className="text-sm text-dw-text-muted">dw-base</p>
            </div>
            <div className="bg-dw-base border border-border-dw-muted rounded-sm p-4">
              <div className="w-full h-12 bg-dw-surface mb-2 rounded-sm"></div>
              <p className="text-sm text-dw-text-muted">dw-surface</p>
            </div>
            <div className="bg-dw-base border border-border-dw-muted rounded-sm p-4">
              <div className="w-full h-12 bg-dw-accent mb-2 rounded-sm"></div>
              <p className="text-sm text-dw-text-muted">dw-accent (1%)</p>
            </div>
            <div className="bg-dw-base border border-border-dw-muted rounded-sm p-4">
              <div className="w-full h-12 bg-dw-success mb-2 rounded-sm"></div>
              <p className="text-sm text-dw-text-muted">dw-success</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="dw-h3 text-dw-text mb-4">Typography</h2>
          <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-6 space-y-4">
            <h1 className="dw-h1 text-dw-text">Heading 1 (48px, 800 weight)</h1>
            <h2 className="dw-h2 text-dw-text">Heading 2 (36px, 800 weight)</h2>
            <h3 className="dw-h3 text-dw-text">Heading 3 (24px, 700 weight)</h3>
            <p className="dw-body text-dw-text">
              Body text (18px, 400 weight) - Clean, functional, industrial aesthetic
            </p>
            <p className="dw-label text-dw-muted">Label (14px, uppercase)</p>
            <p className="dw-caption text-dw-text-muted">Caption (12px)</p>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <h2 className="dw-h3 text-dw-text mb-4">Buttons</h2>
          <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-6 flex flex-wrap gap-4">
            <button className="bg-dw-accent text-dw-base px-6 py-3 rounded-sm font-medium hover:opacity-90 transition-opacity">
              Primary (Accent - 1%)
            </button>
            <button className="border border-border-dw-strong text-dw-text px-4 py-2 rounded-sm hover:bg-dw-surface-alt transition-colors">
              Secondary
            </button>
            <button className="border border-dw-alert text-dw-alert px-4 py-2 rounded-sm hover:bg-dw-alert/10 transition-colors">
              Alert (Skip)
            </button>
            <button className="border border-border-dw-muted text-dw-text px-4 py-2 rounded-sm opacity-50 pointer-events-none">
              Disabled
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
