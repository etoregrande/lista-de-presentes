import { AuthLoginForm } from './Auth-login-form'

export function AuthWrapper({ className }: { className?: string }) {
  return (
    <div className={`flex w-full flex-col ${className || ''}`}>
      <h2 className="max-w-sm text-3xl font-bold tracking-tight">Entrar no Presenteio</h2>
      <p className="text-muted-foreground mb-5 max-w-sm">Informe seu email para continuar.</p>
      <AuthLoginForm />
    </div>
  )
}
