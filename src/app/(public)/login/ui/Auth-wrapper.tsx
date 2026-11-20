'use client'

import { useState } from 'react'
import { AuthLoginForm } from './Auth-login-form'

export function AuthWrapper({ className }: { className?: string }) {
  const [requestedEmail, setRequestedEmail] = useState<string | null>(null)
  return (
    <div className={`flex w-full flex-col ${className || ''}`}>
      {requestedEmail ? (
        <>
          <h2 className="page-heading max-w-sm">Enviamos um código</h2>
          <p className="text-muted-foreground mb-5 max-w-sm break-all">
            para <strong className="text-foreground">{requestedEmail}</strong>.
          </p>
        </>
      ) : (
        <>
          <h2 className="page-heading max-w-sm">Entrar no Presenteio</h2>
          <p className="text-muted-foreground mb-5 max-w-sm">
            Informe seu email para continuar.
          </p>
        </>
      )}
      <AuthLoginForm onRequestedEmailChange={setRequestedEmail} />
    </div>
  )
}
