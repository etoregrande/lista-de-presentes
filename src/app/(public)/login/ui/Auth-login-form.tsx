'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { getSafeAuthCallbackPath } from '@/lib/auth-callback'
import { signInFormSchema, otpFormSchema } from '@/schemas/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from '@/components/ui/form/form-error'
import { InputWrapper } from '@/components/ui/form/form-input-wrapper'

export function AuthLoginForm({
  onRequestedEmailChange,
}: { onRequestedEmailChange?: (email: string | null) => void } = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = getSafeAuthCallbackPath(searchParams.get('callbackUrl'))
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpFocused, setOtpFocused] = useState(false)
  const [requestedEmail, setRequestedEmail] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [socialBusy, setSocialBusy] = useState(false)
  const socialEnabled = process.env.NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED === 'true'
  const mailpitUrl = process.env.NEXT_PUBLIC_MAILPIT_UI_URL
  const autoOpenMailpit = process.env.NEXT_PUBLIC_AUTO_OPEN_MAILPIT === 'true'

  async function requestCode(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    const parsed = signInFormSchema.safeParse({ email })
    if (!parsed.success) return setError(parsed.error.issues[0].message)
    if (event && autoOpenMailpit && mailpitUrl && !navigator.webdriver) {
      window.open(mailpitUrl, 'presenteio-mailpit')
    }
    setError('')
    setBusy(true)
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: parsed.data.email,
        type: 'sign-in',
      })
      if (result.error) throw result.error
      setRequestedEmail(parsed.data.email)
      onRequestedEmailChange?.(parsed.data.email)
      setOtp('')
      toast.success('Enviamos um código de acesso para seu email')
    } catch {
      setError('Não foi possível enviar o código. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  async function confirmCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!requestedEmail) return
    const parsed = otpFormSchema.safeParse({ otp })
    if (!parsed.success) return setError(parsed.error.issues[0].message)
    setError('')
    setBusy(true)
    try {
      const result = await authClient.signIn.emailOtp({
        email: requestedEmail,
        otp: parsed.data.otp,
      })
      if (result.error) throw result.error
      if (!result.data?.user.name?.trim()) {
        router.push(
          `/complete-profile?callbackUrl=${encodeURIComponent(callbackUrl)}`
        )
      } else {
        router.push(callbackUrl)
      }
      router.refresh()
    } catch {
      setError(
        'Código inválido ou expirado. Confira o email ou solicite outro.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function signInGoogle() {
    if (socialBusy) return
    setSocialBusy(true)
    try {
      const result = await authClient.signIn.social(
        { provider: 'google', callbackURL: callbackUrl },
        { timeout: 15000, retry: 0 }
      )
      if (result.error || !result.data?.url)
        throw new Error('Google sign in failed')
    } catch {
      toast.error('Não foi possível abrir o login com Google')
    } finally {
      setSocialBusy(false)
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <form
        onSubmit={requestedEmail ? confirmCode : requestCode}
        className="flex flex-col gap-4"
      >
        {requestedEmail ? (
          <>
            <InputWrapper>
              <Label htmlFor="otp">Código de acesso</Label>
              <div className="relative grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }, (_, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className={`border-input bg-background/50 pointer-events-none flex h-12 items-center justify-center rounded-md border text-xl font-semibold tabular-nums transition-colors ${otpFocused && index === Math.min(otp.length, 5) ? 'border-primary ring-primary/20 ring-2' : ''}`}
                  >
                    {otp[index] || ''}
                  </span>
                ))}
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  onPaste={(event) => {
                    event.preventDefault()
                    setOtp(
                      event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                    )
                  }}
                  onFocus={() => setOtpFocused(true)}
                  onBlur={() => setOtpFocused(false)}
                  className={`absolute inset-0 z-10 h-full w-full cursor-text border-0 bg-transparent shadow-none focus-visible:border-0 focus-visible:ring-0 ${otp ? 'text-transparent caret-transparent' : ''}`}
                />
              </div>
            </InputWrapper>
          </>
        ) : (
          <InputWrapper>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </InputWrapper>
        )}
        <FormError message={error} />
        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? (
              <LoaderCircle className="animate-spin" />
            ) : requestedEmail ? (
              'Entrar'
            ) : (
              'Enviar código'
            )}
          </Button>
          {requestedEmail && (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setRequestedEmail(null)
                  onRequestedEmailChange?.(null)
                  setOtp('')
                  setError('')
                }}
              >
                Voltar
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                disabled={busy}
                onClick={() => {
                  void requestCode()
                }}
              >
                Enviar outro código
              </Button>
            </>
          )}
        </div>
      </form>
      {socialEnabled && !requestedEmail && (
        <Button
          type="button"
          variant="outline"
          onClick={signInGoogle}
          disabled={socialBusy}
          aria-label="Entrar com o Google"
          aria-busy={socialBusy}
        >
          {socialBusy ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <>
              <Image
                src="/assets/icons/google.svg"
                alt="Ícone do Google"
                width={20}
                height={20}
              />{' '}
              Entrar com o Google
            </>
          )}
        </Button>
      )}
    </div>
  )
}
