<script setup lang="ts">
import { ArrowRight, BadgeCheck, LockKeyhole, LogOut, Mail, Phone, UserRound, Wrench } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { assetsEligibleForUpdate } from '~/lib/access-it/compliance'
import { LOG_OFF_OPTIONS } from '~/lib/access-it/config-defaults'
import { describeDuration, formatTime } from '~/lib/access-it/time'
import type { AssetActivity, AssetActivityType, AttendanceRecord, LogOffOption } from '~/types/access-it'

definePageMeta({ layout: false })

type Step = 'identify' | 'options' | 'assets' | 'done'

interface ActivityChoice {
  key: string
  label: string
  description: string
  type?: AssetActivityType
}

const ACTIVITY_CHOICES: ActivityChoice[] = [
  { key: 'none', label: 'Asset register not affected', description: 'Log off without recording any asset changes.' },
  { key: 'email', label: 'Register updated via scheduled email', description: 'Updates were sent separately to the estates team.' },
  { key: 'new', label: 'New asset installed', description: 'Add a new item to the register.', type: 'New asset installed' },
  { key: 'ppm', label: 'Carried out service / PPM visit', description: 'Record a planned maintenance visit.', type: 'PPM visit' },
  { key: 'replace', label: 'Replaced existing asset (with similar)', description: 'Close the old record and add the replacement.', type: 'Replaced asset' },
  { key: 'repair', label: 'Repaired existing asset', description: 'Record a repair and its condition after the work.', type: 'Repaired asset' },
  { key: 'remove', label: 'Removed existing asset (permanently)', description: 'Close the record so it no longer appears.', type: 'Removed asset' },
]

const route = useRoute()
const directory = useSiteDirectory()
const config = useAccessItConfig()
const attendance = useSiteAttendance()

const inputClass = 'h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 text-base outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100'

const step = ref<Step>('identify')
const mode = ref<'account' | 'anonymous'>('account')
const credentials = reactive({ username: '', password: '' })
const contact = reactive({ mobile: '', email: '' })
const error = ref('')
const notice = ref('')
const record = ref<AttendanceRecord | null>(null)
const chosenOption = ref<LogOffOption | null>(null)
const activityKey = ref('')
const activities = ref<AssetActivity[]>([])
const outcome = ref<AttendanceRecord | null>(null)
/** Set when an emailed link belongs to a visitor pass rather than a contractor record. */
const visitorPassToken = ref('')

const stepNames = computed(() => {
  const names = ['Identify', 'Leaving']
  if (assetStepApplies.value) names.push('Asset register')
  names.push('Done')
  return names
})
const stepLabels: Record<Step, string> = { identify: 'Identify', options: 'Leaving', assets: 'Asset register', done: 'Done' }
const currentStepIndex = computed(() => Math.max(0, stepNames.value.indexOf(stepLabels[step.value])))

const titles = computed<Record<Step, { title: string, subtitle: string }>>(() => ({
  identify: { title: 'Log off site', subtitle: 'Tell us who you are so we can close your attendance.' },
  options: { title: 'How are you leaving?', subtitle: 'Choose the option that applies to your visit today.' },
  assets: { title: 'Asset register', subtitle: 'Record the assets you worked on before you leave.' },
  done: { title: config.eNote('8').title || 'Logout accepted', subtitle: 'Thank you. Your attendance has been updated.' },
}))

const permits = computed(() => record.value ? attendance.permitsAffectedByLogOff(record.value) : [])
const permitReferences = computed(() => permits.value.map((permit) => permit.reference).join(', '))

const options = computed(() => config.visibleLogOffOptions.value.map((option) => {
  const needsPermit = option.permitAction !== 'none'
  return {
    ...option,
    disabled: needsPermit && permits.value.length === 0,
    description: needsPermit ? (permits.value.length ? `Applies to ${permitReferences.value}` : 'No current permit') : undefined,
  }
}))

