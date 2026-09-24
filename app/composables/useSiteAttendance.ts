import { useNow } from '@vueuse/core'
import type { Ref } from 'vue'
import { LOG_OFF_OPTIONS } from '~/lib/access-it/config-defaults'
import { renderTemplate } from '~/lib/access-it/templates'
import { attendanceFixture, sentEmailFixture } from '~/lib/access-it/demo-fixtures'
import { preserveDemoInteraction, refreshSampleDates } from '~/lib/access-it/demo-samples'
import { formatDateTime, isoDate } from '~/lib/access-it/time'
import type { AssetActivity, AttendanceRecord, LogOffOption, LogOnReason, SentEmail, VisitorSource, WorkingWindowBasis } from '~/types/access-it'

function token() {
  return Math.random().toString(36).slice(2, 10)
}

export interface ContractorLogOnInput {
  contractorId?: number
  organisationId: number
  name: string
  company: string
  mobile: string
  email: string
  buildingId: number
  location: string
  description: string
  reason: LogOnReason
  expectedLogOffAt: string
  anonymous: boolean
  workingWindowBasis: WorkingWindowBasis
  /** The permit being worked under, when known. */
  permitId?: number
}

export interface VisitorInput {
  name: string
  company: string
  mobile: string
  email: string
  buildingId: number
  hostContactId?: number
  hostName: string
  hostEmail: string
  description: string
  expectedArrivalAt?: string
  expectedLogOffAt: string
  vehicleReg?: string
}

let clock: Ref<Date> | undefined

/** A clock that ticks every 30 seconds so overdue and over-24-hour flags update without a mutation. Lives outside any component scope. */
function sharedClock() {
  if (!clock) clock = effectScope(true).run(() => useNow({ interval: 30_000 })) as Ref<Date>
  return clock
}

function normaliseContact(value: string) {
  return value.replace(/\s+/g, '').toLowerCase()
}

/**
 * Attendance records for the site plus the emails the module would have sent. Mocked in memory
 * and persisted locally until the .NET API is connected.
 */
