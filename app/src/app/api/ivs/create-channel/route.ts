import { NextResponse } from 'next/server'
import { IvsClient, CreateChannelCommand } from '@aws-sdk/client-ivs'
import { createClient } from '@/lib/supabase-server'

// Initialize IVS client
const ivsClient = new IvsClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { creatorId, sessionName } = await request.json()

    if (!creatorId || !sessionName) {
      return NextResponse.json(
        { error: 'Creator ID and session name required' },
        { status: 400 }
      )
    }

    // Create IVS channel
    const createChannelCommand = new CreateChannelCommand({
      name: `${sessionName}-${Date.now()}`,
      latencyMode: 'NORMAL', // or 'LOW' for sub-second latency
      type: 'STANDARD', // or 'BASIC' for lower quality/cost
    })

    const channelResponse = await ivsClient.send(createChannelCommand)

    if (!channelResponse.channel || !channelResponse.streamKey) {
      throw new Error('Failed to create IVS channel')
    }

    if (
      !channelResponse.channel.arn ||
      !channelResponse.streamKey.value ||
      !channelResponse.channel.ingestEndpoint ||
      !channelResponse.channel.playbackUrl
    ) {
      throw new Error('Missing required channel properties in AWS response')
    }

    const channelInfo = {
      channelArn: channelResponse.channel.arn,
      streamKey: channelResponse.streamKey.value,
      ingestEndpoint: channelResponse.channel.ingestEndpoint,
      playbackUrl: channelResponse.channel.playbackUrl,
    }

    // First, fetch the latest event ID
    const { data: latestEvent, error: fetchError } = await supabase
      .from('events')
      .select('id')
      .eq('host_id', creatorId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !latestEvent) {
      console.error('Failed to find event for host:', fetchError)
      return NextResponse.json(
        { error: 'Event not found for creator' },
        { status: 404 }
      )
    }

    // Update the event with IVS channel info
    const { error } = await supabase
      .from('events')
      .update({
        ivs_channel_arn: channelInfo.channelArn,
        ivs_stream_key: channelInfo.streamKey,
        ivs_ingest_endpoint: channelInfo.ingestEndpoint,
        ivs_playback_url: channelInfo.playbackUrl,
      })
      .eq('id', latestEvent.id)

    if (error) {
      console.error('Failed to update event with IVS info:', error)
    }

    return NextResponse.json(channelInfo)
  } catch (error) {
    console.error('IVS channel creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create IVS channel' },
      { status: 500 }
    )
  }
}
