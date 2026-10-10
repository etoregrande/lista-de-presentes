'use client'

import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/form/form-error'
import { InputWrapper } from '@/components/ui/form/form-input-wrapper'
import { PasswordInput } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { resetPasswordFormSchema } from '@/schemas/auth'
import { ResetPasswordFormData } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Label } from '@radix-ui/react-label'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { toast } from 'sonner'

export const ResetPasswordForm = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
  })

  const [isResetComplete, setIsResetComplete] = useState(false)

  const onSubmit = async (formData: ResetPasswordFormData) => {
    clearErrors('root')
    const invalidLinkMessage =
      'Este link é inválido ou expirou. Solicite um novo link de recuperação'
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token || params.has('error')) {
      setError('root', { message: invalidLinkMessage })
      toast.error(invalidLinkMessage)
      return
    }
    try {
      const { error } = await authClient.resetPassword({
        newPassword: formData.password,
        token,
      })
      if (error) {
        const message =
          error.code === 'INVALID_TOKEN'
            ? invalidLinkMessage
            : 'Erro ao redefinir a senha. Tente novamente mais tarde'
        setError('root', { message })
        toast.error(message)
        return
      }
      setIsResetComplete(true)
      toast.success(
        'Senha redefinida com sucesso! Redirecionando para login...'
      )
      setTimeout(() => router.replace('/login'), 2000)
    } catch {
      const message =
        'Erro ao redefinir a senha. Verifique sua conexão e tente novamente'
      setError('root', { message })
      toast.error(message)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <div className="mb-4">
        <h2 className="max-w-sm text-3xl font-bold tracking-tight">
          Nova senha
        </h2>
        <p className="max-w-sm text-[var(--muted-foreground)]">
          Defina sua nova senha
        </p>
      </div>
      <InputWrapper>
        <Label htmlFor="password">Senha</Label>
        <PasswordInput {...register('password')} id="password" />
        <FormError message={errors.password?.message} />
      </InputWrapper>

      <Button disabled={isSubmitting || isResetComplete}>
        {isSubmitting ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          'Redefinir senha'
        )}
      </Button>
      <FormError message={errors.root?.message} />
    </form>
  )
}
