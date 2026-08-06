import { betterAuth } from "better-auth"
import { pool } from './queries.js'

export const auth = betterAuth({
    database: pool,
    emailAndPassword: { enabled: true },
    trustedOrigins: [process.env.FRONTEND_URL!],
    socialProviders: {
        // google: {
        //     clientId: process.env.GOOGLE_CLIENT_ID!,
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        // }
    }
})