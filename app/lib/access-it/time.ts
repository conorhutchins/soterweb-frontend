// Small date helpers shared by the Access IT stores and screens. Calendar days ('YYYY-MM-DD') are
// always taken in local time so expiry and permit windows line up with the working-window clock.

export function minutesFromClock(clock: string) {
  const [hours = 0, minutes = 0] = clock.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes()
}

/** True when `clock` is not the 00:00 sentinel that deactivates a working-window parameter. */
export function clockIsSet(clock: string) {
  return /^\d{1,2}:\d{2}$/.test(clock) && minutesFromClock(clock) !== 0
}

/** Whether `minutes` falls inside a window that may wrap past midnight. Start is inclusive, finish exclusive. */
export function withinWindow(minutes: number, start: number, finish: number) {
  if (start === finish) return false
  if (start < finish) return minutes >= start && minutes < finish
  return minutes >= start || minutes < finish
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

/** Local calendar day as 'YYYY-MM-DD'. */
export function isoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function daysFromNow(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return isoDate(date)
}

export function todayAt(clock: string, dayOffset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  const [hours = 0, minutes = 0] = clock.split(':').map(Number)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

export function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

export function hasExpired(isoDay: string, now = new Date()) {
  return isoDay < isoDate(now)
}

/** Format a 'YYYY-MM-DD' day for display without a timezone shift. */
export function formatIsoDay(isoDay: string) {
  const [year, month, day] = isoDay.split('-').map(Number)
  if (!year || !month || !day) return '—'
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatTime(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return '—'
  return `${formatDate(iso)} ${formatTime(iso)}`
}

/** Local value for an <input type="datetime-local">. */
export function toDateTimeLocal(iso: string) {
  const date = new Date(iso)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromDateTimeLocal(value: string) {
  return new Date(value).toISOString()
}

export function hoursBetween(fromIso: string, toIso: string) {
  return (new Date(toIso).getTime() - new Date(fromIso).getTime()) / (60 * 60 * 1000)
}

export function describeDuration(fromIso: string, toIso = new Date().toISOString()) {
  const totalMinutes = Math.max(0, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}
