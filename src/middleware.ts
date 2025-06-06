import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request, {
    // Optionally pass config if cookie name, prefix or useSecureCookies option is customized in auth config.
    cookieName: 'session_token',
    cookiePrefix: 'better-auth',
    useSecureCookies: process.env.NODE_ENV === 'production' ? true : false,
  })

  const { pathname } = request.nextUrl

  if (sessionCookie && pathname === '/') {
    return NextResponse.redirect(new URL('/wishlist', request.url))
  }

  if (!sessionCookie && pathname === '/wishlist') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirecting to login for now, while homepage isnt implemented
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/wishlist'], // Specify the routes the middleware applies to
}
