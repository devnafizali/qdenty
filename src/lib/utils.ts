import { createHash, randomBytes } from 'crypto'

export function generateId(): string {
  return randomBytes(12).toString('hex')
}

export function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function generateApiToken(prefix = 'qd_live'): string {
  return `${prefix}_${randomBytes(18).toString('hex')}`
}

export function maskToken(token: string): string {
  if (token.length <= 12) return '••••'
  return `${token.slice(0, 8)}••••${token.slice(-4)}`
}

export function planLabel(planId: string): string {
  const map: Record<string, string> = {
    guest:   'Guest',
    free:    'Free Account',
    starter: 'Starter',
    pro:     'Professional',
    atelier: 'Atelier',
  }
  return map[planId] ?? 'Guest'
}

const PLAN_RANK: Record<string, number> = { guest: 0, free: 0, starter: 1, pro: 2, atelier: 3 }
const TIER_RANK: Record<string, number> = { free: 0, pro: 1, elite: 2 }

export function planRank(planId: string): number {
  return PLAN_RANK[planId] ?? 0
}

export function hasTier(planId: string, tier: 'free' | 'pro' | 'elite'): boolean {
  return planRank(planId) >= (TIER_RANK[tier] ?? 0)
}

export function userInitials(name: string, email: string): string {
  return (name || email)
    .split(/[\s.@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0].toUpperCase())
    .join('')
}
