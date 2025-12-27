/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requireAuth, requireEventHost, rateLimit } from '@/lib/auth-middleware'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

describe('Authentication Middleware', () => {
  let mockClient: ReturnType<typeof createClient>
  let mockChain: ReturnType<typeof mockClient.from>

  beforeEach(() => {
    mockClient = createClient()
    mockChain = mockClient.from()

    // Clear mock state to prevent pollution between tests
    mockClient.auth.getSession.mockClear()
    mockChain.single.mockClear()
  })

  describe('requireAuth', () => {
    it('should allow authenticated requests', async () => {
      // Mock successful authentication
      mockClient.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      })

      // Mock profile query
      mockChain.single.mockResolvedValueOnce({
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
      mockClient.auth.getSession.mockResolvedValueOnce({
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
      // Mock auth session
      mockClient.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'host-123' } } },
        error: null,
      })

      // First call is for profile, second is for event ownership
      mockChain.single
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
        json: async () => ({ eventId: 'event-123' }),
        userId: 'host-123',
      } as unknown as NextRequest

      const protectedHandler = await requireEventHost(mockHandler)
      const response = await protectedHandler(request)

      expect(response.status).toBe(200)
    })

    it('should reject non-host users', async () => {
      // Mock auth session
      mockClient.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-123' } } },
        error: null,
      })

      // First call for profile, second for event ownership
      mockChain.single
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
        json: async () => ({ eventId: 'event-123' }),
        userId: 'user-123',
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
