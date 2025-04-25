'use client'

import { useState } from 'react'
import { AuthLoginForm } from './Auth-login-form'
import { AuthForgotPasswordForm } from './Auth-forgot-password-form'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthSignUpForm } from './Auth-sign-up-form'

interface AuthWrapperProps {
  className?: string
}

export function AuthWrapper({ className }: AuthWrapperProps) {
  const [formType, setFormType] = useState<
    'login' | 'register' | 'forgot-password'
  >('login')

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={formType}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.3 }}
        className={`flex w-full flex-col${className}`}
      >
        <h2 className="max-w-sm text-3xl font-bold tracking-tight">
          {formType === 'login' && 'Fazer login'}
          {formType === 'register' && 'Cadastrar'}
          {formType === 'forgot-password' && 'Esqueci minha senha'}
        </h2>
        <p className="mb-10 max-w-sm text-[var(--muted-foreground)]">
          {formType === 'login' && (
            <>
              Não tem uma conta?{' '}
              <span
                className="cursor-pointer underline"
                onClick={() => setFormType('register')}
              >
                Faça seu cadastro
              </span>
            </>
          )}
          {formType === 'register' && (
            <>
              Já tem uma conta?{' '}
              <span
                className="cursor-pointer underline"
                onClick={() => setFormType('login')}
              >
                Faça login
              </span>
            </>
          )}
          {formType === 'forgot-password' && 'Informe seu email cadastrado'}
        </p>

        {formType === 'login' && <AuthLoginForm setFormType={setFormType} />}
        {formType === 'register' && (
          <AuthSignUpForm setFormType={setFormType} />
        )}
        {formType === 'forgot-password' && (
          <AuthForgotPasswordForm setFormType={setFormType} />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
