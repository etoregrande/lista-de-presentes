import 'dotenv/config'
import { betterAuth } from 'better-auth'
import { dialect } from '@/lib/database/db'
import { nextCookies } from 'better-auth/next-js'
import { sendEmail } from './email'
import {
  ForgotPasswordEmailTemplate,
  VerificationEmailTemplate,
} from '@/components/email-template'

const isPasswordRecoveryEnabled =
  process.env.NEXT_PUBLIC_PASSWORD_RECOVERY_ENABLED === 'true' ? true : false

export const auth = betterAuth({
  database: {
    dialect: dialect,
    type: 'postgres',
  },
  plugins: [nextCookies()],
  session: {
    cookieCache: {
      enabled: false,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailVerification: {
    sendOnSingUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Verifique seu email',
        template: VerificationEmailTemplate,
        templateProps: { url },
      })
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: isPasswordRecoveryEnabled,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Esqueci minha senha',
        template: ForgotPasswordEmailTemplate,
        templateProps: { url },
      })
    },

    autoSignIn: false, //defaults to true
  },
})

export type Session = typeof auth.$Infer.Session
