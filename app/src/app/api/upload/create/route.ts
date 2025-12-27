import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase-server'
import { nanoid } from 'nanoid'
import { FILE_UPLOAD } from '@/lib/constants'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { filename, eventId, fileSize } = await request.json()

    if (!filename || !eventId) {
      return NextResponse.json({ error: 'Filename and eventId required' }, { status: 400 })
    }

    // Get authenticated user from request cookies
    const cookieStore = await cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Validate file extension
    const fileExt = filename.split('.').pop()?.toLowerCase()
    if (!fileExt) {
      return NextResponse.json(
        { error: 'Filename must have an extension' },
        { status: 400 }
      )
    }
    const fileExtWithDot = `.${fileExt}` as string
    if (!FILE_UPLOAD.ALLOWED_EXTENSIONS.some(ext => ext === fileExtWithDot)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size if provided
    if (fileSize !== undefined) {
      if (fileSize > FILE_UPLOAD.MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File too large. Maximum size is ${FILE_UPLOAD.MAX_SIZE_MB}MB` },
          { status: 400 }
        )
      }
    }

    // Generate unique file path with user ID as first folder
    const uniqueId = nanoid()
    const storagePath = `${userId}/submissions/${eventId}/${uniqueId}.${fileExt}`

    // Use service role client for creating signed upload URL
    const supabase = createClient()

    // Create a signed upload URL
    const { data, error } = await supabase.storage
      .from('audio-submissions')
      .createSignedUploadUrl(storagePath)

    if (error) {
      console.error('Failed to create upload URL:', error)
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
    }

    // Get the public URL for the file (will be accessible after upload)
    const { data: { publicUrl } } = supabase.storage
      .from('audio-submissions')
      .getPublicUrl(storagePath)

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      uploadToken: data.token,
      fileUrl: publicUrl,
      storagePath,
    })
  } catch (error) {
    console.error('Upload creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create upload URL' },
      { status: 500 }
    )
  }
}