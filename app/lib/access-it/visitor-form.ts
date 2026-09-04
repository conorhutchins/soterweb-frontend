import type { VisitorInput } from '~/composables/useSiteAttendance'
import type { AttendanceRecord, StaffContact } from '~/types/access-it'
import { fromDateTimeLocal, hoursFromNow, toDateTimeLocal } from './time'

/** Sentinel for the "Someone else" host option: the visitor names an ad-hoc host. */
export const OTHER_HOST = 'other'

/** Form state shared by the visitor kiosk and the reception dialog. Dates are datetime-local strings. */
export interface VisitorFormState {
  name: string
  company: string
  mobile: string
  email: string
  vehicleReg: string
  /** A staff contact id as a string, or OTHER_HOST. */
  host: string
  hostName: string
  hostEmail: string
  description: string
  expectedLogOffAt: string
}

export function emptyVisitorForm(): VisitorFormState {
  return {
    name: '',
    company: '',
    mobile: '',
    email: '',
    vehicleReg: '',
    host: '',
    hostName: '',
    hostEmail: '',
    description: '',
    expectedLogOffAt: toDateTimeLocal(hoursFromNow(2)),
  }
}

export function visitorFormFromRecord(record: AttendanceRecord): VisitorFormState {
  const hasSystemHost = Boolean(record.hostContactId)
  return {
    name: record.name,
    company: record.company,
    mobile: record.mobile,
    email: record.email,
    vehicleReg: record.vehicleReg ?? '',
    host: hasSystemHost ? String(record.hostContactId) : OTHER_HOST,
    hostName: hasSystemHost ? '' : record.locationOrHost,
    hostEmail: hasSystemHost ? '' : record.hostEmail ?? '',
    description: record.description,
    expectedLogOffAt: toDateTimeLocal(record.expectedLogOffAt),
  }
}

export function visitorInputFromForm(form: VisitorFormState, buildingId: number, staffContacts: StaffContact[], expectedArrivalAt?: string): VisitorInput {
  const contact = form.host === OTHER_HOST ? undefined : staffContacts.find((candidate) => String(candidate.id) === form.host)
  return {
    name: form.name.trim(),
    company: form.company.trim(),
    mobile: form.mobile.trim(),
    email: form.email.trim(),
    buildingId,
    hostContactId: contact?.id,
    hostName: contact?.name ?? form.hostName.trim(),
    hostEmail: contact?.email ?? form.hostEmail.trim(),
    description: form.description.trim(),
    expectedArrivalAt,
    expectedLogOffAt: fromDateTimeLocal(form.expectedLogOffAt),
    vehicleReg: form.vehicleReg.trim() || undefined,
  }
}

export interface VisitorTimingOptions {
  /** Pre-booked visits: the expected arrival as a datetime-local string. */
  expectedArrivalAt?: string
  now?: Date
}

/**
 * Timing problems with a visitor form, as plain messages. Empty when the times make sense: the
 * expected log off must be in the future, and a pre-booked arrival must be in the future and before the log off.
 */
export function visitorTimingErrors(form: VisitorFormState, { expectedArrivalAt, now = new Date() }: VisitorTimingOptions = {}) {
  const errors: string[] = []
  const logOff = new Date(form.expectedLogOffAt).getTime()
  if (Number.isNaN(logOff)) errors.push('Enter an expected log off time.')
  else if (logOff <= now.getTime()) errors.push('The expected log off time must be in the future.')

  if (expectedArrivalAt !== undefined) {
    const arrival = new Date(expectedArrivalAt).getTime()
    if (Number.isNaN(arrival)) errors.push('Enter an expected arrival time.')
    else {
      if (arrival <= now.getTime()) errors.push('The expected arrival time must be in the future.')
      if (!Number.isNaN(logOff) && logOff <= arrival) errors.push('The expected log off must be after the expected arrival.')
    }
  }
  return errors
}
