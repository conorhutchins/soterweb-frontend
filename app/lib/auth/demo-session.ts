/** A visual demo session only. The backend must replace this with its own session contract. */
export const DEMO_SESSION_KEY = 'soterweb-demo-session'
export const REMEMBER_DAYS = 30

export function createDemoSession(now: number, remember: boolean) {
  return JSON.stringify({ expiresAt: now + (remember ? REMEMBER_DAYS : 1) * 24 * 60 * 60 * 1000 })
}

export function isDemoSessionValid(value: string | null, now: number) {
  if (!value) return false
  try {
    const session = JSON.parse(value)
    return typeof session?.expiresAt === 'number' && session.expiresAt > now
  }
  catch {
    return false
  }
}
