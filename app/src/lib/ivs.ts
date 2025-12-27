/**
 * AWS IVS Integration Module
 * Handles channel creation, streaming, and playback
 * 
 * Note: AWS SDK imports are used server-side in /api/ivs routes.
 * This client-side module calls those API routes.
 */

// Initialize IVS client (will use Edge Functions for actual API calls)
export interface IVSChannelInfo {
  channelArn: string
  streamKey: string
  ingestEndpoint: string
  playbackUrl: string
}

/**
 * Creates an IVS channel for a creator
 * This will be called from a Supabase Edge Function
 */
export async function createIVSChannel(
  creatorId: string,
  sessionName: string
): Promise<IVSChannelInfo> {
  // This function will call our Edge Function endpoint
  const response = await fetch('/api/ivs/create-channel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creatorId, sessionName }),
  })

  if (!response.ok) {
    throw new Error('Failed to create IVS channel')
  }

  return response.json()
}

/**
 * Gets the playback URL for a session
 */
export async function getSessionPlaybackUrl(sessionId: string): Promise<string> {
  const response = await fetch('/api/ivs/get-playback-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  })

  if (!response.ok) {
    throw new Error('Failed to get playback URL')
  }

  const data = await response.json()
  return data.playbackUrl
}

/**
 * Formats the IVS playback URL for the player
 */
export function formatPlaybackUrl(playbackUrl: string): string {
  // IVS playback URLs need to be in HLS format
  if (!playbackUrl.endsWith('.m3u8')) {
    return `${playbackUrl}.m3u8`
  }
  return playbackUrl
}

/**
 * Validates if a stream is live
 * This will check the channel status via our API
 */
export async function isStreamLive(channelArn: string): Promise<boolean> {
  const response = await fetch('/api/ivs/channel-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelArn }),
  })

  if (!response.ok) {
    // Only return false for 404 (channel not found) or specific "not live" responses
    if (response.status === 404) {
      return false
    }
    throw new Error(`Failed to check stream status: ${response.status} ${response.statusText}`)
  }

  try {
    const data = await response.json()
    return data.isLive ?? false
  } catch (error) {
    throw new Error('Invalid JSON response from channel-status endpoint', { cause: error })
  }
}