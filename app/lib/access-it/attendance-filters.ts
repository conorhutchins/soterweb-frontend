import type { AttendanceRecord } from '../../types/access-it'

export interface AttendanceFilters {
  search: string
  type: string
  building: string
  company: string
  attention: string
  from: string
  to: string
}

export function emptyAttendanceFilters(): AttendanceFilters {
  return { search: '', type: '', building: '', company: '', attention: '', from: '', to: '' }
}

export function attendanceFiltersFromQuery(query: Record<string, unknown>): AttendanceFilters {
  return {
    ...emptyAttendanceFilters(),
    type: ['Contractor', 'Visitor'].includes(String(query.type)) ? String(query.type) : '',
    attention: ['overdue', '24h'].includes(String(query.attention)) ? String(query.attention) : '',
  }
}

/** Date range includes visits that overlap any part of the selected local calendar days. */
export function matchesAttendance(record: AttendanceRecord, filters: AttendanceFilters, now: Date) {
  if (filters.from && filters.to && filters.from > filters.to) return false
  const search = filters.search.trim().toLocaleLowerCase()
  if (search && ![record.name, record.company, record.mobile, record.buildingName, record.locationOrHost, record.description].some((value) => value.toLocaleLowerCase().includes(search))) return false
  if (filters.type && record.type !== filters.type) return false
  if (filters.building && String(record.buildingId) !== filters.building) return false
  if (filters.company && record.company !== filters.company) return false
  if (filters.attention === 'overdue' && !(record.status === 'On site' && new Date(record.expectedLogOffAt) < now)) return false
  if (filters.attention === '24h' && !(record.status === 'On site' && record.loggedOnAt && now.getTime() - new Date(record.loggedOnAt).getTime() > 86400000)) return false
  if (filters.from || filters.to) {
    if (!record.loggedOnAt) return false
    const start = new Date(record.loggedOnAt).getTime()
    const end = record.loggedOffAt ? new Date(record.loggedOffAt).getTime() : now.getTime()
    if (filters.from && end < new Date(`${filters.from}T00:00:00`).getTime()) return false
    if (filters.to) {
      const nextDay = new Date(`${filters.to}T00:00:00`)
      nextDay.setDate(nextDay.getDate() + 1)
      if (start >= nextDay.getTime()) return false
    }
  }
  return true
}
