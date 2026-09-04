<script setup lang="ts">
import { BadgeCheck, CircleCheck, Mail, MailCheck, Phone, TriangleAlert } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { complianceFailures, evaluateWorkingWindow, findPermitsForAttendance, findPotentialConflicts, requiresAsbestosAcknowledgement, requiresRamsAcknowledgement, runComplianceChecks, type ComplianceCheckResult, type WorkingWindowResult } from '~/lib/access-it/compliance'
import { formatDateTime, formatTime } from '~/lib/access-it/time'
import type { AttendanceRecord, ContractorIdentity, ContractorWorkDetails, LogOnReason, Permit } from '~/types/access-it'

definePageMeta({ layout: false })

type Step = 'identify' | 'confirm' | 'details' | 'flex' | 'asbestos' | 'rams' | 'accepted' | 'complete' | 'denied'
type DenialCode = '5A' | '5B' | '5C' | '5D'

const directory = useSiteDirectory()
const config = useAccessItConfig()
const { logOnContractor } = useSiteAttendance()

const inputClass = 'h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 text-base outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100'

const step = ref<Step>('identify')
const identifyNotice = ref('')
const detailsNotice = ref('')
const identity = ref<ContractorIdentity | null>(null)
const reason = ref<LogOnReason | null>(null)
const details = ref<ContractorWorkDetails | null>(null)
const checks = ref<ComplianceCheckResult[]>([])
const windowResult = ref<WorkingWindowResult | null>(null)
/** The permit the contractor is attending under (reason C), if any. */
const workPermit = ref<Permit | null>(null)
const denialCode = ref<DenialCode>('5A')
const contact = reactive({ mobile: '', email: '' })
const savedRecord = ref<AttendanceRecord | null>(null)

const asbestosRequired = computed(() => Boolean(identity.value && details.value && requiresAsbestosAcknowledgement(details.value.building, identity.value.organisation)))
const ramsRequired = computed(() => Boolean(identity.value && requiresRamsAcknowledgement(identity.value.organisation)))

const stepNames = computed(() => {
  const names = ['Identify', 'Confirm', 'Work details']
  if (asbestosRequired.value) names.push('Asbestos')
  if (ramsRequired.value) names.push('RAMS')
  names.push('Accepted')
  return names
})

const stepLabels: Record<Step, string> = { identify: 'Identify', confirm: 'Confirm', details: 'Work details', flex: 'Work details', asbestos: 'Asbestos', rams: 'RAMS', accepted: 'Accepted', complete: 'Accepted', denied: '' }
const currentStepIndex = computed(() => Math.max(0, stepNames.value.indexOf(stepLabels[step.value])))

const titles = computed<Record<Step, { title: string, subtitle: string }>>(() => ({
  identify: { title: 'Log on to site', subtitle: 'Tell us who you are and why you are attending.' },
  confirm: { title: 'Before you continue', subtitle: 'Read and accept the site conditions.' },
  details: { title: 'Work details', subtitle: 'Where you are working, what you are doing and when you expect to leave.' },
  flex: { title: 'Outside core hours', subtitle: 'You are logging on within the flex period.' },
  asbestos: { title: 'Asbestos warning', subtitle: 'This location is flagged as containing asbestos.' },
  rams: { title: 'Risk assessments and method statements', subtitle: 'Your organisation is registered for high risk work.' },
  accepted: { title: config.eNote('4').title || 'Login accepted', subtitle: 'Confirm your contact details and review any potential conflicts.' },
  complete: { title: 'You are logged on', subtitle: 'Your attendance has been recorded.' },
  denied: { title: config.eNote('5').title || 'Access denied', subtitle: 'You cannot log on to site at the moment.' },
}))

const conflicts = computed(() => {
  if (!identity.value || !details.value) return []
  return findPotentialConflicts(directory.permits.value, details.value.building.id, identity.value.organisation.id)
    .map((permit) => ({ ...permit, organisationName: directory.organisationById(permit.organisationId)?.name ?? 'Unknown organisation' }))
})

const workingWindowBadge = computed(() => {
  const result = windowResult.value
  if (!result) return null
  switch (result.basis) {
    case 'Checks disabled': return { label: 'No time restrictions apply', tone: 'neutral' as const }
    case 'Core hours': return { label: `Within core hours (${result.coreHours})`, tone: 'success' as const }
    case 'Flex period': return { label: `Flex period (core hours ${result.coreHours})`, tone: 'warning' as const }
    case 'Permit': return { label: `Out of hours: authorised by permit ${result.permit?.reference ?? ''}`, tone: 'info' as const }
    case 'Approved organisation': return { label: 'Out of hours: approved organisation', tone: 'info' as const }
    case 'Emergency work': return { label: 'Emergency work: outside normal hours permitted', tone: 'warning' as const }
  }
  return null
})

const savedPermit = computed(() => directory.permits.value.find((permit) => permit.id === savedRecord.value?.permitId) ?? null)
const permitRequested = computed(() => reason.value === 'D' || reason.value === 'E')

