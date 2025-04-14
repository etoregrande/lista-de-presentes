import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpFormSchema } from '@/schemas/auth'
import { signUp } from '@/server/auth'
import { SignUpFormData } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

interface SignUpFormProps {
  setFormType: Dispatch<
    SetStateAction<'login' | 'register' | 'forgot-password'>
  >
}

export const SignUpForm = ({ setFormType }: SignUpFormProps) => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
  })

  const handleSignUp: SubmitHandler<SignUpFormData> = async (
    data: SignUpFormData
  ) => {
    try {
      const response = await signUp(data)

      if (response.code === 'USER_ALREADY_EXISTS') {
        setError('email', { message: 'Email já cadastrado' })
        return
      }

      router.push('/wishlist')
    } catch (error: any) {
      throw new Error('Erro interno do servidor')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSignUp)} className="flex flex-col gap-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input {...register('name')} id="name" />
        {errors.name && (
          <div className="text-red-500">{errors.name.message}</div>
        )}
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input {...register('email')} id="email" type="email" />
        {errors.email && (
          <div className="text-red-500">{errors.email.message}</div>
        )}
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input {...register('password')} id="password" type="password" />
        {errors.password && (
          <div className="text-red-500">{errors.password.message}</div>
        )}
      </div>
      <Button disabled={isSubmitting} className="grid w-full max-w-sm">
        {isSubmitting ? 'Carregando...' : 'Cadastrar'}
      </Button>
    </form>
  )
}
