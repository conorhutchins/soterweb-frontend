<script setup lang="ts">
import { ArrowLeft, ArrowRight, CircleCheck, Link2, LogIn, LogOut, Mail, TriangleAlert } from '@lucide/vue'
import { formatDateTime } from '~/lib/access-it/time'
import { emptyVisitorForm, visitorInputFromForm } from '~/lib/access-it/visitor-form'
import type { AttendanceRecord, SentEmail } from '~/types/access-it'

// The self-service visitor route: reached from the kiosk holding screen and from the links in emailed passes.
definePageMeta({ layout: false })

type View = 'hub' | 'logon' | 'loggedOn' | 'logoff' | 'loggedOff' | 'notice'

const route = useRoute()
const router = useRouter()
const { visitorsCanSelfServe, paramIsYes, param } = useAccessItConfig()
const { activeBuildings, staffContacts } = useSiteDirectory()
const { sentEmails, visitorSelfLogOn, findVisitorOnSiteByContact, findByToken, markArrived, markDeparted, logOffPath } = useSiteAttendance()

const view = ref<View>('hub')
const logOnStep = ref(0)

const siteCodeRequired = computed(() => paramIsYes('Site Access User Site Code for Visitors'))
const logOutMethod = computed(() => param('Site Access Allow Visitors to LogOut Method'))
const siteCode = ref(generateCode())
const codeEntry = ref('')
const codeError = ref('')

const buildingId = ref<number | ''>('')
const form = ref(emptyVisitorForm())
const acceptedRecord = ref<AttendanceRecord | null>(null)
const firedEmails = ref<SentEmail[]>([])

const logOffMobile = ref('')
const logOffEmail = ref('')
const logOffError = ref('')

const notice = ref<{ title: string, body: string, tone: 'warning' | 'danger' | 'success' } | null>(null)

const steps = computed(() => {
  if (view.value === 'logon' || view.value === 'loggedOn') return ['Building', 'Your visit', 'Accepted']
  if (view.value === 'logoff' || view.value === 'loggedOff') return ['Your details', 'Logged off']
  return []
})

const currentStep = computed(() => {
  if (view.value === 'logon') return logOnStep.value
  if (view.value === 'loggedOn') return 2
  if (view.value === 'loggedOff') return 1
  return 0
})

const shellTitle = computed(() => ({
  hub: 'Visitors',
  logon: 'Log on to site',
  loggedOn: 'Login accepted',
  logoff: 'Log off site',
  loggedOff: 'Logout accepted',
  notice: notice.value?.title ?? 'Visitors',
})[view.value])

const shellSubtitle = computed(() => ({
  hub: 'Record your arrival so your host knows you are here, or log off when you leave.',
  logon: logOnStep.value === 0 ? 'Choose the building you are visiting.' : 'Tell us who you are and who you are visiting.',
  loggedOn: 'Your host has been notified and your digital pass is on its way.',
  logoff: 'Enter the details you gave when you arrived.',
  loggedOff: 'Your departure has been recorded.',
  notice: '',
})[view.value])

function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function refreshCode() {
  siteCode.value = generateCode()
  codeEntry.value = ''
  codeError.value = ''
}

function codeMatches() {
  if (!siteCodeRequired.value || codeEntry.value.trim() === siteCode.value) {
    codeError.value = ''
    return true
  }
  codeError.value = 'That code does not match. Try again, or show another code.'
  return false
}

function resetJourney() {
  logOnStep.value = 0
  buildingId.value = ''
  form.value = emptyVisitorForm()
  acceptedRecord.value = null
  firedEmails.value = []
  logOffMobile.value = ''
  logOffEmail.value = ''
  logOffError.value = ''
  notice.value = null
  refreshCode()
}

function startLogOn() {
  resetJourney()
  view.value = 'logon'
}

function startLogOff() {
  resetJourney()
  view.value = 'logoff'
}

function backToHub() {
  resetJourney()
  view.value = 'hub'
}

function continueToDetails() {
  if (buildingId.value === '' || !codeMatches()) return
  logOnStep.value = 1
}

/** Run a store action and capture the automations it fired, so the screen can show them. */
function capturingEmails(action: () => AttendanceRecord | null) {
  const before = sentEmails.value.length
  const record = action()
  firedEmails.value = sentEmails.value.slice(0, sentEmails.value.length - before)
  return record
}

function submitLogOn() {
  if (buildingId.value === '') return
  const input = visitorInputFromForm(form.value, buildingId.value, staffContacts.value)
  acceptedRecord.value = capturingEmails(() => visitorSelfLogOn(input))
  view.value = 'loggedOn'
}

function submitLogOff() {
  if (!codeMatches()) return
  const record = findVisitorOnSiteByContact(logOffMobile.value, logOffEmail.value)
  if (!record) {
    logOffError.value = 'We could not find anyone on site with those details. Check them and try again, or ask reception to log you off.'
    return
  }
  markDeparted(record.id)
  acceptedRecord.value = record
  view.value = 'loggedOff'
}