const notifications = computed(() => {
  if (!identity.value) return []
  const organisation = identity.value.organisation
  const list = [{ runOrder: '00004010', to: `${organisation.managedByName} (${organisation.managedByEmail})`, active: config.automation('00004010')?.active ?? false }]
  if (reason.value === 'B') list.push({ runOrder: '00004900', to: `Estates duty manager (${directory.siteProfile.dutyManagerEmail})`, active: config.automation('00004900')?.active ?? false })
  return list
})

function restart() {
  step.value = 'identify'
  identifyNotice.value = ''
  detailsNotice.value = ''
  identity.value = null
  reason.value = null
  details.value = null
  checks.value = []
  windowResult.value = null
  workPermit.value = null
  savedRecord.value = null
}

function deny(code: DenialCode) {
  denialCode.value = code
  step.value = 'denied'
}

function onIdentified(resolved: ContractorIdentity, chosenReason: LogOnReason) {
  identity.value = resolved
  reason.value = chosenReason
  identifyNotice.value = ''
  step.value = 'confirm'
}

function declineAcceptance() {
  identifyNotice.value = 'You must accept the site conditions before you can log on.'
  step.value = 'identify'
}

function onDetails(submitted: ContractorWorkDetails) {
  if (!identity.value) return
  details.value = submitted
  detailsNotice.value = ''
  workPermit.value = null

  checks.value = runComplianceChecks({ contractor: identity.value.contractor, organisation: identity.value.organisation, param: config.param })
  if (complianceFailures(checks.value).length) return deny('5A')

  // Reason C means work under an approved permit, so one must exist for this organisation at this building.
  if (reason.value === 'C') {
    const [permit] = findPermitsForAttendance({ permits: directory.permits.value, organisation: identity.value.organisation, contractor: identity.value.contractor, buildingId: submitted.building.id })
    if (!permit) {
      detailsNotice.value = 'No current permit was found for your organisation at this building. Choose another reason or contact the estates helpdesk.'
      return
    }
    workPermit.value = permit
  }

  const evaluated = evaluateWorkingWindow({ organisation: identity.value.organisation, contractor: identity.value.contractor, buildingId: submitted.building.id, permits: directory.permits.value, param: config.param })
  // Essential emergency work is admitted at any hour; the duty manager is notified instead (automation 00004900).
  windowResult.value = reason.value === 'B'
    ? { ...evaluated, allowed: true, basis: 'Emergency work', showFlexMessage: false, permit: undefined, denialCode: undefined }
    : evaluated
  if (!windowResult.value.allowed) return deny('5D')

  if (windowResult.value.showFlexMessage) {
    step.value = 'flex'
    return
  }
  proceedAfterWindow()
}

function proceedAfterWindow() {
  if (asbestosRequired.value) step.value = 'asbestos'
  else if (ramsRequired.value) step.value = 'rams'
  else openAccepted()
}

function afterAsbestos() {
  if (ramsRequired.value) step.value = 'rams'
  else openAccepted()
}

function openAccepted() {
  if (identity.value) {
    contact.mobile = identity.value.mobile
    contact.email = identity.value.email
  }
  step.value = 'accepted'
}

function confirmLogOn() {
  if (!identity.value || !details.value || !reason.value || !windowResult.value) return

  const record = logOnContractor({
    contractorId: identity.value.contractor?.id,
    organisationId: identity.value.organisation.id,
    name: identity.value.name,
    company: identity.value.organisation.name,
    mobile: contact.mobile.trim(),
    email: contact.email.trim(),
    buildingId: details.value.building.id,
    location: details.value.location,
    description: details.value.description,
    reason: reason.value,
    expectedLogOffAt: details.value.expectedLogOffAt,
    anonymous: identity.value.anonymous,
    workingWindowBasis: windowResult.value.basis,
    permitId: windowResult.value.permit?.id ?? workPermit.value?.id,
  })

  if (windowResult.value.permit) directory.setPermitStatus(windowResult.value.permit.id, 'Live')
  else if (workPermit.value?.status === 'Approved') directory.setPermitStatus(workPermit.value.id, 'Live')

  savedRecord.value = record
  step.value = 'complete'
  toast.success(`${record.name} logged on to ${record.buildingName}`)
}
</script>