const selectedOption = computed(() => LOG_OFF_OPTIONS.find((option) => option.code === chosenOption.value) ?? null)
const eligibleAssets = computed(() => record.value?.organisationId ? assetsEligibleForUpdate(directory.assets.value, record.value.organisationId, record.value.buildingId) : [])
const assetStepApplies = computed(() => config.paramIsYes('Site Access Update Asset Register on Log Out') && Boolean(selectedOption.value && !selectedOption.value.remainsOnSite) && eligibleAssets.value.length > 0)
const selectedActivity = computed(() => ACTIVITY_CHOICES.find((choice) => choice.key === activityKey.value) ?? null)

const durationOnSite = computed(() => outcome.value?.loggedOnAt ? describeDuration(outcome.value.loggedOnAt, outcome.value.loggedOffAt ?? new Date().toISOString()) : '')
const permitOutcome = computed(() => {
  const option = selectedOption.value
  if (!option || option.permitAction === 'none' || !permitReferences.value) return ''
  return `${option.permitAction === 'close' ? 'Closed' : 'Suspended'} permit ${permitReferences.value}.`
})

onMounted(() => {
  const token = route.query.token
  if (typeof token !== 'string') return
  const found = attendance.findByToken(token)
  if (found?.type === 'Contractor' && found.status === 'On site') {
    record.value = found
    step.value = 'options'
    return
  }
  if (found?.type === 'Visitor') {
    visitorPassToken.value = token
    notice.value = 'This link belongs to a visitor pass, so it is handled on the visitors screen.'
    return
  }
  notice.value = found ? 'That log off link has already been used, so the attendance record is closed.' : 'That log off link is not recognised. Identify yourself below instead.'
})

function identify() {
  error.value = ''
  let found: AttendanceRecord | null = null

  if (mode.value === 'account') {
    const contractor = directory.findContractorByCredentials(credentials.username, credentials.password)
    if (!contractor) {
      error.value = 'Check your username and password, then try again.'
      return
    }
    found = attendance.activeContractorRecord(contractor.id) ?? null
  }
  else {
    if (!contact.mobile.trim() || !contact.email.trim()) {
      error.value = 'Enter the mobile number and email address you gave when you logged on.'
      return
    }
    found = attendance.findOnSiteByContact(contact.mobile, contact.email, 'Contractor')
  }

  if (!found) {
    error.value = "We can't find you on the on-site list. If you logged on with different details, ask reception to log you off."
    return
  }

  record.value = found
  step.value = 'options'
}

function continueFromOptions() {
  error.value = ''
  if (!selectedOption.value) {
    error.value = 'Choose how you are leaving.'
    return
  }
  if (assetStepApplies.value) {
    step.value = 'assets'
    return
  }
  finish()
}

function chooseActivity(choice: ActivityChoice) {
  activityKey.value = choice.key
  // A non-activity choice discards anything recorded so far; the contractor then confirms with Log off site.
  if (!choice.type) activities.value = []
}

function addActivity(activity: AssetActivity) {
  activities.value.push(activity)
  toast.success(`${activity.type} recorded for ${activity.assetTag}`)
}

function finishWithActivity(activity: AssetActivity | null) {
  if (activity) activities.value.push(activity)
  finish()
}

function removeActivity(index: number) {
  activities.value.splice(index, 1)
}

function activityLabel(activity: AssetActivity) {
  return activity.type === 'New asset installed' ? `${activity.type} (based on ${activity.assetTag})` : `${activity.type}: ${activity.assetTag}`
}

function finish() {
  if (!record.value || !chosenOption.value) return
  outcome.value = attendance.logOffContractor(record.value.id, chosenOption.value, activities.value) ?? null
  step.value = 'done'
  toast.success(selectedOption.value?.remainsOnSite ? `${record.value.name} remains on site` : `${record.value.name} logged off`)
}
</script>

