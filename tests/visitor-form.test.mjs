import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyVisitorForm, OTHER_HOST, visitorFormFromRecord, visitorInputFromForm, visitorTimingErrors } from '../app/lib/access-it/visitor-form.ts'

const now = new Date('2026-09-24T09:00:00')

test('alternate hosts and optional visitor details round-trip without changing arrival status', () => {
  const form = {
    ...emptyVisitorForm(), name: ' Alex Demo ', company: ' Example ', mobile: '07700900999', email: 'alex@example.test',
    host: OTHER_HOST, hostName: ' Sam Demo ', hostEmail: 'host@example.test', description: ' Meeting ',
    visitLocation: ' Meeting room 1 ', hospitality: ' Tea and coffee ', vehicleReg: ' ab12 cde ', expectedLogOffAt: '2026-09-24T14:00',
  }
  const arrival = new Date('2026-09-24T12:00:00').toISOString()
  const input = visitorInputFromForm(form, 1, [], arrival)
  assert.equal(input.hostContactId, undefined)
  assert.equal(input.hostName, 'Sam Demo')
  assert.equal(input.visitLocation, 'Meeting room 1')
  assert.equal(input.hospitality, 'Tea and coffee')
  assert.equal(input.vehicleReg, 'AB12 CDE')
  assert.equal(input.expectedArrivalAt, arrival)
  const restored = visitorFormFromRecord({ ...input, locationOrHost: input.hostName })
  assert.equal(restored.host, OTHER_HOST)
  assert.equal(restored.hostEmail, form.hostEmail)
  assert.equal(restored.visitLocation, input.visitLocation)
  assert.equal(restored.hospitality, input.hospitality)
  assert.equal(restored.expectedLogOffAt, form.expectedLogOffAt)
})

test('selecting a directory host replaces old alternative host details; blank optional values stay absent', () => {
  const form = { ...emptyVisitorForm(), host: '7', hostName: 'Old host', hostEmail: 'old@example.test', expectedLogOffAt: '2026-09-24T14:00' }
  const input = visitorInputFromForm(form, 1, [{ id: 7, name: 'Directory Host', email: 'directory@example.test' }])
  assert.equal(input.hostName, 'Directory Host')
  assert.equal(input.hostEmail, 'directory@example.test')
  assert.equal(input.hostContactId, 7)
  assert.equal(input.visitLocation, undefined)
  assert.equal(input.hospitality, undefined)
})

test('visitor timing rejects invalid and reversed times, but permits edits to historical visits', () => {
  const form = { ...emptyVisitorForm(), expectedLogOffAt: '2026-09-24T14:00' }
  assert.deepEqual(visitorTimingErrors(form, { now, expectedArrivalAt: '2026-09-24T12:00' }), [])
  assert.match(visitorTimingErrors(form, { now, expectedArrivalAt: '2026-09-24T15:00' }).join(), /after the expected arrival/)
  assert.match(visitorTimingErrors(form, { now, expectedArrivalAt: '' }).join(), /Enter an expected arrival/)
  assert.match(visitorTimingErrors({ ...form, expectedLogOffAt: '' }, { now }).join(), /Enter an expected departure/)
  const historical = { ...form, expectedLogOffAt: '2026-09-23T14:00' }
  assert.match(visitorTimingErrors(historical, { now }).join(), /future/)
  assert.deepEqual(visitorTimingErrors(historical, { now, loggedOnAt: '2026-09-23T12:00:00' }), [])
  assert.match(visitorTimingErrors(historical, { now, loggedOnAt: '2026-09-23T15:00:00' }).join(), /after the actual arrival/)
})
