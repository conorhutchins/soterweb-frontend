// The decisions Access IT makes at the point of entry. Pure functions: no store access, no side
// effects, so they can be unit tested and later mirrored by the API.
import type { Asset, Building, Contractor, ContractorOrganisation, Permit, WorkingWindowBasis } from '~/types/access-it'
import { clockIsSet, hasExpired, minutesFromClock, minutesOfDay, withinWindow } from './time'

/** Read a parameter value by key. Provided by the config store. */
export type ParameterLookup = (key: string) => string

export type ComplianceCheckKey = 'induction' | 'insurance' | 'accreditation' | 'certification' | 'rams'

export interface ComplianceCheckResult {
  key: ComplianceCheckKey
  label: string
  level: 'Individual' | 'Organisation'
  parameter: string
  /** Whether the organisation has switched this check on. */
  enabled: boolean
  passed: boolean
  detail: string
}

interface ComplianceInput {
  contractor?: Contractor | null
  organisation: ContractorOrganisation
  param: ParameterLookup
  now?: Date
}

function expiryDetail(subject: string, expiry: string, now: Date) {
  const expired = hasExpired(expiry, now)
  return {
    passed: !expired,
    detail: expired ? `${subject} expired on ${new Date(expiry).toLocaleDateString('en-GB')}` : `${subject} valid until ${new Date(expiry).toLocaleDateString('en-GB')}`,
  }
}

/**
 * Run the five compliance checks. Accreditation, insurance and RAMS belong to the organisation.
 * Induction and certification belong to the person, so they are skipped for anonymous log ons
 * where no individual record exists.
 */
export function runComplianceChecks({ contractor, organisation, param, now = new Date() }: ComplianceInput): ComplianceCheckResult[] {
  const yes = (key: string) => param(key) === 'Yes'

  const induction: ComplianceCheckResult = {
    key: 'induction',
    label: 'Induction',
    level: 'Individual',
    parameter: 'Site Access Check Induction Expiry',
    enabled: yes('Site Access Check Induction Expiry'),
    ...(contractor ? expiryDetail('Induction', contractor.inductionExpiry, now) : { passed: true, detail: 'No individual record (anonymous log on)' }),
  }

  const insurance: ComplianceCheckResult = {
    key: 'insurance',
    label: 'Mandatory insurance',
    level: 'Organisation',
    parameter: 'Site Access Check Insurance Expiry',
    enabled: yes('Site Access Check Insurance Expiry'),
    ...expiryDetail('Insurance', organisation.insuranceExpiry, now),
  }

  const accreditation: ComplianceCheckResult = {
    key: 'accreditation',
    label: 'Mandatory accreditation',
    level: 'Organisation',
    parameter: 'Site Access Check Accreditation Expiry',
    enabled: yes('Site Access Check Accreditation Expiry'),
    ...expiryDetail('Accreditation', organisation.accreditationExpiry, now),
  }

  const certification: ComplianceCheckResult = {
    key: 'certification',
    label: 'Mandatory operative certification',
    level: 'Individual',
    parameter: 'Site Access Check Org Contact Certificate Expiry',
    enabled: yes('Site Access Check Org Contact Certificate Expiry'),
    ...(contractor ? expiryDetail(contractor.certificateName, contractor.certificateExpiry, now) : { passed: true, detail: 'No individual record (anonymous log on)' }),
  }

  const rams: ComplianceCheckResult = {
    key: 'rams',
    label: 'RAMS and documents',
    level: 'Organisation',
    parameter: 'Site Access Check RAMS and Docs Expiry',
    enabled: yes('Site Access Check RAMS and Docs Expiry'),
    ...expiryDetail('RAMS', organisation.ramsExpiry, now),
  }

  return [induction, insurance, accreditation, certification, rams]
}

export function complianceFailures(results: ComplianceCheckResult[]) {
  return results.filter((result) => result.enabled && !result.passed)
}

export interface WorkingWindowResult {
  allowed: boolean
  basis: WorkingWindowBasis
  /** True when the log on falls in the flex period and the reminder (eNote 2A) should be shown. */
  showFlexMessage: boolean
  /** The permit that authorised an out of hours log on, so it can be activated. */
  permit?: Permit
  coreHours: string
  flexHours: string
  /** eNote code explaining a refusal. */
  denialCode?: '5D'
}

interface WorkingWindowInput {
  organisation: ContractorOrganisation
  contractor?: Contractor | null
  buildingId: number
  permits: Permit[]
  param: ParameterLookup
  now?: Date
}

