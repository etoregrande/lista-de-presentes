import { Button } from '@/components/ui/button/button'
import { FormError } from '@/components/ui/form/form-error'
import { Input, PasswordInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { signUpFormSchema } from '@/schemas/auth'
import { SignUpFormData } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
  })

  const handleSignUp: SubmitHandler<SignUpFormData> = async (
    formData: SignUpFormData
  ) => {
    const { data, error } = await authClient.signUp.email(
      {
        email: formData.email,
        password: formData.password,
        name: formData.name,
      },
      {
        onSuccess: async () => {
          toast.success('Cadastro realizado com sucesso!', {
            description: 'Verifique seu email para fazer login',
          })
        },
        onError: (ctx) => {
          console.log(ctx.error.status)
          console.log(ctx.error.code)
          if (ctx.error.code === 'USER_ALREADY_EXISTS') {
            setError('email', {
              message: 'Email já cadastrado',
            })
            return
          }
          if (ctx.error.status === 401) {
            setError('root', {
              message: 'Email não cadastrado',
            })
            return
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
    <form onSubmit={handleSubmit(handleSignUp)} className="flex flex-col gap-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="name">Nome e sobrenome</Label>
        <Input {...register('name')} id="name" />
        <FormError message={errors.name?.message} />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input {...register('email')} id="email" type="email" />
        <FormError message={errors.email?.message} />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <PasswordInput {...register('password')} id="password" />
        <FormError message={errors.password?.message} />
      </div>
      <div className="flex flex-col gap-2">
        <Button disabled={isSubmitting} className="grid w-full max-w-sm">
          {isSubmitting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            'Cadastrar'
          )}
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
