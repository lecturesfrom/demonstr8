import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export interface AuthenticatedRequest extends NextRequest {
  userId?: string
  userRole?: string
}

interface RouteContext {
  params?: Record<string, string>
}

/**
 * Middleware to require authentication for API routes
 */
export async function requireAuth(
  handler: (req: NextRequest, context?: RouteContext) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: RouteContext) => {
    try {
      const supabase = createClient()

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const userId = session.user?.id

      if (!userId || typeof userId !== 'string') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Auth middleware profile lookup error:', profileError)
        return NextResponse.json(
          { error: 'Failed to verify user profile' },
          { status: 500 }
        )
      }

      const authedReq = req as AuthenticatedRequest
      authedReq.userId = userId
      authedReq.userRole = profile.role || 'fan'

      return handler(req, context)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware to require host role for event operations
 */
export async function requireEventHost(
  handler: (req: NextRequest, context?: RouteContext) => Promise<NextResponse>
) {
  return requireAuth(async (req: NextRequest, context?: RouteContext) => {
    try {
      const { eventId } = await req.json()

      if (!eventId) {
        return NextResponse.json(
          { error: 'Event ID required' },
          { status: 400 }
        )
      }

      const supabase = createClient()
      const authedReq = req as AuthenticatedRequest
      const userId = authedReq.userId

      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', eventId)
        .single()

      if (eventError || !event) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }

      if (event.host_id !== userId) {
        return NextResponse.json(
          { error: 'Not authorized to manage this event' },
          { status: 403 }
        )
      }

      return handler(req, context)
    } catch (error) {
      console.error('Event host check error:', error)
      return NextResponse.json(
        { error: 'Authorization failed' },
        { status: 500 }
      )
    }
  })
}

/**
 * Rate limiting middleware
 */
export function rateLimit(
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
) {
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

  return (handler: (req: NextRequest, context?: RouteContext) => Promise<NextResponse>) => {
    return async (req: NextRequest, context?: RouteContext) => {
      // Get client identifier (IP or user ID)
      const authedReq = req as AuthenticatedRequest
      const clientId = authedReq.userId ||
        req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        'unknown'

      const now = Date.now()
      const clientData = rateLimitMap.get(clientId)

      if (clientData) {
        if (now < clientData.resetTime) {
          if (clientData.count >= maxRequests) {
            return NextResponse.json(
              { error: 'Too many requests' },
              { status: 429 }
            )
          }
          clientData.count++
        } else {
          // Reset the window
          rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs })
        }
      } else {
        rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs })
      }

      // Clean up old entries periodically
      if (Math.random() < 0.01) { // 1% chance
        for (const [key, value] of rateLimitMap.entries()) {
          if (now > value.resetTime) {
            rateLimitMap.delete(key)
          }
        }
      }

      return handler(req, context)
    }
  }
}