<template>
  <AccessItKioskShell :title="titles[step].title" :subtitle="titles[step].subtitle" :steps="stepNames" :current-step="currentStepIndex" :wide="step === 'assets'">
    <form v-if="step === 'identify'" class="space-y-7" @submit.prevent="identify">
      <p v-if="notice" class="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{{ notice }} <NuxtLink v-if="visitorPassToken" :to="`/site-access/visitors?logoff=${visitorPassToken}`" class="font-semibold text-amber-900 underline underline-offset-2">Log off as a visitor</NuxtLink></p>
      <AccessItENoteCard code="6" />

      <div v-if="config.anonymousAccessAllowed.value" class="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="How you logged on">
        <button type="button" role="radio" :aria-checked="mode === 'account'" class="min-h-11 rounded-lg px-2 py-2 text-sm font-medium leading-tight transition" :class="mode === 'account' ? 'bg-white text-ink shadow-sm' : 'text-slate-600 hover:text-ink'" @click="mode = 'account'">I have an account</button>
        <button type="button" role="radio" :aria-checked="mode === 'anonymous'" class="min-h-11 rounded-lg px-2 py-2 text-sm font-medium leading-tight transition" :class="mode === 'anonymous' ? 'bg-white text-ink shadow-sm' : 'text-slate-600 hover:text-ink'" @click="mode = 'anonymous'">I logged on without an account</button>
      </div>

      <div v-if="mode === 'account'" class="grid gap-4 sm:grid-cols-2">
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">Username</span>
          <span class="relative block"><UserRound class="pointer-events-none absolute left-3.5 top-3.5 size-5 text-slate-400" /><input v-model="credentials.username" type="text" autocomplete="username" placeholder="Your username" :class="inputClass" /></span>
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">Password</span>
          <span class="relative block"><LockKeyhole class="pointer-events-none absolute left-3.5 top-3.5 size-5 text-slate-400" /><input v-model="credentials.password" type="password" autocomplete="off" placeholder="Your password" :class="inputClass" /></span>
        </label>
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2">
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">Mobile number</span>
          <span class="relative block"><Phone class="pointer-events-none absolute left-3.5 top-3.5 size-5 text-slate-400" /><input v-model="contact.mobile" type="tel" autocomplete="tel" placeholder="As entered at log on" :class="inputClass" /></span>
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">Email address</span>
          <span class="relative block"><Mail class="pointer-events-none absolute left-3.5 top-3.5 size-5 text-slate-400" /><input v-model="contact.email" type="email" autocomplete="email" placeholder="As entered at log on" :class="inputClass" /></span>
        </label>
      </div>

      <p v-if="error" role="alert" class="text-sm font-medium text-rose-600">{{ error }}</p>

      <button type="submit" class="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-soter-600 text-base font-semibold text-white shadow-sm transition hover:bg-soter-700 focus:outline-hidden focus:ring-3 focus:ring-soter-200">Continue <ArrowRight class="size-5" /></button>
      <p class="text-center text-sm text-slate-500">Need to log on instead? <NuxtLink to="/site-access/login" class="font-medium text-soter-600 hover:underline">Go to log on</NuxtLink></p>
    </form>

    <form v-else-if="step === 'options' && record" class="space-y-7" @submit.prevent="continueFromOptions">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm">
        <p class="font-semibold text-ink">{{ record.name }} · {{ record.company }}</p>
        <p class="mt-0.5 text-slate-500">On site at {{ record.buildingName }} since {{ formatTime(record.loggedOnAt) }} · {{ record.description }}</p>
      </div>
      <AccessItENoteCard code="7" />
      <div class="space-y-2" role="radiogroup" aria-label="Log off options">
        <AccessItKioskChoice v-for="option in options" :key="option.code" :label="option.label" :description="option.description" :selected="chosenOption === option.code" :disabled="option.disabled" @select="chosenOption = option.code" />
      </div>
      <p v-if="error" role="alert" class="text-sm font-medium text-rose-600">{{ error }}</p>
      <button type="submit" class="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-soter-600 text-base font-semibold text-white shadow-sm transition hover:bg-soter-700 focus:outline-hidden focus:ring-3 focus:ring-soter-200">Continue <ArrowRight class="size-5" /></button>
    </form>

    <div v-else-if="step === 'assets' && record" class="space-y-7">
      <AccessItENoteCard code="7a" />

      <div v-if="activities.length" class="space-y-2">
        <p class="text-sm font-semibold text-ink">Recorded this visit</p>
        <ul class="flex flex-wrap gap-2">
          <li v-for="(activity, index) in activities" :key="`${activity.assetTag}-${index}`" class="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 py-1 pl-3 pr-1.5 text-xs font-medium text-emerald-800">
            <Wrench class="size-3.5" /> {{ activityLabel(activity) }}
            <button type="button" class="rounded-full px-1.5 py-0.5 text-emerald-700 transition hover:bg-emerald-100" @click="removeActivity(index)"><span class="sr-only">Remove</span>×</button>
          </li>
        </ul>
      </div>

      <div class="space-y-2" role="radiogroup" aria-label="Asset register activity">
        <AccessItKioskChoice v-for="choice in ACTIVITY_CHOICES" :key="choice.key" :label="choice.label" :description="choice.description" :selected="activityKey === choice.key" @select="chooseActivity(choice)" />
      </div>

      <div v-if="selectedActivity?.type" class="space-y-3 border-t border-slate-100 pt-7">
        <h2 class="text-base font-semibold text-ink">{{ selectedActivity.label }}</h2>
        <AccessItAssetActivityForm :key="selectedActivity.key" :assets="eligibleAssets" :type="selectedActivity.type" @next="addActivity" @finish="finishWithActivity" />
      </div>

      <div v-else-if="selectedActivity" class="space-y-4 border-t border-slate-100 pt-7">
        <p class="text-sm text-slate-600">No asset register changes will be recorded for this visit.</p>
        <button type="button" class="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-soter-600 text-base font-semibold text-white shadow-sm transition hover:bg-soter-700 focus:outline-hidden focus:ring-3 focus:ring-soter-200" @click="finish"><LogOut class="size-5" /> Log off site</button>
      </div>
    </div>

    <div v-else-if="step === 'done' && outcome" class="space-y-7">
      <div class="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <span class="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><BadgeCheck class="size-6" /></span>
        <div>
          <p class="text-lg font-semibold text-emerald-900">{{ selectedOption?.remainsOnSite ? 'You remain on site' : `Logged off at ${formatTime(outcome.loggedOffAt)}` }}</p>
          <p class="text-sm text-emerald-800">{{ selectedOption?.remainsOnSite ? 'Your attendance stays open on the on-site list.' : `Time on site: ${durationOnSite}.` }}</p>
        </div>
      </div>

      <AccessItENoteCard code="8" tone="success" body-only />
      <AccessItENoteCard code="9" />

      <dl class="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm sm:grid-cols-2">
        <div><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Name</dt><dd class="mt-1 font-medium text-ink">{{ outcome.name }} · {{ outcome.company }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Building</dt><dd class="mt-1 font-medium text-ink">{{ outcome.buildingName }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Option chosen</dt><dd class="mt-1 font-medium text-ink">{{ selectedOption?.label }}</dd></div>
        <div v-if="permitOutcome"><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Permit</dt><dd class="mt-1 font-medium text-ink">{{ permitOutcome }}</dd></div>
      </dl>

      <section v-if="activities.length" class="space-y-2">
        <h2 class="text-sm font-semibold text-ink">Asset register updates</h2>
        <ul class="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <li v-for="(activity, index) in activities" :key="`${activity.assetTag}-${index}`" class="px-4 py-3 text-sm">
            <p class="font-medium text-ink">{{ activityLabel(activity) }}</p>
            <p class="mt-0.5 text-slate-500">{{ activity.notes }}<span v-if="activity.type !== 'Removed asset'"> · {{ activity.serviceConditionRating }}, {{ activity.conditionStatus }}</span><span v-if="activity.certificateFileName"> · {{ activity.certificateFileName }}</span></p>
          </li>
        </ul>
      </section>

      <NuxtLink to="/site-access" class="flex h-14 w-full items-center justify-center rounded-2xl bg-soter-600 text-base font-semibold text-white no-underline shadow-sm transition hover:bg-soter-700">Done</NuxtLink>
    </div>
  </AccessItKioskShell>
</template>
