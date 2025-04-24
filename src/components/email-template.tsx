import * as React from 'react'

interface ForgotPasswordEmailTemplateProps {
  url: string
}

export const ForgotPasswordEmailTemplate: React.FC<
  Readonly<ForgotPasswordEmailTemplateProps>
> = ({ url }) => (
  <div>
    <h1>Olá,</h1>
    <p>Você pediu para redefinir sua senha.</p>
    <p>Clique no link abaixo para continuar:</p>
    <a href={url} style={{ color: '#0070f3' }}>
      {url}
    </a>
    <p>Se você não pediu isso, pode ignorar este e-mail.</p>
  </div>
)

interface VerificationEmailTemplateProps {
  url: string
}

export const VerificationEmailTemplate: React.FC<
  Readonly<VerificationEmailTemplateProps>
> = ({ url }) => (
  <div>
    <h1>Olá,</h1>
    <p>Obrigado por se cadastrar na plataforma Presenteio!</p>
    <p>Clique no link abaixo para verificar seu email:</p>
    <a href={url} style={{ color: '#0070f3' }}>
      {url}
    </a>
    <p>Se você não realizou o cadastro, pode ignorar este e-mail.</p>
  </div>
)
