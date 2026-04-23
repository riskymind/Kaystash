import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

function createRedis(): Redis | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const redis = createRedis();

function createLimiter(requests: number, window: Duration): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

const limiters = {
  login: createLimiter(5, "15 m"),
  register: createLimiter(3, "1 h"),
  forgotPassword: createLimiter(3, "1 h"),
  resetPassword: createLimiter(5, "15 m"),
  resendVerification: createLimiter(3, "15 m"),
};

export type RateLimitKey = keyof typeof limiters;

export function getIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "127.0.0.1";
}

export async function checkRateLimit(
  key: RateLimitKey,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const limiter = limiters[key];

  // Fail open if Upstash is not configured
  if (!limiter) {
    return { success: true, remaining: 999, reset: 0 };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch {
    // Fail open on Redis errors
    return { success: true, remaining: 999, reset: 0 };
  }
}

export function makeRateLimitResponse(reset: number): NextResponse {
  const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  const minutesLeft = Math.ceil(retryAfterSeconds / 60);

  return NextResponse.json(
    {
      error: `Too many attempts. Please try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  );
}
