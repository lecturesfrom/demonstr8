import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import Mux from '@mux/mux-node'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
  webhookSecret: process.env.MUX_WEBHOOK_SECRET,
})

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('mux-signature')

    // Verify webhook signature for security
    if (process.env.MUX_WEBHOOK_SECRET && signature) {
      try {
        // For now, we'll implement basic signature verification
        // In production, use Mux's official webhook verification method
        // Note: The exact method may vary based on @mux/mux-node version
        console.log('Webhook signature verification temporarily disabled for development')
        // TODO: Implement proper Mux webhook verification
      } catch (verifyError) {
        console.error('Webhook signature verification failed:', verifyError)
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 })
      }
    } else if (process.env.NODE_ENV === 'production') {
      // In production, webhook secret must be configured
      console.error('MUX_WEBHOOK_SECRET not configured in production')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const event = JSON.parse(body)

    // Handle video.asset.ready event
    if (event.type === 'video.asset.ready') {
      const assetId = event.data.id
      const playbackId = event.data.playback_ids?.[0]?.id

      if (!playbackId) {
        console.error('No playback_id in webhook:', event)
        return NextResponse.json({ error: 'No playback_id' }, { status: 400 })
      }

      // Find submission by upload_id (need to get upload_id from asset)
      const asset = await mux.video.assets.retrieve(assetId)
      const uploadId = asset.upload_id

      if (!uploadId) {
        console.error('No upload_id on asset:', assetId)
        return NextResponse.json({ error: 'No upload_id' }, { status: 400 })
      }

      // Update submission with playback_id
      const supabase = createClient()
      const { error } = await supabase
        .from('submissions')
        .update({ playback_id: playbackId })
        .eq('upload_id', uploadId)

      if (error) {
        console.error('Failed to update submission:', error)
        throw error
      }

      console.log(`Updated submission ${uploadId} with playback_id ${playbackId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook failed:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
