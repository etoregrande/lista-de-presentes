import { Resend } from 'resend'
import { createElement } from 'react'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailParams<T extends Record<string, any>> {
  to: string
  subject: string
  template: React.FC<T>
  templateProps: T
}

export async function sendEmail<T extends Record<string, any>>({
  to,
  subject,
  template,
  templateProps,
}: SendEmailParams<T>) {
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
