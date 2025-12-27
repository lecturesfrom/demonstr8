/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'
import { POST } from '@/app/api/queue/approve/route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'

describe('Queue Approve API', () => {
  let mockClient: ReturnType<typeof createClient>
  let mockChain: ReturnType<typeof mockClient.from>

  beforeEach(() => {
    mockClient = createClient()
    mockChain = mockClient.from()
  })

  it('should approve a submission successfully', async () => {
    // Mock the max position query
    mockChain.single.mockResolvedValueOnce({
      data: { queue_position: 5 },
      error: null,
    })

    // Mock the update query
    mockChain.single.mockResolvedValueOnce({
      data: {
        id: 'test-submission-id',
        event_id: 'test-event-id',
        status: 'approved',
        queue_position: 6,
      },
      error: null,
    })

    const mockRequest = {
      json: async () => ({
        submissionId: 'test-submission-id',
      }),
    } as unknown as NextRequest

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.queue_position).toBe(6)
    expect(data.data.status).toBe('approved')
  })

  it('should return error if submissionId is missing', async () => {
    const mockRequest = {
      json: async () => ({}),
    } as unknown as NextRequest

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('submissionId is required')
  })

  it('should handle database errors gracefully', async () => {
    // Mock successful max position query
    mockChain.single.mockResolvedValueOnce({
      data: { queue_position: 5 },
      error: null,
    })

    // Mock failed update query
    mockChain.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' },
    })

    const mockRequest = {
      json: async () => ({
        submissionId: 'test-submission-id',
      }),
    } as unknown as NextRequest

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to approve submission')
  })
})
