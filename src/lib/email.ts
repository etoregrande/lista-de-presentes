import { Resend } from 'resend'
import { createElement } from 'react'

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
  if (!resend) {
    console.warn('[Resend] API key não configurada. E-mail não enviado.')
    return
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
