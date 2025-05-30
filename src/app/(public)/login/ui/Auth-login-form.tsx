'use client'

import { Button } from '@/components/ui/button/button'
import { FormError } from '@/components/ui/form/form-error'
import { FormInputWrapper } from '@/components/ui/form/form-input-wrapper'
import { Input, PasswordInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { signInFormSchema } from '@/schemas/auth'
import { SignInFormData } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface AuthLoginFormProps {
  setFormType: Dispatch<
    SetStateAction<'login' | 'register' | 'forgot-password'>
  >
  className?: string
}

export const AuthLoginForm = ({
  setFormType,
  className,
}: AuthLoginFormProps) => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInFormSchema),
  })
  const isPasswordRecoveryEnabled =
    process.env.NEXT_PUBLIC_PASSWORD_RECOVERY_ENABLED === 'true' ? true : false
  const isSocialLoginEnabled =
    process.env.NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED === 'true' ? true : false
  const [isLoggingInWithGoogle, setIsLoggingInWithGoogle] = useState(false)

  const handleSignInUser: SubmitHandler<SignInFormData> = async (
    formData: SignInFormData
  ) => {
    await authClient.signIn.email(
      {
        email: formData.email,
        password: formData.password,
      },
      {
        onSuccess: async () => {
          router.push('/wishlist')
        },
        onError: (ctx) => {
          const errorCode = ctx.error?.code

          if (ctx.error.status === 403) {
            toast.warning('Verifique seu email', {
              description:
                'Clique no link de verificação enviado para o seu email',
            })
            setError('email', {
              message: 'Verifique seu email',
            })
          }
          if (errorCode === 'INVALID_EMAIL_OR_PASSWORD') {
            setError('password', {
              message: 'Email ou senha inválidos',
            })
          }
        },
      }
    )
  }

  const handleSignInWithGmail = async () => {
    setIsLoggingInWithGoogle(true)
    await authClient.signIn.social({
      provider: 'google',
    })
  }

  return (
    <form
      onSubmit={handleSubmit(handleSignInUser)}
      className={`flex w-full max-w-sm flex-col gap-4 ${className}`}
    >
      <FormInputWrapper>
        <Label htmlFor="email">Email</Label>
        <Input {...register('email')} id="email" type="email" />
        <FormError message={errors.email?.message} />
      </FormInputWrapper>

      <FormInputWrapper>
        <div className="flex w-full items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          {isPasswordRecoveryEnabled && (
            <Label
              className="text-primary cursor-pointer text-end hover:underline"
              onClick={() => setFormType('forgot-password')}
            >
              Esqueci minha senha
            </Label>
          )}
        </div>
        <PasswordInput {...register('password')} id="password" />
        <FormError message={errors.password?.message} />
      </FormInputWrapper>

      <div className="flex flex-col gap-2">
        <Button disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Entrar'}
        </Button>
        {isSocialLoginEnabled && (
          <Button
            type="button"
            variant="outline"
            onClick={handleSignInWithGmail}
            disabled={isLoggingInWithGoogle}
            className="border-border"
          >
            {isLoggingInWithGoogle ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <>
                <Image
                  src="/assets/icons/google.svg"
                  alt="Ícone do Google"
                  width={20}
                  height={20}
                />
                Entrar com o Google
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  )
}
