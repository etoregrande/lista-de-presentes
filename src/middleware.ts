import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl

  // Redirect from root to wishlist
  if (sessionCookie && pathname === '/') {
    return NextResponse.redirect(new URL('/wishlist', request.url))
  }

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    const callbackPath =
      request.nextUrl.pathname + request.nextUrl.search + request.nextUrl.hash

    loginUrl.searchParams.set('callbackUrl', callbackPath)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/wishlist', '/groups/:path*'],
}