function showNotice(title: string, body: string, tone: 'warning' | 'danger' | 'success' = 'warning') {
  notice.value = { title, body, tone }
  view.value = 'notice'
}

/** Links in emailed passes carry a token: one click logs a visitor off, or records a pre-booked arrival. */
function handleTokens() {
  const logOffToken = typeof route.query.logoff === 'string' ? route.query.logoff : ''
  const arriveToken = typeof route.query.arrive === 'string' ? route.query.arrive : ''
  if (!logOffToken && !arriveToken) return

  const record = findByToken(logOffToken || arriveToken)
  router.replace({ query: {} })

  if (!record) {
    showNotice('We could not find that pass', 'The link may be out of date. Use the buttons below to log on or off, or ask reception for help.', 'danger')
    return
  }

  if (logOffToken) {
    if (record.status === 'On site') {
      markDeparted(record.id)
      acceptedRecord.value = record
      view.value = 'loggedOff'
      return
    }
    if (record.status === 'Departed') {
      showNotice('You have already logged off', `${record.name}, your departure from ${record.buildingName} was recorded at ${formatDateTime(record.loggedOffAt)}. There is nothing more to do.`, 'success')
      return
    }
    showNotice('You have not logged on yet', `${record.name}, your visit to ${record.buildingName} has not been recorded as started, so there is nothing to log off from.`)
    return
  }

  if (record.status === 'Expected') {
    acceptedRecord.value = capturingEmails(() => markArrived(record.id))
    view.value = 'loggedOn'
    return
  }
  if (record.status === 'On site') {
    showNotice('You are already logged on', `${record.name}, your arrival at ${record.buildingName} was recorded at ${formatDateTime(record.loggedOnAt)}. Go directly to meet your host.`, 'success')
    return
  }
  showNotice('This visit has ended', `${record.name}, this visit to ${record.buildingName} was completed at ${formatDateTime(record.loggedOffAt)}. Log on again below if you are back on site.`)
}

onMounted(handleTokens)
watch(() => [route.query.logoff, route.query.arrive], handleTokens)

function finish() {
  navigateTo('/site-access')
}

const inputClass = 'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100'
const primaryButtonClass = 'inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-soter-600 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-soter-700 focus:outline-hidden focus:ring-3 focus:ring-soter-200 disabled:cursor-not-allowed disabled:opacity-50'
const secondaryButtonClass = 'inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-base font-medium text-slate-700 transition hover:bg-slate-50'
</script>

