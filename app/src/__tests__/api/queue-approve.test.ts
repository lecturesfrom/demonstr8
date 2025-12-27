import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/queue/approve/route'
import { NextRequest } from 'next/server'

// Create singleton mock objects
const mockMaybeSingle = vi.fn()
const mockSingle = vi.fn()
const mockInsert = vi.fn().mockResolvedValue({ error: null })

const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnValue({ error: null }),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  maybeSingle: mockMaybeSingle,
  single: mockSingle,
}

const mockSupabaseClient = {
  from: vi.fn(() => mockQueryBuilder),
}

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

describe('Queue Approve API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset default insert behavior
    mockQueryBuilder.insert = vi.fn().mockResolvedValue({ error: null })
  })

  it('should approve a submission successfully', async () => {
    // Mock the max position query (maybeSingle)
    mockMaybeSingle.mockResolvedValueOnce({
      data: { queue_position: 5 },
      error: null,
    })

    // Mock the update query (single)
    mockSingle.mockResolvedValueOnce({
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
    mockMaybeSingle.mockResolvedValueOnce({
      data: { queue_position: 5 },
      error: null,
    })

    // Mock failed update query
    mockSingle.mockResolvedValueOnce({
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
