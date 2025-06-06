import { Button } from '@/components/ui/button/button'
import { FormError } from '@/components/ui/form/form-error'
import { FormInputWrapper } from '@/components/ui/form/form-input-wrapper'
import { Input, PasswordInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { signUpFormSchema } from '@/schemas/auth'
import { SignUpFormData } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import { Dispatch, SetStateAction } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface AuthSignUpFormProps {
  setFormType: Dispatch<
    SetStateAction<'register' | 'login' | 'forgot-password'>
  >
}

export const AuthSignUpForm = ({ setFormType }: AuthSignUpFormProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
  })
  const isPasswordRecoveryEnabled =
    process.env.NEXT_PUBLIC_PASSWORD_RECOVERY_ENABLED === 'true'

  const signUpToastMessage = isPasswordRecoveryEnabled
    ? 'Enviamos um email de verificação para você'
    : 'Você já pode realizar o login'

  const handleSignUp: SubmitHandler<SignUpFormData> = async (
    formData: SignUpFormData
  ) => {
    await authClient.signUp.email(
      {
        email: formData.email,
        password: formData.password,
        name: formData.name,
      },
      {
        onSuccess: async () => {
          toast.success('Cadastro realizado com sucesso!', {
            description: signUpToastMessage,
          })
          setFormType('login')
        },
        onError: (ctx) => {
          const errorCode = ctx.error?.code

          if (errorCode === 'USER_ALREADY_EXISTS') {
            setError('email', {
              message: 'Email já cadastrado',
            })
            return
          }

          if (errorCode === 'INVALID_EMAIL_FOR_RESEND') {
            setError('email', {
              message: 'Email inválido',
            })
            return
          }

          if (errorCode === 'EMAIL_SENDING_FAILED') {
            toast.error('Erro ao enviar email de verificação')
            return
          }

          console.error('[SignUp Error]', ctx.error)
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
      <FormInputWrapper>
        <Label htmlFor="name">Nome e sobrenome</Label>
        <Input {...register('name')} id="name" />
        <FormError message={errors.name?.message} />
      </FormInputWrapper>

      <FormInputWrapper>
        <Label htmlFor="email">Email</Label>
        <Input {...register('email')} id="email" type="email" />
        <FormError message={errors.email?.message} />
      </FormInputWrapper>

      <FormInputWrapper>
        <Label htmlFor="password">Senha</Label>
        <PasswordInput {...register('password')} id="password" />
        <FormError message={errors.password?.message} />
      </FormInputWrapper>

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
