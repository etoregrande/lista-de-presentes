import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  const { pathname } = request.nextUrl

  if (sessionCookie && pathname === '/') {
    return NextResponse.redirect(new URL('/wishlist', request.url))
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/wishlist'], // Specify the routes the middleware applies to
}
