/**
 * AudioPlayer Component
 *
 * What: HTML5 audio player for submitted tracks
 * Why: Plays the actual audio file when host clicks "Play"
 * How it helps users: Everyone hears the submitted track in real-time
 *
 * Technical: Uses native HTML5 <audio> element with Supabase Storage URLs
 */

'use client'

import { useEffect, useRef, useState } from 'react'

interface AudioPlayerProps {
  fileUrl: string | null
  trackTitle: string
  artistName: string
}

export function AudioPlayer({ fileUrl, trackTitle, artistName }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [autoPlayFailed, setAutoPlayFailed] = useState(false)

  // Load audio when file URL changes
  useEffect(() => {
    if (!audioRef.current || !fileUrl) return

    setIsLoading(true)
    setAutoPlayFailed(false)
    audioRef.current.src = fileUrl
    audioRef.current.load()

    // Try to auto-play when ready (if user has interacted)
    const handleCanPlay = () => {
      setIsLoading(false)

      // Only try auto-play if user has interacted with the page
      if (userInteracted) {
        audioRef.current?.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            console.log('Auto-play blocked by browser - user needs to click play')
            setAutoPlayFailed(true)
          })
      } else {
        // User hasn't interacted yet - wait for them to click play
        setAutoPlayFailed(true)
      }
    }

    const currentAudioRef = audioRef.current
    currentAudioRef.addEventListener('canplay', handleCanPlay)

    return () => {
      currentAudioRef?.removeEventListener('canplay', handleCanPlay)
    }
  }, [fileUrl, userInteracted])

  // Update time and duration
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    // Mark that user has interacted
    setUserInteracted(true)
    setAutoPlayFailed(false)

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Play failed:', err))
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const newTime = parseFloat(e.target.value)
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!fileUrl) {
    return (
      <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-6 text-center">
        <p className="text-dw-muted text-sm">No audio file available</p>
      </div>
    )
  }

  return (
    <div className="bg-dw-surface border border-dw-accent rounded-sm p-6">
      <audio ref={audioRef} preload="auto" />

      {/* Track Info */}
      <div className="mb-4">
        <p className="text-xs text-dw-muted uppercase tracking-wider mb-1">Now Playing</p>
        <h3 className="text-lg font-bold text-dw-text">{trackTitle}</h3>
        <p className="text-sm text-dw-text-muted">{artistName}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-dw-base rounded-sm appearance-none cursor-pointer accent-dw-accent"
          style={{
            background: `linear-gradient(to right, var(--dw-accent) 0%, var(--dw-accent) ${duration ? (currentTime / duration) * 100 : 0}%, var(--dw-base) ${duration ? (currentTime / duration) * 100 : 0}%, var(--dw-base) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-dw-muted mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="bg-dw-accent text-dw-base px-8 py-3 rounded-sm font-bold hover:bg-dw-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="mt-4 text-center">
          <p className="text-xs text-dw-muted animate-pulse">Loading audio...</p>
        </div>
      )}

      {/* Auto-play blocked message */}
      {autoPlayFailed && !isPlaying && !isLoading && (
        <div className="mt-4 text-center bg-dw-accent/10 border border-dw-accent rounded-sm p-3">
          <p className="text-sm text-dw-text">
            🎵 <strong>Track ready!</strong> Click Play to start
          </p>
        </div>
      )}
    </div>
  )
}
