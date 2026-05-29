import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import * as schema from '@/db/schema'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user:         schema.user,
      session:      schema.session,
      account:      schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    password: {
      hash:   (password: string) => bcrypt.hash(password, 12),
      verify: ({ hash, password }: { hash: string; password: string }) =>
        bcrypt.compare(password, hash),
    },
  },

  user: {
    additionalFields: {
      planId: {
        type: 'string' as const,
        defaultValue: 'free',
        input: false,
      },
      slug: {
        type: 'string' as const,
        required: false,
        input: true,
      },
      stripeCustomerId: {
        type: 'string' as const,
        required: false,
        input: false,
      },
    },
  },

  session: {
    expiresIn:  60 * 60 * 24 * 30,  // 30 days
    updateAge:  60 * 60 * 24,        // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge:  5 * 60,               // 5-min client cache
    },
  },

  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'http://localhost:3000',
    ...((process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
      .split(',').map(s => s.trim()).filter(Boolean)),
  ],
})

export type Session  = typeof auth.$Infer.Session
export type AuthUser = typeof auth.$Infer.Session.user
