import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createDemoSession, isDemoSessionValid } from '../app/lib/auth/demo-session.ts'

test('remembered sessions expire at 30 days and contain no credentials', () => {
  const now = Date.UTC(2026, 8, 24)
  const session = createDemoSession(now, true)
  assert.deepEqual(Object.keys(JSON.parse(session)), ['expiresAt'])
  assert.equal(isDemoSessionValid(session, now + 30 * 86400000 - 1), true)
  assert.equal(isDemoSessionValid(session, now + 30 * 86400000), false)
})

test('short sessions expire and malformed or legacy values do not restore access', () => {
  const now = Date.now()
  assert.equal(isDemoSessionValid(createDemoSession(now, false), now + 86400000), false)
  for (const value of [null, 'true', '{}', '{', '{"expiresAt":"tomorrow"}']) {
    assert.equal(isDemoSessionValid(value, now), false)
  }
})
