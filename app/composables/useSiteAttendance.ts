import { useNow } from '@vueuse/core'
import type { Ref } from 'vue'
import { LOG_OFF_OPTIONS } from '~/lib/access-it/config-defaults'
import { renderTemplate } from '~/lib/access-it/templates'
import { formatDateTime, hoursFromNow, todayAt } from '~/lib/access-it/time'
import type { AssetActivity, AttendanceRecord, LogOffOption, LogOnReason, SentEmail, VisitorSource, WorkingWindowBasis } from '~/types/access-it'

function token() {
  return Math.random().toString(36).slice(2, 10)
}

function attendanceFixture(): AttendanceRecord[] {
  return [
    { id: 1, type: 'Contractor', status: 'On site', name: 'Marcus Webb', company: 'Advanced Super Monitoring', mobile: '07841 995 234', email: 'marcus.webb@asmonitoring.co.uk', buildingId: 1, buildingName: 'Ashworth Building', locationOrHost: 'Fire alarm panel, main lobby', description: 'Fire alarm panel monitoring', loggedOnAt: todayAt('07:10', -2), expectedLogOffAt: todayAt('17:00', -2), loggedOffAt: null, passToken: token(), contractorId: 9, organisationId: 2, reason: 'A', workingWindowBasis: 'Core hours' },
    { id: 2, type: 'Contractor', status: 'On site', name: 'Justin Thorpe', company: 'Advanced Super Monitoring', mobile: '07700 900123', email: 'justin.thorpe@asmonitoring.co.uk', buildingId: 2, buildingName: 'Priory House', locationOrHost: 'Lift 22', description: 'Lift 22 control panel replacement (PTW-2026-0142)', loggedOnAt: hoursFromNow(-2.5), expectedLogOffAt: hoursFromNow(5), loggedOffAt: null, passToken: token(), contractorId: 2, organisationId: 2, reason: 'C', workingWindowBasis: 'Core hours' },
    { id: 3, type: 'Contractor', status: 'On site', name: 'Amira Khan', company: 'NightClean Services', mobile: '07746 385 627', email: 'amira.khan@nightclean.co.uk', buildingId: 5, buildingName: 'Sports Centre', locationOrHost: 'Changing rooms', description: 'Deep clean of changing rooms', loggedOnAt: hoursFromNow(-1.2), expectedLogOffAt: hoursFromNow(3), loggedOffAt: null, passToken: token(), contractorId: 5, organisationId: 4, reason: 'A', workingWindowBasis: 'Approved organisation' },
    { id: 4, type: 'Visitor', status: 'On site', name: 'Jamie Brown', company: 'Harrison Architects', mobile: '07712 303 944', email: 'jamie.brown@harrisonarchitects.co.uk', buildingId: 2, buildingName: 'Priory House', locationOrHost: 'Thomas Fenwick', description: 'Design review', loggedOnAt: hoursFromNow(-0.75), expectedLogOffAt: hoursFromNow(2), loggedOffAt: null, passToken: token(), source: 'Reception', hostContactId: 1, hostEmail: 'thomas.fenwick@campusworkspace.co.uk', vehicleReg: 'AP74 VVF' },
    { id: 5, type: 'Visitor', status: 'On site', name: 'Lisa Anderson', company: 'Vertex Management Consulting', mobile: '07765 234 891', email: 'lisa.anderson@vertexmc.co.uk', buildingId: 3, buildingName: 'Library', locationOrHost: 'Sarah Ogundipe', description: 'Compliance review', loggedOnAt: hoursFromNow(-2), expectedLogOffAt: hoursFromNow(-0.5), loggedOffAt: null, passToken: token(), source: 'Self service', hostContactId: 3, hostEmail: 'sarah.ogundipe@campusworkspace.co.uk' },
    { id: 6, type: 'Visitor', status: 'Expected', name: 'David Lee', company: 'Catalyst Ventures Ltd', mobile: '07634 128 756', email: 'david.lee@catalystventures.co.uk', buildingId: 1, buildingName: 'Ashworth Building', locationOrHost: 'Nadia Rossi', description: 'Partnership discussion', expectedArrivalAt: hoursFromNow(1.5), loggedOnAt: null, expectedLogOffAt: hoursFromNow(4), loggedOffAt: null, passToken: token(), source: 'Pre-booked', hostContactId: 6, hostEmail: 'nadia.rossi@campusworkspace.co.uk' },
    { id: 7, type: 'Visitor', status: 'Expected', name: 'Catherine Taylor', company: 'Zenith Executive Search', mobile: '07841 995 111', email: 'catherine.taylor@zenithsearch.co.uk', buildingId: 3, buildingName: 'Library', locationOrHost: 'Gareth Bell', description: 'Recruitment discussion', expectedArrivalAt: todayAt('09:30', 1), loggedOnAt: null, expectedLogOffAt: todayAt('11:00', 1), loggedOffAt: null, passToken: token(), source: 'Pre-booked', hostContactId: 5, hostEmail: 'gareth.bell@campusworkspace.co.uk' },
    { id: 8, type: 'Visitor', status: 'Departed', name: 'John Smith', company: 'Davison & Partners', mobile: '07956 143 287', email: 'john.smith@davisonpartners.co.uk', buildingId: 1, buildingName: 'Ashworth Building', locationOrHost: 'Paul Lendwick', description: 'Design studio review', loggedOnAt: todayAt('10:27', -1), expectedLogOffAt: todayAt('12:30', -1), loggedOffAt: todayAt('12:05', -1), passToken: token(), source: 'Reception', hostContactId: 2, hostEmail: 'paul.lendwick@campusworkspace.co.uk' },
    { id: 9, type: 'Contractor', status: 'Departed', name: 'Stuart Grey', company: 'Aqua Force Plumbing Services', mobile: '07744 695 8499', email: 'stuart.grey@aquaforce.co.uk', buildingId: 4, buildingName: 'Energy Centre', locationOrHost: 'Plant room', description: 'Boiler PPM visit', loggedOnAt: todayAt('08:02', -1), expectedLogOffAt: todayAt('12:00', -1), loggedOffAt: todayAt('11:40', -1), passToken: token(), contractorId: 1, organisationId: 1, reason: 'A', workingWindowBasis: 'Core hours', logOffOption: 'A', assetActivities: [{ type: 'PPM visit', assetTag: 'ENC-BOIL-000001', parentTag: 'P-ENC-BOIL', description: 'Gas boiler 1', location: 'Plant room, ground floor', manufacturer: 'Remeha', model: 'Quinta Pro 115', serialNumber: 'RQ115-44821', serviceConditionRating: '1 - Good', conditionStatus: 'Acceptable', notes: 'Annual service completed. Flue gas analysis within limits.', certificateFileName: 'boiler-1-service-certificate.pdf' }] },
    { id: 10, type: 'Visitor', status: 'Departed', name: 'Michael Brown', company: 'Meridian Consulting Group', mobile: '07746 385 000', email: 'michael.brown@meridiancg.co.uk', buildingId: 6, buildingName: 'Halifax Halls of Residence', locationOrHost: 'Thomas Fenwick', description: 'Facilities assessment', loggedOnAt: todayAt('10:53', -3), expectedLogOffAt: todayAt('13:00', -3), loggedOffAt: todayAt('12:48', -3), passToken: token(), source: 'Self service', hostContactId: 1, hostEmail: 'thomas.fenwick@campusworkspace.co.uk' },
  ]
}

function sentEmailFixture(): SentEmail[] {
  return [
    { id: 1, runOrder: '00004005', to: 'thomas.fenwick@campusworkspace.co.uk', subject: 'Your visitor Jamie Brown has arrived', body: 'Hello Thomas Fenwick,\n\nJamie Brown from Harrison Architects has arrived at Priory House to see you. Reason for visit: Design review.', attachment: '', sentAt: hoursFromNow(-0.75) },
    { id: 2, runOrder: '00003990', to: 'jamie.brown@harrisonarchitects.co.uk', subject: 'Your visitor pass for Priory House', body: 'Hello Jamie Brown,\n\nYour visit to Priory House to see Thomas Fenwick has been recorded.', attachment: 'Visitor site rules.pdf', sentAt: hoursFromNow(-0.75) },
    { id: 3, runOrder: '00004010', to: 'thomas.fenwick@campusworkspace.co.uk', subject: 'Justin Thorpe has logged on at Priory House', body: 'Hello Thomas Fenwick,\n\nJustin Thorpe (Advanced Super Monitoring) logged on at Priory House for: Lift 22 control panel replacement (PTW-2026-0142).', attachment: '', sentAt: hoursFromNow(-2.5) },
  ]
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