<template>
  <AccessItKioskShell :title="shellTitle" :subtitle="shellSubtitle" :steps="steps" :current-step="currentStep">
    <!-- Self-service switched off -->
    <div v-if="view === 'hub' && !visitorsCanSelfServe" class="space-y-6">
      <div class="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <TriangleAlert class="mt-0.5 size-5 shrink-0" />
        <div>
          <p class="font-semibold">Self-service visitor sign-in is switched off</p>
          <p class="mt-1 text-sm leading-6">Please report to reception, where a member of staff will record your arrival and issue your pass. The system parameter Site Access Allow Visitors to LogIn controls this route.</p>
        </div>
      </div>
      <NuxtLink to="/site-access" :class="secondaryButtonClass"><ArrowLeft class="size-4" /> Back to start</NuxtLink>
    </div>

    <!-- Hub -->
    <div v-else-if="view === 'hub'" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2">
        <button type="button" class="group flex flex-col items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-6 text-left transition hover:border-soter-500 hover:bg-soter-50 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-soter-100" @click="startLogOn">
          <span class="flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><LogIn class="size-6" /></span>
          <span>
            <span class="block text-xl font-semibold text-ink">Log on to site</span>
            <span class="mt-1 block text-sm leading-6 text-slate-500">Record your arrival, notify your host and receive a digital pass.</span>
          </span>
        </button>
        <button type="button" class="group flex flex-col items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-6 text-left transition hover:border-soter-500 hover:bg-soter-50 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-soter-100" @click="startLogOff">
          <span class="flex size-12 items-center justify-center rounded-xl bg-rose-100 text-rose-700"><LogOut class="size-6" /></span>
          <span>
            <span class="block text-xl font-semibold text-ink">Log off site</span>
            <span class="mt-1 block text-sm leading-6 text-slate-500">Let us know you have left so you drop off the on-site list.</span>
          </span>
        </button>
      </div>
      <AccessItENoteCard code="V0" />
    </div>

    <!-- Log on: building and code -->
    <form v-else-if="view === 'logon' && logOnStep === 0" class="space-y-6" @submit.prevent="continueToDetails">
      <AccessItENoteCard code="V1" />
      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">Building</span>
        <select v-model="buildingId" required :class="inputClass">
          <option value="" disabled>Choose the building you are visiting</option>
          <option v-for="building in activeBuildings" :key="building.id" :value="building.id">{{ building.name }}</option>
        </select>
      </label>
      <AccessItVisitorSiteCode v-if="siteCodeRequired" v-model="codeEntry" :code="siteCode" :error="codeError" @refresh="refreshCode" />
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button type="button" :class="secondaryButtonClass" @click="backToHub"><ArrowLeft class="size-4" /> Back</button>
        <button type="submit" :class="primaryButtonClass">Continue <ArrowRight class="size-4" /></button>
      </div>
    </form>

    <!-- Log on: visit details -->
    <form v-else-if="view === 'logon'" class="space-y-6" @submit.prevent="submitLogOn">
      <AccessItENoteCard code="V2" />
      <AccessItVisitorFields v-model="form" />
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button type="button" :class="secondaryButtonClass" @click="logOnStep = 0"><ArrowLeft class="size-4" /> Back</button>
        <button type="submit" :class="primaryButtonClass">Log on <ArrowRight class="size-4" /></button>
      </div>
    </form>

    <!-- Login accepted -->
    <div v-else-if="view === 'loggedOn' && acceptedRecord" class="space-y-6">
      <div class="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
        <CircleCheck class="size-6 shrink-0 text-emerald-600" />
        <p class="text-sm leading-6"><span class="font-semibold">{{ acceptedRecord.name }}</span>, you are logged on at {{ acceptedRecord.buildingName }} as of {{ formatDateTime(acceptedRecord.loggedOnAt) }}.</p>
      </div>
      <AccessItENoteCard code="V3" tone="success" />
      <AccessItVisitorPassCard :record="acceptedRecord" />
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p class="flex items-center gap-2 text-sm font-semibold text-slate-700"><Mail class="size-4 text-slate-500" /> Emails sent</p>
        <ul v-if="firedEmails.length" class="mt-3 space-y-2 text-sm text-slate-600">
          <li v-for="email in firedEmails" :key="email.id" class="flex flex-wrap items-baseline gap-x-2"><span class="font-mono text-xs text-soter-700">{{ email.runOrder }}</span><span class="font-medium text-ink">{{ email.subject }}</span><span class="text-slate-500">to {{ email.to }}</span></li>
        </ul>
        <p v-else class="mt-2 text-sm text-slate-500">No email automations were active for this log on.</p>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <NuxtLink :to="logOffPath(acceptedRecord)" :class="secondaryButtonClass"><Link2 class="size-4" /> Log off link (from the email)</NuxtLink>
        <button type="button" :class="primaryButtonClass" @click="finish">Done <ArrowRight class="size-4" /></button>
      </div>
    </div>

    <!-- Log off -->
    <form v-else-if="view === 'logoff'" class="space-y-6" @submit.prevent="submitLogOff">
      <AccessItENoteCard code="V4" />
      <p v-if="logOutMethod !== 'MOB-EMAIL'" class="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">The {{ logOutMethod }} matching method is not available in this demo, so visitors are matched by mobile number and email address.</p>
      <div class="grid gap-5 sm:grid-cols-2">
        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Mobile number</span>
          <input v-model="logOffMobile" required type="tel" autocomplete="tel" placeholder="07700 900123" :class="inputClass" />
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Email address</span>
          <input v-model="logOffEmail" required type="email" autocomplete="email" placeholder="name@company.co.uk" :class="inputClass" />
        </label>
      </div>
      <AccessItVisitorSiteCode v-if="siteCodeRequired" v-model="codeEntry" :code="siteCode" :error="codeError" @refresh="refreshCode" />
      <p v-if="logOffError" role="alert" class="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{{ logOffError }}</p>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button type="button" :class="secondaryButtonClass" @click="backToHub"><ArrowLeft class="size-4" /> Back</button>
        <button type="submit" :class="primaryButtonClass">Log off <ArrowRight class="size-4" /></button>
      </div>
    </form>

    <!-- Logout accepted -->
    <div v-else-if="view === 'loggedOff' && acceptedRecord" class="space-y-6">
      <div class="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
        <CircleCheck class="size-6 shrink-0 text-emerald-600" />
        <p class="text-sm leading-6"><span class="font-semibold">{{ acceptedRecord.name }}</span>, your departure from {{ acceptedRecord.buildingName }} was recorded at {{ formatDateTime(acceptedRecord.loggedOffAt) }}. You are no longer on the on-site list.</p>
      </div>
      <AccessItENoteCard code="V5" tone="success" />
      <div class="flex justify-end">
        <button type="button" :class="primaryButtonClass" @click="finish">Done <ArrowRight class="size-4" /></button>
      </div>
    </div>

    <!-- Notices from emailed links -->
    <div v-else-if="view === 'notice' && notice" class="space-y-6">
      <div class="flex gap-4 rounded-2xl border p-5" :class="notice.tone === 'danger' ? 'border-rose-200 bg-rose-50 text-rose-900' : notice.tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'">
        <component :is="notice.tone === 'success' ? CircleCheck : TriangleAlert" class="mt-0.5 size-5 shrink-0" />
        <p class="text-sm leading-6">{{ notice.body }}</p>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button type="button" :class="secondaryButtonClass" @click="backToHub"><ArrowLeft class="size-4" /> Visitor options</button>
        <button type="button" :class="primaryButtonClass" @click="finish">Done <ArrowRight class="size-4" /></button>
      </div>
    </div>
  </AccessItKioskShell>
</template>
