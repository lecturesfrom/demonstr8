import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requireAuth, requireEventHost, rateLimit } from '@/lib/auth-middleware'
import { NextRequest, NextResponse } from 'next/server'

// Create singleton mock objects that persist across all createClient() calls
const mockSingle = vi.fn()
const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: mockSingle,
}

const mockGetSession = vi.fn()
const mockSupabaseClient = {
  auth: {
    getSession: mockGetSession,
  },
  from: vi.fn(() => mockQueryBuilder),
}

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

describe('Authentication Middleware', () => {
  beforeEach(() => {
    // Clear all mocks between tests
    vi.clearAllMocks()
  })

  describe('requireAuth', () => {
    it('should allow authenticated requests', async () => {
      // Mock successful authentication
      mockGetSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      })

      // Mock profile query
      mockSingle.mockResolvedValueOnce({
        data: { role: 'host' },
        error: null,
      })

      const mockHandler = vi.fn(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      )

      const protectedHandler = await requireAuth(mockHandler)
      const request = new NextRequest('http://localhost:3000/api/test')

      const response = await protectedHandler(request)

      expect(mockHandler).toHaveBeenCalledWith(request, undefined)
      expect(response.status).toBe(200)
    })

    it('should reject unauthenticated requests', async () => {
      // Mock failed authentication
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      const mockHandler = vi.fn()
      const protectedHandler = await requireAuth(mockHandler)
      const request = new NextRequest('http://localhost:3000/api/test')

      const response = await protectedHandler(request)
      const data = await response.json()

      expect(mockHandler).not.toHaveBeenCalled()
      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })
  })

  describe('requireEventHost', () => {
    it('should allow event host to access', async () => {
      // Mock auth session (called twice - once in requireAuth wrapper, once in requireEventHost)
      mockGetSession
        .mockResolvedValueOnce({
          data: { session: { user: { id: 'host-123' } } },
          error: null,
        })

      // First call is for profile, second is for event ownership
      mockSingle
        .mockResolvedValueOnce({
          data: { role: 'host' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { host_id: 'host-123' },
          error: null,
        })

      const mockHandler = vi.fn(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      )

      const request = {
        json: vi.fn().mockResolvedValue({ eventId: 'event-123' }),
      } as unknown as NextRequest

      const protectedHandler = await requireEventHost(mockHandler)
      const response = await protectedHandler(request)

      expect(response.status).toBe(200)
    })

    it('should reject non-host users', async () => {
      // Mock auth session
      mockGetSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      })

      // First call for profile, second for event ownership
      mockSingle
        .mockResolvedValueOnce({
          data: { role: 'fan' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { host_id: 'different-host' },
          error: null,
        })

      const mockHandler = vi.fn()
      const request = {
        json: vi.fn().mockResolvedValue({ eventId: 'event-123' }),
      } as unknown as NextRequest

      const protectedHandler = await requireEventHost(mockHandler)
      const response = await protectedHandler(request)
      const data = await response.json()

      expect(mockHandler).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
      expect(data.error).toBe('Not authorized to manage this event')
    })
  })

  describe('rateLimit', () => {
    it('should allow requests within rate limit', async () => {
      const mockHandler = vi.fn(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      )

      const rateLimited = rateLimit(3, 1000)(mockHandler)
      const request = new NextRequest('http://localhost:3000/api/test')

      // Make 3 requests (within limit)
      for (let i = 0; i < 3; i++) {
        const response = await rateLimited(request)
        expect(response.status).toBe(200)
      }

      expect(mockHandler).toHaveBeenCalledTimes(3)
    })

    it('should reject requests exceeding rate limit', async () => {
      const mockHandler = vi.fn(() =>
        Promise.resolve(NextResponse.json({ success: true }))
      )

      const rateLimited = rateLimit(2, 1000)(mockHandler)
      const request = new NextRequest('http://localhost:3000/api/test')

      // Make 2 requests (reach limit)
      for (let i = 0; i < 2; i++) {
        await rateLimited(request)
      }

      // 3rd request should be rate limited
      const response = await rateLimited(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Too many requests')
      expect(mockHandler).toHaveBeenCalledTimes(2)
    })
  })
})
