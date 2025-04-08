import 'dotenv/config'
import { betterAuth } from "better-auth";
import { dialect } from "@/lib/database/db";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: {
        dialect: dialect,
        type: "postgres"
    },
    plugins: [nextCookies()],
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // Cache duration in seconds
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true, //defaults to true
    },
})
