'use server'

import { auth } from '@/lib/auth'
import { SignInFormData, SignUpFormData } from '@/types/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const signUp = async (formData: SignUpFormData) => {
  const { name, email, password } = formData

  const response: Response = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
    asResponse: true,
  })
  return response.json()
}

export const signIn = async (formData: SignInFormData) => {
  const { email, password } = formData

  const response: Response = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    asResponse: true,
  })
  return response.json()
}

export const signOut = async () => {
  await auth.api.signOut({
    headers: await headers(),
  })
  return redirect('/login')
}
