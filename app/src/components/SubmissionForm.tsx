'use client'

import { useState } from 'react'
import { FileUploader } from './FileUploader'
import { createClient } from '@/lib/supabase'

interface SubmissionFormProps {
  eventId: string
  onSubmitSuccess?: () => void
}

export function SubmissionForm({ eventId, onSubmitSuccess }: SubmissionFormProps) {
  const [artistName, setArtistName] = useState('')
  const [trackTitle, setTrackTitle] = useState('')
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUploadComplete = (uploadedFileUrl: string, filename: string) => {
    setFileUrl(uploadedFileUrl)

    // Auto-fill track title from filename if empty
    if (!trackTitle) {
      const cleanName = filename.replace(/\.[^/.]+$/, '') // Remove extension
      setTrackTitle(cleanName)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fileUrl) {
      setError('Please upload an audio file first')
      return
    }

    if (!artistName || !trackTitle) {
      setError('Artist name and track title are required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Insert submission into database
      const { error: dbError } = await supabase
        .from('submissions')
        .insert({
          event_id: eventId,
          artist_name: artistName,
          track_title: trackTitle,
          file_url: fileUrl,
          status: 'pending',
        })

      if (dbError) throw dbError

      // Log submission event
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          action: 'submit',
          payload: { artist_name: artistName, track_title: trackTitle },
        }),
      })

      // Success!
      onSubmitSuccess?.()

      // Reset form
      setArtistName('')
      setTrackTitle('')
      setFileUrl(null)
    } catch (err) {
      console.error('Submission failed:', err)
      setError('Failed to submit track. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-8">
      <h2 className="text-2xl font-bold text-dw-text mb-6">Submit Your Track</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-dw-text mb-2">
            Audio File *
          </label>
          <FileUploader
            eventId={eventId}
            onUploadComplete={handleUploadComplete}
            onUploadError={(err) => setError(err.message)}
          />
        </div>

        {/* Artist Name */}
        <div>
          <label htmlFor="artist" className="block text-sm font-semibold text-dw-text mb-2">
            Artist Name *
          </label>
          <input
            id="artist"
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            className="w-full bg-dw-base border border-border-dw-muted rounded-sm px-4 py-3 text-dw-text focus:outline-none focus:border-dw-accent"
            placeholder="Your artist name"
            required
          />
        </div>

        {/* Track Title */}
        <div>
          <label htmlFor="track" className="block text-sm font-semibold text-dw-text mb-2">
            Track Title *
          </label>
          <input
            id="track"
            type="text"
            value={trackTitle}
            onChange={(e) => setTrackTitle(e.target.value)}
            className="w-full bg-dw-base border border-border-dw-muted rounded-sm px-4 py-3 text-dw-text focus:outline-none focus:border-dw-accent"
            placeholder="Track title"
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-dw-alert/10 border border-dw-alert rounded-sm p-4">
            <p className="text-dw-alert text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!fileUrl || isSubmitting}
          className="w-full bg-dw-accent text-dw-base font-bold px-6 py-3 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dw-accent/90 transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Track'}
        </button>
      </form>
    </div>
  )
}
