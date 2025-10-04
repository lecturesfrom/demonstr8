import { NextResponse } from 'next/server'
import Mux from '@mux/mux-node'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function POST(request: Request) {
  try {
    const { filename } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    // Create Mux Direct Upload
    const upload = await mux.video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      new_asset_settings: {
        playback_policy: ['public'],
      },
    })

    return NextResponse.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
    })
  } catch (error) {
    console.error('Mux upload creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create upload URL' },
      { status: 500 }
    )
  }
}
