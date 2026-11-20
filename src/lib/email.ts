import { Resend } from 'resend'
import { createElement } from 'react'
import { render } from '@react-email/render'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface SendEmailParams<T extends Record<string, unknown>> {
  to: string
  subject: string
  template: React.FC<T>
  templateProps: T
}

export async function sendEmail<T extends Record<string, unknown>>({
  to,
  subject,
  template,
  templateProps,
}: SendEmailParams<T>) {
  if (process.env.MAIL_TRANSPORT === 'mailpit') {
    if (!['local', 'staging'].includes(process.env.APP_ENV || '')) {
      throw new Error('Mailpit transport is restricted to local and staging')
    }
    const apiUrl = process.env.MAILPIT_API_URL
    if (!apiUrl) throw new Error('MAILPIT_API_URL is required')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (process.env.APP_ENV === 'staging') {
      const user = process.env.MAILPIT_SEND_USER
      const password = process.env.MAILPIT_SEND_PASSWORD
      if (!user || !password) throw new Error('Mailpit send credentials are required in staging')
      headers.Authorization = `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`
    }
    const response = await fetch(new URL('/api/v1/send', apiUrl), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        From: { Email: 'noreply@presenteio.app', Name: 'Presenteio' },
        To: [{ Email: to }],
        Subject: subject,
        HTML: await render(createElement(template, templateProps)),
      }),
    })
    if (!response.ok) throw new Error(`Mailpit send failed: ${response.status}`)
    return
  }

  if (!resend) {
    throw new Error('RESEND_API_KEY is required to send email')
  }

  const { error } = await resend.emails.send({
    from: 'Presenteio <noreply@presenteio.app>',
    to,
    subject,
    react: createElement(template, templateProps),
  })

  if (error) {
    console.error('[Resend Error]', error)
    throw new Error('Erro ao enviar o e-mail')
  }
}
