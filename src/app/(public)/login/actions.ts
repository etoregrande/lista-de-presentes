import { authClient } from '@/lib/auth-client'

export const handleSignInWithEmail = async (
  email: string,
  password: string
) => {
  await authClient.signIn.email(
    {
      email,
      password,
    },
    {
      onError: (ctx) => {
        // Handle the error
        if (ctx.error.status === 403) {
          alert('Você precisa verificar seu email antes de fazer login')
        }
        //you can also show the original error message
        alert(ctx.error.message)
      },
    }
  )
}
