import 'dotenv/config'
import { betterAuth } from "better-auth";
import { dialect } from "@/lib/database/db";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from './email';

export const auth = betterAuth({
    database: {
        dialect: dialect,
        type: "postgres"
    },
    plugins: [nextCookies()],
    session: {
        cookieCache: {
            enabled: false,
            // maxAge: 5 * 60 // Cache duration in seconds
        }
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            await sendEmail({
                to: user.email,
                subject: "Esqueci minha senha",
                url,
            });
        },
        autoSignIn: true, //defaults to true
    },
})

export type Session = typeof auth.$Infer.Session
