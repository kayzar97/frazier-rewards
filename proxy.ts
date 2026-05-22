import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<
  string,
  { count: number; resetTime: number }
>();

const LIMIT = 30;
const WINDOW_MS = 60 * 1000;

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const protectedRoutes = [
    "/api/wager-rewards/claim",
    "/api/wager-rewards/gamble",
    "/api/vault",
    "/api/profile",
    "/api/turnstile/verify",
  ];

  const shouldRateLimit = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!shouldRateLimit) {
    return NextResponse.next();
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const key = `${ip}:${pathname}`;
  const now = Date.now();

  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });

    return NextResponse.next();
  }

  if (current.count >= LIMIT) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  current.count += 1;

  rateLimitMap.set(key, current);

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};