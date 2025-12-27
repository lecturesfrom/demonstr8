'use client'

import { useState, useRef } from 'react'

interface FileUploaderProps {
  eventId?: string
  onUploadComplete: (fileUrl: string, filename: string) => void
  onUploadError?: (error: Error) => void
}

export function FileUploader({ eventId, onUploadComplete, onUploadError }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      onUploadError?.(new Error('Please select an audio file'))
      return
    }

    // Validate file size (50MB max for Supabase Free tier)
    // Upgrade to Pro for 5GB uploads
    if (file.size > 50 * 1024 * 1024) {
      onUploadError?.(new Error('File too large. Maximum size is 50MB'))
      return
    }

    setSelectedFile(file)
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      // Get Supabase upload URL
      const res = await fetch('/api/upload/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          eventId: eventId,
          fileSize: file.size
        }),
      })

      if (!res.ok) throw new Error('Failed to create upload URL')

      const { uploadUrl, fileUrl } = await res.json()

      // Upload to Supabase Storage
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadRes.ok) throw new Error('Upload failed')

      setUploadProgress(100)
      onUploadComplete(fileUrl, file.name)
    } catch (error) {
      onUploadError?.(error as Error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-border-dw-muted rounded-sm p-8 text-center bg-dw-base hover:border-dw-accent transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {!selectedFile ? (
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-dw-surface border border-border-dw-muted text-dw-text px-6 py-3 rounded-sm hover:border-dw-accent transition-colors"
            >
              Browse files
            </button>
            <p className="text-sm text-dw-muted mt-4">
              MP3, WAV, M4A, AAC • Max 50MB
            </p>
          </div>
        ) : (
          <div>
            <p className="text-dw-text font-semibold mb-2">{selectedFile.name}</p>
            <p className="text-sm text-dw-muted mb-4">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {uploading && (
              <div className="w-full bg-dw-surface rounded-full h-2 mb-4">
                <div
                  className="bg-dw-accent h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            {!uploading && uploadProgress === 100 && (
              <p className="text-dw-success text-sm">✓ Upload complete</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
