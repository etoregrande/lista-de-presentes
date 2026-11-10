import { NextResponse } from 'next/server'
import { getSessionOnServer } from '@/server/session'
import {
  beginAuthorization,
  isIntegrationAdmin,
  OAUTH_COOKIE,
} from '@/lib/mercadolivre/oauth'

export const runtime = 'nodejs'

export async function GET() {
  const session = await getSessionOnServer()
  if (!session || !isIntegrationAdmin(session.user.email))
    return new NextResponse(
      'Entre no Presenteio com a conta administradora configurada.',
      { status: 403 }
    )
  try {
    const attempt = beginAuthorization(session.user.id)
    const response = NextResponse.redirect(attempt.url)
    response.cookies.set(OAUTH_COOKIE, attempt.cookie, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600,
      path: '/api/integrations/mercadolivre',
    })
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch {
    return new NextResponse(
      'Configure as variáveis MERCADOLIVRE no servidor antes de conectar.',
      { status: 503 }
    )
  }
}
