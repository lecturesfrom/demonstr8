'use client'

import { useEffect, useRef, useState } from 'react'
import type Hls from 'hls.js'

interface IVSPlayerProps {
  playbackUrl: string | null
  /** Event ID for future analytics/logging */
  eventId?: string
}

const MAX_RETRIES = 5
const BASE_DELAY_MS = 1000

export function IVSPlayer({ playbackUrl }: IVSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const hlsRetryRef = useRef<number>(0)
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!playbackUrl || !videoRef.current) return

    const setupPlayer = async () => {
      try {
        const video = videoRef.current!

        // Ensure playback URL ends with .m3u8 for HLS
        const hlsUrl = playbackUrl.endsWith('.m3u8') ? playbackUrl : `${playbackUrl}.m3u8`

        // Check if HLS is supported natively (Safari, iOS, etc.)
        if (video.canPlayType('application/vnd.apple.mpegurl') ||
          video.canPlayType('application/x-mpegURL')) {
          video.src = hlsUrl
          video.onerror = () => {
            setError('Failed to load stream.')
          }
          setError(null)
        } else {
          // For browsers without native HLS support, use HLS.js
          try {
            const HlsModule = await import('hls.js')
            const Hls = HlsModule.default

            if (Hls.isSupported()) {
              // Clean up previous HLS instance if it exists
              if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
              }
              // Clear any pending retry timer and reset retry count for new stream
              if (retryTimerRef.current) {
                clearTimeout(retryTimerRef.current)
                retryTimerRef.current = null
              }
              hlsRetryRef.current = 0

              const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
              })

              hls.loadSource(hlsUrl)
              hls.attachMedia(video)
              hlsRef.current = hls

              hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      // Clear any existing retry timer
                      if (retryTimerRef.current) {
                        clearTimeout(retryTimerRef.current)
                        retryTimerRef.current = null
                      }

                      // Check if we've exceeded max retries
                      if (hlsRetryRef.current >= MAX_RETRIES) {
                        setError('Network error. Maximum retry attempts reached. Please refresh the page.')
                        hls.destroy()
                        hlsRef.current = null
                        return
                      }

                      // Increment retry count
                      hlsRetryRef.current += 1

                      // Calculate exponential backoff delay: BASE_DELAY_MS * 2^(retryCount - 1)
                      const delay = BASE_DELAY_MS * Math.pow(2, hlsRetryRef.current - 1)

                      setError(`Network error. Retrying... (${hlsRetryRef.current}/${MAX_RETRIES})`)

                      // Set timeout to retry after backoff delay
                      retryTimerRef.current = setTimeout(() => {
                        retryTimerRef.current = null
                        hls.startLoad()
                      }, delay)
                      break
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      setError('Media error. Trying to recover...')
                      hls.recoverMediaError()
                      // Reset retry count on successful media recovery
                      hlsRetryRef.current = 0
                      if (retryTimerRef.current) {
                        clearTimeout(retryTimerRef.current)
                        retryTimerRef.current = null
                      }
                      break
                    default:
                      setError('Failed to load stream.')
                      hls.destroy()
                      hlsRef.current = null
                      break
                  }
                }
              })

              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setError(null)
                // Reset retry count on successful load
                hlsRetryRef.current = 0
                // Clear any pending retry timer
                if (retryTimerRef.current) {
                  clearTimeout(retryTimerRef.current)
                  retryTimerRef.current = null
                }
              })

              setError(null)
            } else {
              // Browser doesn't support HLS.js, try direct URL anyway
              console.warn('HLS.js not supported, trying direct URL')
              video.src = hlsUrl
              setError(null)
            }
          } catch (importError) {
            // If hls.js import fails, try direct URL (may work on some browsers)
            console.warn('HLS.js not available, trying direct URL:', importError)
            video.src = hlsUrl
            setError(null)
          }
        }
      } catch (error) {
        console.error('Error setting up IVS player:', error)
        setError('Failed to initialize video player.')
      }
    }

    setupPlayer()

    // Cleanup function
    return () => {
      // Clear any pending retry timer
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current)
        retryTimerRef.current = null
      }
      // Destroy HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      // Reset retry count
      hlsRetryRef.current = 0
    }
  }, [playbackUrl])

  if (!playbackUrl) {
    return (
      <div className="aspect-video bg-dw-surface border border-border-dw-muted rounded-sm flex items-center justify-center">
        <div className="text-center">
          <p className="text-dw-muted text-lg mb-2">Stream Offline</p>
          <p className="text-dw-text-muted text-sm">Waiting for the host to go live...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="aspect-video bg-black rounded-sm overflow-hidden relative">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        autoPlay={!error}
        playsInline
        muted
      />
      {error && (
        <div className="absolute inset-0 bg-dw-surface/95 flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-dw-alert text-lg mb-2">Stream Error</p>
            <p className="text-dw-text-muted text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}