#!/usr/bin/env node
/**
 * Quick script to create a test event with sample data
 * Run with: node setup-test-event.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local')

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found at:', envPath)
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables:')
  if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  if (!serviceRoleKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const { data: existingEvent, error: existingError } = await supabase
  .from('events')
  .select('id, token, name')
  .eq('token', 'demo123')
  .single()

if (existingError && existingError.code !== 'PGRST116') {
  console.error('❌ Error checking for existing event:', existingError)
  return
}

async function setupTestEvent() {
  console.log('🚀 Setting up test event...\n')

  // Check if test event already exists
  const { data: existingEvent } = await supabase
    .from('events')
    .select('id, token, name')
    .eq('token', 'demo123')
    .single()
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1
  })

  let testUserId
  if (users && users.length > 0) {
    testUserId = users[0].id
    console.log(`📝 Using existing user: ${users[0].email || testUserId}`)
  } else {
    // Create a test auth user if none exist
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'testhost@example.com',
      password: process.env.TEST_USER_PASSWORD || Math.random().toString(36).slice(-12),
      email_confirm: true,
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError)
      return
    }
    testUserId = authData.user.id
    console.log('✅ Created test auth user: testhost@example.com')
  }
  email_confirm: true,
    })

if (authError) {
  console.error('❌ Error creating auth user:', authError)
  return
}
testUserId = authData.user.id
console.log('✅ Created test auth user: testhost@example.com')
  }

// Create test profile
const { error: profileError } = await supabase
  .from('profiles')
  .upsert({
    id: testUserId,
    display_name: 'Test Host',
    role: 'host',
  })

if (profileError && profileError.code !== '23505') {
  console.error('❌ Error creating profile:', profileError)
  return
}

// Create test event
const testEventId = '22222222-2222-2222-2222-222222222222'
const { data: event, error: eventError } = await supabase
  .from('events')
  .insert({
    id: testEventId,
    host_id: testUserId,
    name: 'Friday Night Listening Party',
    token: 'demo123',
    is_live: true,
    ivs_channel_arn: 'arn:aws:ivs:us-east-1:123456789012:channel/test',
    ivs_playback_url: 'https://test.ivs.amazonaws.com/test.m3u8',
    starts_at: new Date().toISOString(),
  })
  .select()
  .single()

if (eventError) {
  console.error('❌ Error creating event:', eventError)
  return
}

// Create sample submissions
const submissions = [
  {
    event_id: testEventId,
    artist_name: 'Emerging Artist',
    track_title: 'Midnight Dreams',
    status: 'pending',
    file_url: 'https://example.com/track1.mp3',
  },
  {
    event_id: testEventId,
    artist_name: 'DJ Shadow',
    track_title: 'Building Steam',
    status: 'approved',
    queue_position: 1,
    file_url: 'https://example.com/track2.mp3',
  },
  {
    event_id: testEventId,
    artist_name: 'Boards of Canada',
    track_title: 'Roygbiv',
    status: 'approved',
    queue_position: 2,
    file_url: 'https://example.com/track3.mp3',
  },
]

const { error: submissionError } = await supabase
  .from('submissions')
  .insert(submissions)

if (submissionError) {
  console.error('⚠️  Error creating submissions:', submissionError)
}

console.log('✅ Test event created successfully!\n')
printUrls(testEventId, 'demo123')
}

function printUrls(eventId, token) {
  console.log('📱 Access your app at:\n')
  console.log(`🎤 Submit tracks:`)
  console.log(`   http://localhost:3001/submit/${token}\n`)
  console.log(`🎛️  Host dashboard:`)
  console.log(`   http://localhost:3001/host/${eventId}\n`)
  console.log(`📺 Live page:`)
  console.log(`   http://localhost:3001/live/${eventId}\n`)
}

setupTestEvent().catch(console.error)