export function useSiteAttendance() {
  const { state: records, reset: resetRecords } = usePersistedState<AttendanceRecord[]>('access-it-attendance', attendanceFixture)
  const { state: sentEmails, reset: resetEmails } = usePersistedState<SentEmail[]>('access-it-sent-emails', sentEmailFixture)
  const config = useAccessItConfig()
  const directory = useSiteDirectory()
  const now = sharedClock()
  const sampleDay = isoDate(now.value)
  records.value = refreshSampleDates(records.value, attendanceFixture(now.value), sampleDay, ['loggedOnAt', 'expectedLogOffAt', 'expectedArrivalAt', 'loggedOffAt', 'travelStartedAt', 'travelFinishedAt'])
  sentEmails.value = refreshSampleDates(sentEmails.value, sentEmailFixture(now.value), sampleDay, ['sentAt'])

  const onSite = computed(() => records.value.filter((record) => record.status === 'On site'))
  const contractorsOnSite = computed(() => onSite.value.filter((record) => record.type === 'Contractor'))
  const visitorsOnSite = computed(() => onSite.value.filter((record) => record.type === 'Visitor'))
  const expectedVisitors = computed(() => records.value.filter((record) => record.type === 'Visitor' && record.status === 'Expected'))
  const onSiteOverExpectedTime = computed(() => onSite.value.filter((record) => isPastExpectedLogOff(record)))
  const onSiteOver24Hours = computed(() => onSite.value.filter((record) => isOnSiteOver24Hours(record)))

  function isPastExpectedLogOff(record: AttendanceRecord) {
    return record.status === 'On site' && new Date(record.expectedLogOffAt).getTime() < now.value.getTime()
  }

  function isOnSiteOver24Hours(record: AttendanceRecord) {
    return record.status === 'On site' && Boolean(record.loggedOnAt) && now.value.getTime() - new Date(record.loggedOnAt as string).getTime() > 24 * 60 * 60 * 1000
  }

  function recordById(id: number) {
    return records.value.find((record) => record.id === id)
  }

  function nextId() {
    return Math.max(...records.value.map((record) => record.id), 0) + 1
  }

  function logOffPath(record: AttendanceRecord) {
    return record.type === 'Visitor' ? `/site-access/visitors?logoff=${record.passToken}` : `/site-access/logout?token=${record.passToken}`
  }

  function absoluteLink(path: string) {
    if (!import.meta.client) return path
    const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
    return `${window.location.origin}${base}${path}`
  }

  /** Send an email automation if it is active. Returns the sent email, or null when inactive. */
  function sendAutomation(runOrder: string, to: string, context: Record<string, string | undefined>) {
    const automation = config.automation(runOrder)
    if (!automation || !automation.active || !to) return null

    const email: SentEmail = {
      id: Math.max(...sentEmails.value.map((sent) => sent.id), 0) + 1,
      runOrder,
      to,
      subject: renderTemplate(automation.subject, context),
      body: renderTemplate(automation.body, context),
      attachment: automation.attachment,
      sentAt: new Date().toISOString(),
    }
    sentEmails.value.unshift(email)
    return email
  }

  function contextFor(record: AttendanceRecord, hostName?: string) {
    return {
      Name: record.name,
      Company: record.company,
      Building: record.buildingName,
      Host: hostName ?? record.locationOrHost,
      Description: record.description,
      LoggedOn: formatDateTime(record.loggedOnAt),
      Expected: formatDateTime(record.expectedArrivalAt ?? record.expectedLogOffAt),
      LogOffLink: absoluteLink(logOffPath(record)),
      ArrivalLink: absoluteLink(`/site-access/visitors?arrive=${record.passToken}`),
      SentAt: formatDateTime(new Date().toISOString()),
    }
  }

  function activeContractorRecord(contractorId: number) {
    return onSite.value.find((record) => record.contractorId === contractorId)
  }

  function logOnContractor(input: ContractorLogOnInput) {
    const building = directory.buildingById(input.buildingId)
    const organisation = directory.organisationById(input.organisationId)
    const record: AttendanceRecord = {
      id: nextId(),
      type: 'Contractor',
      status: 'On site',
      name: input.name,
      company: input.company,
      mobile: input.mobile,
      email: input.email,
      buildingId: input.buildingId,
      buildingName: building?.name ?? '',
      locationOrHost: input.location,
      description: input.description,
      loggedOnAt: new Date().toISOString(),
      expectedLogOffAt: input.expectedLogOffAt,
      loggedOffAt: null,
      passToken: token(),
      contractorId: input.contractorId,
      organisationId: input.organisationId,
      reason: input.reason,
      anonymous: input.anonymous,
      workingWindowBasis: input.workingWindowBasis,
      permitId: input.permitId,
    }
    records.value.unshift(record)

    if (organisation) sendAutomation('00004010', organisation.managedByEmail, contextFor(record, organisation.managedByName))
    if (input.reason === 'B') sendAutomation('00004900', directory.siteProfile.dutyManagerEmail, contextFor(record))

    return record
  }

  /**
   * The permits a log off option may suspend or close: the permit recorded at log on, or failing that
   * the current permits at the same building held by this operative or organisation-wide. Anonymous
   * operatives never touch permits assigned to a named colleague.
   */
  function permitsAffectedByLogOff(record: AttendanceRecord) {
    if (!record.organisationId) return []
    if (record.permitId) {
      const permit = directory.permits.value.find((candidate) => candidate.id === record.permitId && candidate.status !== 'Closed')
      return permit ? [permit] : []
    }
    return directory.currentPermitsFor(record.organisationId, record.contractorId).filter((permit) =>
      permit.buildingId === record.buildingId && (!permit.contractorId || permit.contractorId === record.contractorId),
    )
  }

  function logOffContractor(recordId: number, option: LogOffOption, assetActivities: AssetActivity[] = []) {
    const record = recordById(recordId)
    if (!record) return null

    preserveDemoInteraction(record)
    const chosen = LOG_OFF_OPTIONS.find((candidate) => candidate.code === option)
    record.logOffOption = option
    if (assetActivities.length) record.assetActivities = [...(record.assetActivities ?? []), ...assetActivities]

    if (chosen && chosen.permitAction !== 'none') {
      for (const permit of permitsAffectedByLogOff(record)) directory.setPermitStatus(permit.id, chosen.permitAction === 'close' ? 'Closed' : 'Suspended')
    }

    if (!chosen || !chosen.remainsOnSite) {
      record.status = 'Departed'
      record.loggedOffAt = new Date().toISOString()
    }

    for (const activity of assetActivities) {
      if (record.organisationId) directory.applyAssetActivity(activity, record.buildingId, record.organisationId)
    }

    return record
  }

  function visitorRecord(input: VisitorInput, source: VisitorSource, arrived: boolean): AttendanceRecord {
    const building = directory.buildingById(input.buildingId)
    return {
      id: nextId(),
      type: 'Visitor',
      status: arrived ? 'On site' : 'Expected',
      name: input.name,
      company: input.company,
      mobile: input.mobile,
      email: input.email,
      buildingId: input.buildingId,
      buildingName: building?.name ?? '',
      locationOrHost: input.hostName,
      description: input.description,
      expectedArrivalAt: input.expectedArrivalAt,
      loggedOnAt: arrived ? new Date().toISOString() : null,
      expectedLogOffAt: input.expectedLogOffAt,
      loggedOffAt: null,
      passToken: token(),
      source,
      hostContactId: input.hostContactId,
      hostEmail: input.hostEmail,
      vehicleReg: input.vehicleReg,
    }
  }

  function notifyHostOfArrival(record: AttendanceRecord) {
    const runOrder = record.hostContactId ? '00004005' : '00004006'
    return sendAutomation(runOrder, record.hostEmail ?? '', contextFor(record))
  }

  /** Reception adds a visitor: registered on arrival, or pre-booked for later. */
  function addVisitor(input: VisitorInput, arrived: boolean) {
    const record = visitorRecord(input, arrived ? 'Reception' : 'Pre-booked', arrived)
    records.value.unshift(record)

    if (arrived) {
      sendAutomation('00003990', record.email, contextFor(record))
      notifyHostOfArrival(record)
    }
    else {
      sendAutomation('00004000', record.email, contextFor(record))
    }

    return record
  }

  function updateVisitor(recordId: number, input: VisitorInput) {
    const record = recordById(recordId)
    if (!record) return
    const building = directory.buildingById(input.buildingId)
    preserveDemoInteraction(record)
    Object.assign(record, {
      name: input.name,
      company: input.company,
      mobile: input.mobile,
      email: input.email,
      buildingId: input.buildingId,
      buildingName: building?.name ?? record.buildingName,
      locationOrHost: input.hostName,
      hostContactId: input.hostContactId,
      hostEmail: input.hostEmail,
      description: input.description,
      expectedArrivalAt: input.expectedArrivalAt ?? record.expectedArrivalAt,
      expectedLogOffAt: input.expectedLogOffAt,
      vehicleReg: input.vehicleReg,
    })
  }

  function deleteRecord(recordId: number) {
    records.value = records.value.filter((record) => record.id !== recordId)
  }

  function markArrived(recordId: number) {
    const record = recordById(recordId)
    if (!record || record.status === 'On site') return record ?? null
    preserveDemoInteraction(record)
    record.status = 'On site'
    record.loggedOnAt = new Date().toISOString()
    record.loggedOffAt = null
    sendAutomation('00003990', record.email, contextFor(record))
    notifyHostOfArrival(record)
    return record
  }

  function markDeparted(recordId: number) {
    const record = recordById(recordId)
    if (!record) return null
    preserveDemoInteraction(record)
    record.status = 'Departed'
    record.loggedOffAt = new Date().toISOString()
    return record
  }

  /** The self-service visitor route: notifies the host and emails a pass with a log off link. */
  function visitorSelfLogOn(input: VisitorInput) {
    const record = visitorRecord(input, 'Self service', true)
    records.value.unshift(record)
    sendAutomation('00003995', record.email, contextFor(record))
    notifyHostOfArrival(record)
    return record
  }

  /** Match someone on site by the contact details they gave on arrival. */
  function findOnSiteByContact(mobile: string, email: string, type?: AttendanceRecord['type']) {
    return onSite.value.find((record) =>
      (!type || record.type === type)
      && normaliseContact(record.mobile) === normaliseContact(mobile)
      && normaliseContact(record.email) === normaliseContact(email),
    ) ?? null
  }

  /** Match a visitor on site by the details they entered on arrival. */
  function findVisitorOnSiteByContact(mobile: string, email: string) {
    return findOnSiteByContact(mobile, email, 'Visitor')
  }

  function findByToken(passToken: string) {
    return records.value.find((record) => record.passToken === passToken) ?? null
  }

  /** Send the current on-site list to a nominated address, normally the fire marshal. */
  function sendOnSiteList(to: string) {
    const list = onSite.value.map((record) => `${record.type}: ${record.name} (${record.company}) at ${record.buildingName}, logged on ${formatDateTime(record.loggedOnAt)}`).join('\n')
    return sendAutomation('00004500', to, { OnSiteList: list || 'Nobody is currently recorded on site.', SentAt: formatDateTime(new Date().toISOString()) })
  }

  function resetAll() {
    resetRecords()
    resetEmails()
  }

  return {
    records,
    sentEmails,
    now,
    isPastExpectedLogOff,
    isOnSiteOver24Hours,
    permitsAffectedByLogOff,
    onSite,
    contractorsOnSite,
    visitorsOnSite,
    expectedVisitors,
    onSiteOverExpectedTime,
    onSiteOver24Hours,
    recordById,
    logOffPath,
    activeContractorRecord,
    logOnContractor,
    logOffContractor,
    addVisitor,
    updateVisitor,
    deleteRecord,
    markArrived,
    markDeparted,
    visitorSelfLogOn,
    findOnSiteByContact,
    findVisitorOnSiteByContact,
    findByToken,
    sendOnSiteList,
    sendAutomation,
    resetAll,
  }
}
