import { NextResponse } from 'next/server';

interface RateLimitConfig {
  limit: number;      // Max requests allowed in the window
  windowMs: number;   // Window size in milliseconds
}

// In-memory store for rate limiting data
const rateLimitStore = new Map<string, number[]>();

// Keep a reference to the interval to prevent multiple registrations during hot reloads
const globalAny = globalThis as any;
if (!globalAny.rateLimitCleanupInterval) {
  globalAny.rateLimitCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of rateLimitStore.entries()) {
      // Keep only timestamps within the longest possible window (e.g. 15 minutes)
      const validTimestamps = timestamps.filter(t => now - t < 15 * 60 * 1000);
      if (validTimestamps.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, validTimestamps);
      }
    }
  }, 5 * 60 * 1000);
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}

function isThrottled(key: string, config: RateLimitConfig, now: number): boolean {
  const timestamps = rateLimitStore.get(key) || [];
  
  // Filter out expired timestamps
  const validTimestamps = timestamps.filter(t => now - t < config.windowMs);
  
  if (validTimestamps.length >= config.limit) {
    rateLimitStore.set(key, validTimestamps);
    return true;
  }
  
  // Add current timestamp and save
  validTimestamps.push(now);
  rateLimitStore.set(key, validTimestamps);
  return false;
}

function create429Response(windowMs: number): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(windowMs / 1000)),
      },
    }
  );
}

/**
 * Checks if the request exceeds rate limits.
 * Returns a 429 NextResponse if throttled, or null if allowed.
 */
export async function checkRateLimit(
  request: Request,
  options?: {
    userId?: string | null;
    ipConfig?: RateLimitConfig;
    userConfig?: RateLimitConfig;
  }
) {
  const now = Date.now();
  
  // 1. Resolve IP config and check
  const ipConfig = options?.ipConfig || { limit: 60, windowMs: 60 * 1000 }; // Default: 60 requests per minute
  const ip = getClientIp(request);
  const ipKey = `ip:${ip}`;
  
  if (isThrottled(ipKey, ipConfig, now)) {
    return create429Response(ipConfig.windowMs);
  }
  
  // 2. Resolve User config and check (if userId is provided)
  const userId = options?.userId;
  if (userId) {
    const userConfig = options?.userConfig || { limit: 100, windowMs: 60 * 1000 }; // Default: 100 requests per minute
    const userKey = `user:${userId}`;
    if (isThrottled(userKey, userConfig, now)) {
      return create429Response(userConfig.windowMs);
    }
  }
  
  return null;
}