function describeHours(start: string, finish: string) {
  return `${start} to ${finish}`
}

/**
 * Decide whether the contractor may attend now. Four settings work from the general to the
 * specific, each overriding the one before: core hours, the flex period, an out of hours permit,
 * and organisations approved to work outside hours.
 */
export function evaluateWorkingWindow({ organisation, contractor, buildingId, permits, param, now = new Date() }: WorkingWindowInput): WorkingWindowResult {
  const coreStart = param('Site Access Check Core Hour START')
  const coreFinish = param('Site Access Check Core Hour FINISH')
  const flexStart = param('Site Access Check Core Hour START Flex')
  const flexFinish = param('Site Access Check Core Hour FINISH Flex')

  const coreHours = describeHours(coreStart, coreFinish)
  const flexHours = describeHours(clockIsSet(flexStart) ? flexStart : coreStart, clockIsSet(flexFinish) ? flexFinish : coreFinish)
  const base = { showFlexMessage: false, coreHours, flexHours }

  if (!clockIsSet(coreStart) || !clockIsSet(coreFinish)) {
    return { ...base, allowed: true, basis: 'Checks disabled' }
  }

  if (organisation.outOfHoursApproved) {
    return { ...base, allowed: true, basis: 'Approved organisation' }
  }

  const minutes = minutesOfDay(now)

  if (withinWindow(minutes, minutesFromClock(coreStart), minutesFromClock(coreFinish))) {
    return { ...base, allowed: true, basis: 'Core hours' }
  }

  const permit = findOutOfHoursPermit({ permits, organisation, contractor, buildingId, now })
  if (permit) {
    return { ...base, allowed: true, basis: 'Permit', permit }
  }

  const windowStart = clockIsSet(flexStart) ? minutesFromClock(flexStart) : minutesFromClock(coreStart)
  const windowFinish = clockIsSet(flexFinish) ? minutesFromClock(flexFinish) : minutesFromClock(coreFinish)

  if (withinWindow(minutes, windowStart, windowFinish)) {
    return { ...base, allowed: true, basis: 'Flex period', showFlexMessage: true }
  }

  return { ...base, allowed: false, basis: 'Core hours', denialCode: '5D' }
}

interface PermitSearch {
  permits: Permit[]
  organisation: ContractorOrganisation
  contractor?: Contractor | null
  buildingId: number
  now?: Date
}

function permitIsCurrent(permit: Permit, now: Date) {
  const today = now.toISOString().slice(0, 10)
  return (permit.status === 'Approved' || permit.status === 'Live') && permit.validFrom <= today && permit.validTo >= today
}

/** A current permit authorising this person (or their organisation) to work out of hours at the building. */
export function findOutOfHoursPermit({ permits, organisation, contractor, buildingId, now = new Date() }: PermitSearch) {
  return permits.find((permit) =>
    permit.outOfHoursAuthorised
    && permitIsCurrent(permit, now)
    && permit.buildingId === buildingId
    && permit.organisationId === organisation.id
    && (!permit.contractorId || permit.contractorId === contractor?.id),
  )
}

/** Live permits at the same building held by other organisations: work that may conflict. */
export function findPotentialConflicts(permits: Permit[], buildingId: number, organisationId: number, now = new Date()) {
  return permits.filter((permit) => permit.buildingId === buildingId && permit.organisationId !== organisationId && permitIsCurrent(permit, now))
}

/** The asbestos screen appears where the location is flagged and the organisation is likely to disturb the fabric. */
export function requiresAsbestosAcknowledgement(building: Building, organisation: ContractorOrganisation) {
  return building.asbestosPresent && organisation.disturbsBuildingFabric
}

/** The RAMS screen appears for organisations flagged as undertaking high risk work. */
export function requiresRamsAcknowledgement(organisation: ContractorOrganisation) {
  return organisation.highRiskWork
}

/** Assets the organisation is the designated PPM contractor for, in the building they logged on to. */
export function assetsEligibleForUpdate(assets: Asset[], organisationId: number, buildingId: number) {
  return assets.filter((asset) => asset.active && asset.ppmOrganisationId === organisationId && asset.buildingId === buildingId)
}

/** The longest permitted stay, from the Expected Logout Max Duration parameter. 0 means unlimited. */
export function maximumStayHours(param: ParameterLookup) {
  const hours = Number(param('Site Access Expected Logout Max Duration'))
  return Number.isFinite(hours) && hours > 0 ? hours : null
}
