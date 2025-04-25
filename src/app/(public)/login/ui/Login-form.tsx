'use client'

import { Button } from '@/components/ui/button/button'
import { FormError } from '@/components/ui/form/form-error'
import { Input, PasswordInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { signInFormSchema } from '@/schemas/auth'
import { SignInFormData } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface LoginFormProps {
  setFormType: Dispatch<
    SetStateAction<'login' | 'register' | 'forgot-password'>
  >
  className?: string
}

export const LoginForm = ({ setFormType, className }: LoginFormProps) => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInFormSchema),
  })

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
          console.log(errorCode)
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
    await authClient.signIn.social({
      provider: 'google',
    })
  }

  return (
    <form
      onSubmit={handleSubmit(handleSignInUser)}
      className={`flex w-full max-w-sm flex-col gap-4 ${className}`}
    >
      <div className="grid max-w-sm items-center gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input {...register('email')} id="email" type="email" />
        <FormError message={errors.email?.message} />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <PasswordInput {...register('password')} id="password" />
        <div className="flex w-full items-center justify-between">
          <div className="min-h-5">
            <FormError message={errors.password?.message} />
          </div>

          <Label
            className="text-primary cursor-pointer text-end hover:underline"
            onClick={() => setFormType('forgot-password')}
          >
            Esqueci minha senha
          </Label>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Button disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Entrar'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleSignInWithGmail}
          className="border-border"
        >
          <Image
            src="/assets/icons/google.svg"
            alt="Ícone do Google"
            width={20}
            height={20}
          />
          Entrar com Google
        </Button>
      </div>
    </form>
  )
}
