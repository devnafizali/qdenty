import {
  pgTable, text, boolean, timestamp,
  integer, jsonb, index, uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

/* ═══════════════════════════════════════════════
   better-auth required tables
   ═══════════════════════════════════════════════ */

export const user = pgTable('user', {
  id:            text('id').primaryKey(),
  name:          text('name').notNull(),
  email:         text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image:         text('image'),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),
  // qdenty-specific
  planId:             text('plan_id').notNull().default('free'),
  slug:               text('slug').unique(),
  stripeCustomerId:   text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
}, t => [
  uniqueIndex('user_email_idx').on(t.email),
  index('user_slug_idx').on(t.slug),
])

export const session = pgTable('session', {
  id:          text('id').primaryKey(),
  expiresAt:   timestamp('expires_at').notNull(),
  token:       text('token').notNull().unique(),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
  ipAddress:   text('ip_address'),
  userAgent:   text('user_agent'),
  userId:      text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
}, t => [
  uniqueIndex('session_token_idx').on(t.token),
  index('session_user_idx').on(t.userId),
])

export const account = pgTable('account', {
  id:                     text('id').primaryKey(),
  accountId:              text('account_id').notNull(),
  providerId:             text('provider_id').notNull(),
  userId:                 text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken:            text('access_token'),
  refreshToken:           text('refresh_token'),
  idToken:                text('id_token'),
  accessTokenExpiresAt:   timestamp('access_token_expires_at'),
  refreshTokenExpiresAt:  timestamp('refresh_token_expires_at'),
  scope:                  text('scope'),
  password:               text('password'),
  createdAt:              timestamp('created_at').notNull().defaultNow(),
  updatedAt:              timestamp('updated_at').notNull().defaultNow(),
}, t => [
  index('account_user_idx').on(t.userId),
])

export const verification = pgTable('verification', {
  id:         text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value:      text('value').notNull(),
  expiresAt:  timestamp('expires_at').notNull(),
  createdAt:  timestamp('created_at').defaultNow(),
  updatedAt:  timestamp('updated_at').defaultNow(),
})

/* ═══════════════════════════════════════════════
   qdenty app tables
   ═══════════════════════════════════════════════ */

export interface CvData {
  name:       string
  title:      string
  email:      string
  phone:      string
  location:   string
  summary:    string
  template:   'editorial' | 'modern' | 'atelier'
  experience: { role: string; years: string; co: string; bullets: string[] }[]
  education:  { degree: string; school: string }[]
  skills:     string[]
  languages:  { name: string; level: string }[]
  projects:   { name: string; desc: string }[]
}

export const userProfile = pgTable('user_profile', {
  userId:    text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  pronouns:  text('pronouns').default(''),
  phone:     text('phone').default(''),
  title:     text('title').default(''),
  bio:       text('bio').default(''),
  location:  text('location').default(''),
  links:     jsonb('links').$type<string[]>().default([]),
  cvData:    jsonb('cv_data').$type<CvData | null>().default(null),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const qrCode = pgTable('qr_code', {
  id:           text('id').primaryKey(),
  userId:       text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  label:        text('label').notNull(),
  type:         text('type').notNull(),
  payload:      text('payload').notNull(),
  color:        text('color').notNull().default('#0f0e0c'),
  status:       text('status').notNull().default('live'),   // live | draft | exp
  templateData: jsonb('template_data'),
  scans:        integer('scans').notNull().default(0),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
}, t => [
  index('qr_code_user_idx').on(t.userId),
  index('qr_code_status_idx').on(t.status),
])

export const apiKey = pgTable('api_key', {
  id:          text('id').primaryKey(),
  userId:      text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  label:       text('label').notNull(),
  keyHash:     text('key_hash').notNull().unique(),
  keyPrefix:   text('key_prefix').notNull(),   // first 12 chars, safe to display
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  lastUsedAt:  timestamp('last_used_at'),
  revokedAt:   timestamp('revoked_at'),
}, t => [
  index('api_key_user_idx').on(t.userId),
  uniqueIndex('api_key_hash_idx').on(t.keyHash),
])

export const webhookEndpoint = pgTable('webhook_endpoint', {
  id:         text('id').primaryKey(),
  userId:     text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  url:        text('url').notNull(),
  secretHash: text('secret_hash').notNull(),
  active:     boolean('active').notNull().default(true),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
})

export const scanEvent = pgTable('scan_event', {
  id:         text('id').primaryKey(),
  codeId:     text('code_id').notNull().references(() => qrCode.id, { onDelete: 'cascade' }),
  scannedAt:  timestamp('scanned_at').notNull().defaultNow(),
  ipHash:     text('ip_hash'),
  country:    text('country'),
  city:       text('city'),
  deviceType: text('device_type'),
  os:         text('os'),
  browser:    text('browser'),
  referrer:   text('referrer'),
}, t => [
  index('scan_event_code_idx').on(t.codeId),
  index('scan_event_time_idx').on(t.scannedAt),
])

export const notificationPref = pgTable('notification_pref', {
  userId:        text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  scanAlerts:    boolean('scan_alerts').notNull().default(true),
  weeklyDigest:  boolean('weekly_digest').notNull().default(true),
  productNews:   boolean('product_news').notNull().default(true),
  securityAlerts: boolean('security_alerts').notNull().default(true),
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),
})

export const order = pgTable('order', {
  id:                    text('id').primaryKey(),
  userId:                text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  planId:                text('plan_id').notNull(),
  planName:              text('plan_name').notNull(),
  amount:                integer('amount').notNull(),   // cents
  currency:              text('currency').notNull().default('USD'),
  country:               text('country'),
  annual:                boolean('annual').notNull().default(false),
  status:                text('status').notNull().default('paid'),
  invoiceNumber:         text('invoice_number'),
  createdAt:             timestamp('created_at').notNull().defaultNow(),
}, t => [
  index('order_user_idx').on(t.userId),
])

export const teamMember = pgTable('team_member', {
  id:           text('id').primaryKey(),
  ownerId:      text('owner_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  memberId:     text('member_id').references(() => user.id, { onDelete: 'set null' }),
  invitedEmail:    text('invited_email').notNull(),
  role:            text('role').notNull().default('viewer'),  // owner | admin | editor | viewer
  inviteToken:     text('invite_token'),
  inviteExpiresAt: timestamp('invite_expires_at'),
  acceptedAt:      timestamp('accepted_at'),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
}, t => [
  index('team_member_owner_idx').on(t.ownerId),
])

/* ═══════════════════════════════════════════════
   Relations
   ═══════════════════════════════════════════════ */

export const userRelations = relations(user, ({ one, many }) => ({
  profile:        one(userProfile),
  sessions:       many(session),
  accounts:       many(account),
  codes:          many(qrCode),
  apiKeys:        many(apiKey),
  webhooks:       many(webhookEndpoint),
  notifPref:      one(notificationPref),
  orders:         many(order),
  teamOwned:      many(teamMember, { relationName: 'owner' }),
}))

export const qrCodeRelations = relations(qrCode, ({ one, many }) => ({
  user:       one(user, { fields: [qrCode.userId], references: [user.id] }),
  scanEvents: many(scanEvent),
}))

export const scanEventRelations = relations(scanEvent, ({ one }) => ({
  code: one(qrCode, { fields: [scanEvent.codeId], references: [qrCode.id] }),
}))
