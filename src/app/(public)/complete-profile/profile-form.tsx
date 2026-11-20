'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { completeProfileSchema } from '@/schemas/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from '@/components/ui/form/form-error'

export function CompleteProfileForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = completeProfileSchema.safeParse({ name })
    if (!parsed.success) return setError(parsed.error.issues[0].message)
    setError('')
    setBusy(true)
    try {
      const result = await authClient.updateUser({ name: parsed.data.name })
      if (result.error) throw result.error
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError('Não foi possível salvar seu nome. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Label htmlFor="name">Nome e sobrenome</Label>
      <Input id="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
      <FormError message={error} />
      <Button disabled={busy}>Continuar</Button>
    </form>
  )
}
