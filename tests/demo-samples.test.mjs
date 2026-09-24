import assert from 'node:assert/strict'
import { test } from 'node:test'
import { attendanceFixture } from '../app/lib/access-it/demo-fixtures.ts'
import { preserveDemoInteraction, refreshSampleDates } from '../app/lib/access-it/demo-samples.ts'
import { isoDate } from '../app/lib/access-it/time.ts'

const dateKeys = ['loggedOnAt', 'expectedLogOffAt', 'expectedArrivalAt', 'loggedOffAt', 'travelStartedAt', 'travelFinishedAt']

test('a new demo has normal visits, one overdue visit, future bookings and history', () => {
  for (const hour of [0, 10, 23]) {
    const now = new Date(2026, 8, 24, hour, 30)
    const samples = attendanceFixture(now)
    assert.equal(samples.filter((r) => r.status === 'On site' && new Date(r.expectedLogOffAt) < now).length, 1)
    assert.equal(samples.filter((r) => r.status === 'Expected' && new Date(r.expectedArrivalAt) > now).length, 2)
    assert.equal(samples.filter((r) => r.status === 'Departed').length, 3)
  }
})

test('refreshing tomorrow moves only untouched samples and keeps pass links stable', () => {
  const yesterday = new Date(2026, 8, 23, 10)
  const today = new Date(2026, 8, 24, 10)
  const records = attendanceFixture(yesterday)
  preserveDemoInteraction(records[1])
  records[1].status = 'Departed'
  records[1].loggedOffAt = yesterday.toISOString()
  const custom = { ...records[1], id: 101, name: 'A visit created in the demo' }
  records.push(custom)
  const legacy = { ...records[2], id: 102 }
  delete legacy.demoSampleDay
  records.push(legacy)
  const fresh = attendanceFixture(today)
  const updated = refreshSampleDates(records, fresh, isoDate(today), dateKeys)
  assert.equal(updated[0].loggedOnAt, fresh[0].loggedOnAt)
  assert.equal(updated[0].passToken, records[0].passToken)
  assert.strictEqual(updated[1], records[1])
  assert.strictEqual(updated.at(-2), custom)
  assert.strictEqual(updated.at(-1), legacy)
  assert.strictEqual(refreshSampleDates(updated, attendanceFixture(new Date(2026, 8, 24, 18)), isoDate(today), dateKeys), updated)
})
