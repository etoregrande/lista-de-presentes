'use client'

import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInFormSchema } from '@/schemas/auth'
import { signIn } from '@/server/auth'
import { SignInFormData } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

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

  const handlesignInUser: SubmitHandler<SignInFormData> = async (
    data: SignInFormData
  ) => {
    try {
      const response = await signIn(data)

      if (response.code === 'INVALID_EMAIL_OR_PASSWORD') {
        setError('root', { message: 'Email ou senha inválidos' })
        return
      }

      router.push('/')
    } catch (error: any) {
      throw new Error('Erro interno do servidor')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handlesignInUser)}
      className={`flex w-full max-w-sm flex-col gap-4 ${className}`}
    >
      <div className="grid max-w-sm items-center gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input {...register('email')} id="email" type="email" />
        {errors.email && (
          <div className="text-sm text-red-500">{errors.email.message}</div>
        )}
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input {...register('password')} id="password" type="password" />
        <Label
          className="cursor-pointer hover:underline"
          onClick={() => setFormType('forgot-password')}
        >
          Esqueci minha senha
        </Label>
        {errors.password && (
          <div className="text-sm text-red-500">{errors.password.message}</div>
        )}
        {errors.root && (
          <div className="text-sm text-red-500">{errors.root.message}</div>
        )}
      </div>
      <Button disabled={isSubmitting}>
        {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Entrar'}
      </Button>
    </form>
  )
}