<template>
  <AccessItKioskShell :title="titles[step].title" :subtitle="titles[step].subtitle" :steps="step === 'denied' ? [] : stepNames" :current-step="currentStepIndex">
    <AccessItContractorIdentifyStep v-if="step === 'identify'" :notice="identifyNotice" @identified="onIdentified" />

    <AccessItContractorAcknowledge v-else-if="step === 'confirm'" :code="reason === 'B' ? '2a' : '2'" @yes="step = 'details'" @no="declineAcceptance" />

    <AccessItContractorWorkDetails v-else-if="step === 'details' && identity" :identity="identity" :notice="detailsNotice" @submit="onDetails" />

    <AccessItContractorAcknowledge v-else-if="step === 'flex'" code="2A" tone="warning" :context="{ CoreHours: windowResult?.coreHours }" @yes="proceedAfterWindow" @no="restart" />

    <AccessItContractorAcknowledge v-else-if="step === 'asbestos'" code="3A" tone="warning" @yes="afterAsbestos" @no="deny('5B')" />

    <AccessItContractorAcknowledge v-else-if="step === 'rams'" code="3B" tone="warning" @yes="openAccepted" @no="deny('5C')" />

    <form v-else-if="step === 'accepted' && identity && details" class="space-y-7" @submit.prevent="confirmLogOn">
      <AccessItENoteCard code="4" tone="success" body-only />

      <div class="flex flex-wrap items-center gap-3 text-sm">
        <AccessItStatusPill v-if="workingWindowBadge" :label="workingWindowBadge.label" :tone="workingWindowBadge.tone" />
        <span class="text-slate-500">{{ identity.name }} · {{ identity.organisation.name }} · {{ details.building.name }}</span>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">Mobile number</span>
          <span class="relative block"><Phone class="pointer-events-none absolute left-3.5 top-3.5 size-5 text-slate-400" /><input v-model="contact.mobile" type="tel" required :class="inputClass" /></span>
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">Email address</span>
          <span class="relative block"><Mail class="pointer-events-none absolute left-3.5 top-3.5 size-5 text-slate-400" /><input v-model="contact.email" type="email" required :class="inputClass" /></span>
        </label>
      </div>

      <section class="space-y-3">
        <h2 class="flex items-center gap-2 text-sm font-semibold text-ink"><TriangleAlert class="size-4 text-amber-500" /> Potential conflicts at {{ details.building.name }}</h2>
        <ul v-if="conflicts.length" class="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/60">
          <li v-for="permit in conflicts" :key="permit.id" class="px-4 py-3 text-sm">
            <p class="font-medium text-ink"><span class="font-mono text-xs text-amber-800">{{ permit.reference }}</span> · {{ permit.organisationName }}</p>
            <p class="mt-0.5 text-slate-600">{{ permit.description }} <span class="text-xs text-slate-400">({{ permit.status }})</span></p>
          </li>
        </ul>
        <p v-else class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">No conflicting work recorded in this building.</p>
      </section>

      <button type="submit" class="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-soter-600 text-base font-semibold text-white shadow-sm transition hover:bg-soter-700 focus:outline-hidden focus:ring-3 focus:ring-soter-200"><CircleCheck class="size-5" /> OK, log me on</button>
    </form>

    <div v-else-if="step === 'complete' && savedRecord" class="space-y-7">
      <div class="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <span class="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><BadgeCheck class="size-6" /></span>
        <div>
          <p class="text-lg font-semibold text-emerald-900">Logged on at {{ formatTime(savedRecord.loggedOnAt) }}</p>
          <p class="text-sm text-emerald-800">You are now on the on-site list for {{ savedRecord.buildingName }}.</p>
        </div>
      </div>

      <dl class="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm sm:grid-cols-2">
        <div><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Name</dt><dd class="mt-1 font-medium text-ink">{{ savedRecord.name }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Company</dt><dd class="mt-1 font-medium text-ink">{{ savedRecord.company }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Building</dt><dd class="mt-1 font-medium text-ink">{{ savedRecord.buildingName }} · {{ savedRecord.locationOrHost }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Expected log off</dt><dd class="mt-1 font-medium text-ink">{{ formatDateTime(savedRecord.expectedLogOffAt) }}</dd></div>
        <div class="sm:col-span-2"><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Work</dt><dd class="mt-1 font-medium text-ink">{{ savedRecord.description }}</dd></div>
        <div v-if="savedPermit" class="sm:col-span-2"><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Permit</dt><dd class="mt-1 font-medium text-ink"><span class="font-mono text-xs text-soter-700">{{ savedPermit.reference }}</span> · {{ savedPermit.description }} <span class="text-xs font-normal text-slate-500">({{ savedPermit.status }})</span></dd></div>
      </dl>

      <p v-if="permitRequested" class="rounded-xl border border-soter-100 bg-soter-50 px-4 py-3 text-sm text-soter-700">Your permit request has been passed to the Permit to Work team.</p>

      <section class="space-y-2">
        <h2 class="text-sm font-semibold text-ink">Notifications</h2>
        <ul class="space-y-2">
          <li v-for="notification in notifications" :key="notification.runOrder" class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <MailCheck class="mt-0.5 size-4 shrink-0" :class="notification.active ? 'text-emerald-500' : 'text-slate-300'" />
            <span><span class="font-medium text-ink">Automation {{ notification.runOrder }}</span> <span class="text-slate-500">{{ notification.active ? 'sent to' : 'is inactive, not sent to' }} {{ notification.to }}</span></span>
          </li>
        </ul>
      </section>

      <NuxtLink to="/site-access" class="flex h-14 w-full items-center justify-center rounded-2xl bg-soter-600 text-base font-semibold text-white no-underline shadow-sm transition hover:bg-soter-700">Done</NuxtLink>
    </div>

    <AccessItContractorDenied v-else-if="step === 'denied'" :reason-code="denialCode" :checks="denialCode === '5A' ? checks : undefined" :core-hours="denialCode === '5D' ? windowResult?.coreHours : undefined" :flex-hours="denialCode === '5D' ? windowResult?.flexHours : undefined" @restart="restart" />
  </AccessItKioskShell>
</template>
