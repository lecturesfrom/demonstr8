'use client'

import { useState, useRef } from 'react'

interface FileUploaderProps {
  onUploadComplete: (uploadId: string, filename: string) => void
  onUploadError?: (error: Error) => void
}

export function FileUploader({ onUploadComplete, onUploadError }: FileUploaderProps) {
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

    // Validate file size (500MB max)
    if (file.size > 500 * 1024 * 1024) {
      onUploadError?.(new Error('File too large. Maximum size is 500MB'))
      return
    }

    setSelectedFile(file)
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      // Get Mux upload URL
      const res = await fetch('/api/mux/create-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      })

      if (!res.ok) throw new Error('Failed to create upload URL')

      const { uploadUrl, uploadId } = await res.json()

      // Upload to Mux using fetch
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadRes.ok) throw new Error('Upload failed')

      setUploadProgress(100)
      onUploadComplete(uploadId, file.name)
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
              Audio files only, up to 500MB
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
