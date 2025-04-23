'use client'

import { Button } from '@/components/ui/button/button'
import { PasswordInput } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { resetPasswordFormSchema } from '@/schemas/auth'
import { ResetPasswordFormData } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Label } from '@radix-ui/react-label'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const ResetPasswordForm = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
  })

  const onSubmit = async (formData: ResetPasswordFormData) => {
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) {
      throw new Error('Unable to get token')
    }
    try {
      const { error } = await authClient.resetPassword({
        newPassword: formData.password,
        token,
      })

      if (error) {
        toast.error('Erro ao redefinir a senha. Tente novamente mais tarde')
        return
      }

      toast.success(
        'Senha redefinida com sucesso! Redirecionando para login...'
      )

      await new Promise((resolve) => setTimeout(resolve, 2000))
      router.replace('/login')
    } catch (error) {
      console.error('Error while reseting password =>', error)
      throw new Error('Internal server error')
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
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <PasswordInput {...register('password')} id="password" />
        {errors.password && (
          <div className="text-red-500">{errors.password.message}</div>
        )}
      </div>
      <Button disabled={isSubmitting || isSubmitSuccessful}>
        {isSubmitting ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          'Redefinir senha'
        )}
      </Button>
      {errors.root && <div className="text-red-500">{errors.root.message}</div>}
    </form>
  )
}
