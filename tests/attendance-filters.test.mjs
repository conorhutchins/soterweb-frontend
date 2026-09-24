import assert from 'node:assert/strict'
import { test } from 'node:test'
import { attendanceFiltersFromQuery, emptyAttendanceFilters, matchesAttendance } from '../app/lib/access-it/attendance-filters.ts'

const now = new Date('2026-09-24T12:00:00')
const record = { name: 'Alex Example', company: 'Example Ltd', mobile: '07700 900123', buildingId: 2, buildingName: 'Library', locationOrHost: 'Meeting room', description: 'Review', type: 'Visitor', status: 'On site', loggedOnAt: '2026-09-23T10:00:00', loggedOffAt: null, expectedLogOffAt: '2026-09-24T11:00:00' }
const matches = (filters, visit = record) => matchesAttendance(visit, { ...emptyAttendanceFilters(), ...filters }, now)

test('filters combine search, building, company, type and overdue state', () => {
  assert.equal(matches({ search: ' alex ', building: '2', company: 'Example Ltd', type: 'Visitor', attention: 'overdue' }), true)
  assert.equal(matches({ type: 'Contractor' }), false)
  assert.equal(matches({ building: '1' }), false)
  assert.equal(matches({ company: 'Another Ltd' }), false)
  assert.equal(matches({ search: 'absent' }), false)
  assert.equal(matches({ attention: '24h' }), true)
  assert.equal(matches({ attention: 'overdue' }, { ...record, status: 'Departed' }), false)
})

test('history includes visits overlapping the chosen day and excludes the next midnight', () => {
  const departed = { ...record, status: 'Departed', loggedOffAt: '2026-09-24T00:00:00' }
  assert.equal(matches({ from: '2026-09-24', to: '2026-09-24' }, departed), true)
  assert.equal(matches({ to: '2026-09-22' }, departed), false)
  assert.equal(matches({ from: '2026-09-25' }, departed), false)
  assert.equal(matches({ from: '2026-09-25', to: '2026-09-24' }, departed), false)
  assert.equal(matches({ to: '2026-09-24' }, { ...record, loggedOnAt: '2026-09-25T00:00:00' }), false)
})

test('dashboard links accept only supported filters', () => {
  assert.equal(attendanceFiltersFromQuery({ type: 'Visitor' }).type, 'Visitor')
  assert.equal(attendanceFiltersFromQuery({ attention: 'overdue' }).attention, 'overdue')
  assert.deepEqual(attendanceFiltersFromQuery({ type: 'admin', attention: 'unknown' }), emptyAttendanceFilters())
})
