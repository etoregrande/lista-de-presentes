import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/prisma'
import { nextCookies } from 'better-auth/next-js'
import { emailOTP } from 'better-auth/plugins'
import { sendEmail } from './email'
import {
  OtpEmailTemplate,
  otpEmailText,
} from '@/components/email-template'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    emailOTP({
      expiresIn: 600,
      allowedAttempts: 5,
      storeOTP: 'hashed',
      rateLimit: { window: 60, max: 3 },
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type !== 'sign-in') return
        await sendEmail({
          to: email,
          subject: 'Seu código de acesso ao Presenteio',
          text: otpEmailText(otp),
          template: OtpEmailTemplate,
          templateProps: { otp },
        })
      },
    }),
    nextCookies(),
  ],
  rateLimit: { enabled: true, storage: 'database' },
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
  emailAndPassword: {
    enabled: false,
  },
})

export type Session = typeof auth.$Infer.Session
