'use client'

import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/form/form-error'
import { InputWrapper } from '@/components/ui/form/form-input-wrapper'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { forgotPasswordFormSchema } from '@/schemas/auth'
import { ForgotPasswordFormData } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface AuthForgotPasswordProps {
  setFormType: Dispatch<
    SetStateAction<'login' | 'register' | 'forgot-password'>
  >
}

export const AuthForgotPasswordForm = ({
  setFormType,
}: AuthForgotPasswordProps) => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordFormSchema),
  })

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (
    formData: ForgotPasswordFormData
  ) => {
    clearErrors('root')
    try {
      const { error } = await authClient.requestPasswordReset({
        email: formData.email,
        redirectTo: '/reset-password',
      })
      if (error) {
        const message =
          'Não foi possível solicitar a recuperação. Tente novamente mais tarde'
        setError('root', { message })
        toast.error(message)
        return
      }
      toast.success(
        `Se ${formData.email} estiver cadastrado, você receberá um link de recuperação`
      )
    } catch {
      const message =
        'Não foi possível solicitar a recuperação. Verifique sua conexão e tente novamente'
      setError('root', { message })
      toast.error(message)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <InputWrapper>
          <Label htmlFor="email">Email</Label>
          <Input {...register('email')} id="email" type="email" />
          <FormError message={errors.email?.message} />
        </InputWrapper>

        <FormError message={errors.root?.message} />

        <div className="flex flex-col gap-2">
          <Button disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              'Enviar link de recuperação'
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setFormType('login')}
          >
            Voltar para login
          </Button>
        </div>
      </form>
    </>
  )
}
