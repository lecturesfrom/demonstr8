/**
 * Component Playground - Interactive Dev Environment
 * 
 * What: Isolated component testing environment
 * Why: Quickly iterate on UI components without full app context
 * How: Switch between different component states and props
 */

'use client'

import { useState } from 'react'
import { QueueItem } from '@/components/QueueItem'
import { NowPlaying } from '@/components/NowPlaying'
import { AudioPlayer } from '@/components/AudioPlayer'
import { FileUploader } from '@/components/FileUploader'
import { SubmissionForm } from '@/components/SubmissionForm'
import { ActionButton } from '@/components/common/ActionButton'
import { TrackInfo } from '@/components/common/TrackInfo'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { SubmissionStatus } from '@/types'

export default function PlaygroundPage() {
  const [selectedComponent, setSelectedComponent] = useState<string>('queue-item')
  const [queueStatus, setQueueStatus] = useState<SubmissionStatus>('pending')
  const [isLoading, setIsLoading] = useState(false)

  // Dummy data for testing
  const dummySubmission = {
    id: 'test-1',
    track_title: 'Test Track Title',
    artist_name: 'Test Artist',
    file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    status: queueStatus,
  }

  const components = [
    { id: 'queue-item', name: 'QueueItem' },
    { id: 'now-playing', name: 'NowPlaying' },
    { id: 'audio-player', name: 'AudioPlayer' },
    { id: 'file-uploader', name: 'FileUploader' },
    { id: 'submission-form', name: 'SubmissionForm' },
    { id: 'action-button', name: 'ActionButton' },
    { id: 'track-info', name: 'TrackInfo' },
    { id: 'empty-state', name: 'EmptyState' },
    { id: 'loading-spinner', name: 'LoadingSpinner' },
  ]

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'queue-item':
        return (
          <div className="space-y-4">
            <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-4 mb-4">
              <label className="block text-sm text-dw-text-muted mb-2">Status:</label>
              <select
                value={queueStatus}
                onChange={(e) => setQueueStatus(e.target.value as SubmissionStatus)}
                className="bg-dw-base border border-border-dw-muted rounded-sm px-3 py-2 text-dw-text"
              >
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="playing">playing</option>
                <option value="skipped">skipped</option>
                <option value="done">done</option>
              </select>
            </div>
            <QueueItem
              submission={{ ...dummySubmission, status: queueStatus }}
              isHost={true}
              onApprove={(id) => console.log('Approve:', id)}
              onPlay={(id) => console.log('Play:', id)}
              onSkip={(id) => console.log('Skip:', id)}
              isLoading={isLoading}
            />
          </div>
        )
      
      case 'now-playing':
        return (
          <div className="space-y-4">
            <NowPlaying submission={dummySubmission} />
            <NowPlaying submission={null} />
          </div>
        )
      
      case 'audio-player':
        return (
          <AudioPlayer
            fileUrl={dummySubmission.file_url}
            trackTitle={dummySubmission.track_title}
            artistName={dummySubmission.artist_name}
          />
        )
      
      case 'file-uploader':
        return (
          <FileUploader
            eventId="test-event"
            onUploadComplete={(url, filename) => console.log('Upload complete:', url, filename)}
            onUploadError={(err) => console.error('Upload error:', err)}
          />
        )
      
      case 'submission-form':
        return (
          <SubmissionForm
            eventId="test-event"
            onSubmitSuccess={() => console.log('Submit success')}
          />
        )
      
      case 'action-button':
        return (
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <ActionButton variant="primary">Primary Button</ActionButton>
              <ActionButton variant="secondary">Secondary Button</ActionButton>
              <ActionButton variant="danger">Danger Button</ActionButton>
              <ActionButton disabled>Disabled Button</ActionButton>
              <ActionButton isLoading={isLoading} loadingText="Loading...">
                Loading Button
              </ActionButton>
            </div>
            <button
              onClick={() => setIsLoading(!isLoading)}
              className="bg-dw-surface border border-border-dw-muted text-dw-text px-4 py-2 rounded-sm"
            >
              Toggle Loading
            </button>
          </div>
        )
      
      case 'track-info':
        return (
          <div className="space-y-8">
            <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-6">
              <TrackInfo
                trackTitle={dummySubmission.track_title}
                artistName={dummySubmission.artist_name}
                fileUrl={dummySubmission.file_url}
                status={queueStatus}
              />
            </div>
            <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-6">
              <TrackInfo
                trackTitle={dummySubmission.track_title}
                artistName={dummySubmission.artist_name}
                fileUrl={dummySubmission.file_url}
                status={queueStatus}
                variant="large"
              />
            </div>
            <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-6">
              <TrackInfo
                trackTitle={dummySubmission.track_title}
                artistName={dummySubmission.artist_name}
                fileUrl={null}
                status="pending"
              />
            </div>
          </div>
        )
      
      case 'empty-state':
        return (
          <div className="space-y-4">
            <EmptyState
              title="No submissions yet"
              description="Submissions will appear here once artists start submitting tracks."
            />
          </div>
        )
      
      case 'loading-spinner':
        return (
          <div className="space-y-8">
            <div className="flex gap-8 items-center">
              <LoadingSpinner size="small" />
              <span className="text-dw-text">Small</span>
            </div>
            <div className="flex gap-8 items-center">
              <LoadingSpinner size="medium" />
              <span className="text-dw-text">Medium</span>
            </div>
            <div className="flex gap-8 items-center">
              <LoadingSpinner size="large" />
              <span className="text-dw-text">Large</span>
            </div>
          </div>
        )
      
      default:
        return <div className="text-dw-text">Select a component</div>
    }
  }

  return (
    <div className="min-h-screen bg-dw-base p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="dw-h1 text-dw-text mb-2">Component Playground</h1>
          <p className="dw-body text-dw-text-muted">
            Interactive development environment for testing UI components
          </p>
        </div>

        {/* Component Selector */}
        <div className="mb-8">
          <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-4">
            <label className="block text-sm font-semibold text-dw-text mb-3">
              Select Component:
            </label>
            <div className="flex flex-wrap gap-2">
              {components.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedComponent(comp.id)}
                  className={`px-4 py-2 rounded-sm border transition-colors ${
                    selectedComponent === comp.id
                      ? 'bg-dw-accent text-dw-base border-dw-accent'
                      : 'bg-dw-base border-border-dw-muted text-dw-text hover:border-dw-accent'
                  }`}
                >
                  {comp.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Component Render Area */}
        <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-8">
          <div className="mb-4 pb-4 border-b border-border-dw-muted">
            <h2 className="dw-h3 text-dw-text">{components.find(c => c.id === selectedComponent)?.name}</h2>
          </div>
          <div>{renderComponent()}</div>
        </div>

        {/* State Controls */}
        <div className="mt-8 bg-dw-surface border border-border-dw-muted rounded-sm p-4">
          <h3 className="text-lg font-bold text-dw-text mb-4">State Controls</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-dw-text">
              <input
                type="checkbox"
                checked={isLoading}
                onChange={(e) => setIsLoading(e.target.checked)}
                className="w-4 h-4"
              />
              Loading State
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}