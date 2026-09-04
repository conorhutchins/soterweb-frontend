<script setup lang="ts">
import { ArrowRight, KeyRound, LockKeyhole, LogOut, UserRound } from '@lucide/vue'
import type { AttendanceRecord, ContractorIdentity, LogOnReason } from '~/types/access-it'

const props = defineProps<{
  /** A short note shown above the form, for example after declining the acceptance message. */
  notice?: string
}>()

const emit = defineEmits<{ identified: [identity: ContractorIdentity, reason: LogOnReason] }>()

const directory = useSiteDirectory()
const config = useAccessItConfig()
const { activeContractorRecord, findOnSiteByContact } = useSiteAttendance()

const inputClass = 'h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100'
const iconInputClass = `${inputClass} pl-11`

const mode = ref<'account' | 'anonymous'>('account')
const credentials = reactive({ username: '', password: '' })
const anonymous = reactive({ name: '', mobile: '', email: '', verificationCode: '', companyCode: '', organisationId: '' })
const reason = ref<LogOnReason | null>(null)
const error = ref('')
const alreadyOnSite = ref<AttendanceRecord | null>(null)

const verificationMethod = computed(() => config.param('Site Access Allow Anonymous Verification Method'))
const needsVerificationCode = computed(() => verificationMethod.value === 'VC' || verificationMethod.value === 'VC-CC')
const needsCompanyCode = computed(() => verificationMethod.value === 'CC' || verificationMethod.value === 'VC-CC')
const needsOrganisationPick = computed(() => !needsCompanyCode.value)

watch(mode, () => {
  error.value = ''
  alreadyOnSite.value = null
})

function resolveAccount(): ContractorIdentity | null {
  const contractor = directory.findContractorByCredentials(credentials.username, credentials.password)
  if (!contractor) {
    error.value = 'Check your username and password, then try again.'
    return null
  }

  const organisation = directory.organisationById(contractor.organisationId)
  if (!organisation) {
    error.value = 'Your organisation record could not be found. Please speak to reception.'
    return null
  }

  const openRecord = activeContractorRecord(contractor.id)
  if (openRecord) {
    alreadyOnSite.value = openRecord
    return null
  }

  return { contractor, organisation, name: directory.contractorFullName(contractor), mobile: contractor.mobile, email: contractor.email, anonymous: false }
}

function resolveAnonymous(): ContractorIdentity | null {
  if (!anonymous.name.trim() || !anonymous.mobile.trim() || !anonymous.email.trim()) {
    error.value = 'Enter your name, mobile number and email address.'
    return null
  }

  if (needsVerificationCode.value && anonymous.verificationCode.trim().toUpperCase() !== config.param('Site Access Allow Anonymous Verification Code').toUpperCase()) {
    error.value = 'The verification code is not recognised. Ask reception for the current code.'
    return null
  }

  const organisation = needsCompanyCode.value
    ? directory.findOrganisationByCode(anonymous.companyCode)
    : directory.organisationById(Number(anonymous.organisationId))

  if (!organisation) {
    error.value = needsCompanyCode.value ? 'The company code is not recognised.' : 'Choose the organisation you are attending for.'
    return null
  }

  const openRecord = findOnSiteByContact(anonymous.mobile, anonymous.email, 'Contractor')
  if (openRecord) {
    alreadyOnSite.value = openRecord
    return null
  }

  return { contractor: null, organisation, name: anonymous.name.trim(), mobile: anonymous.mobile.trim(), email: anonymous.email.trim(), anonymous: true }
}

function submit() {
  error.value = ''
  alreadyOnSite.value = null

  if (!reason.value) {
    error.value = 'Choose the reason you are attending today.'
    return
  }

  const identity = mode.value === 'account' ? resolveAccount() : resolveAnonymous()
  if (identity) emit('identified', identity, reason.value)
}
</script>

<template>
  <form class="space-y-7" @submit.prevent="submit">
    <p v-if="props.notice" class="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{{ props.notice }}</p>

    <AccessItENoteCard code="1" />

    <div v-if="config.anonymousAccessAllowed.value" class="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="How you are logging on">
      <button type="button" role="radio" :aria-checked="mode === 'account'" class="h-10 rounded-lg text-sm font-medium transition" :class="mode === 'account' ? 'bg-white text-ink shadow-sm' : 'text-slate-600 hover:text-ink'" @click="mode = 'account'">I have an account</button>
      <button type="button" role="radio" :aria-checked="mode === 'anonymous'" class="h-10 rounded-lg text-sm font-medium transition" :class="mode === 'anonymous' ? 'bg-white text-ink shadow-sm' : 'text-slate-600 hover:text-ink'" @click="mode = 'anonymous'">I don't have an account</button>
    </div>

    <div v-if="mode === 'account'" class="grid gap-4 sm:grid-cols-2">
      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">Username</span>
        <span class="relative block"><UserRound class="pointer-events-none absolute left-3.5 top-3.5 size-5 text-slate-400" /><input v-model="credentials.username" type="text" autocomplete="username" placeholder="Your username" :class="iconInputClass" /></span>
      </label>
      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">Password</span>
        <span class="relative block"><LockKeyhole class="pointer-events-none absolute left-3.5 top-3.5 size-5 text-slate-400" /><input v-model="credentials.password" type="password" autocomplete="current-password" placeholder="Your password" :class="iconInputClass" /></span>
      </label>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <label class="block space-y-2 sm:col-span-2">
        <span class="text-sm font-medium text-slate-700">Full name</span>
        <input v-model="anonymous.name" type="text" autocomplete="name" placeholder="Your full name" :class="inputClass" />
      </label>
      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">Mobile number</span>
        <input v-model="anonymous.mobile" type="tel" autocomplete="tel" placeholder="07700 900000" :class="inputClass" />
      </label>
      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">Email address</span>
        <input v-model="anonymous.email" type="email" autocomplete="email" placeholder="you@company.co.uk" :class="inputClass" />
      </label>
      <label v-if="needsVerificationCode" class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">Verification code</span>
        <span class="relative block"><KeyRound class="pointer-events-none absolute left-3.5 top-3.5 size-5 text-slate-400" /><input v-model="anonymous.verificationCode" type="text" autocomplete="off" placeholder="Code from reception" class="uppercase" :class="iconInputClass" /></span>
      </label>
      <label v-if="needsCompanyCode" class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">Company code</span>
        <input v-model="anonymous.companyCode" type="text" autocomplete="organization" placeholder="e.g. AQUA" class="uppercase" :class="inputClass" />
      </label>
      <label v-if="needsOrganisationPick" class="block space-y-2" :class="{ 'sm:col-span-2': !needsVerificationCode }">
        <span class="text-sm font-medium text-slate-700">Organisation</span>
        <select v-model="anonymous.organisationId" :class="inputClass">
          <option value="" disabled>Choose your organisation</option>
          <option v-for="organisation in directory.organisations.value" :key="organisation.id" :value="String(organisation.id)">{{ organisation.name }}</option>
        </select>
      </label>
    </div>

    <fieldset class="space-y-3">
      <legend class="mb-3 text-sm font-medium text-slate-700">Reason for attendance</legend>
      <div class="space-y-2" role="radiogroup">
        <AccessItKioskChoice v-for="option in config.visibleLogOnReasons.value" :key="option.code" :label="option.label" :selected="reason === option.code" @select="reason = option.code" />
      </div>
    </fieldset>

    <div v-if="alreadyOnSite" class="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
      <p class="font-semibold">You are already logged on</p>
      <p class="mt-1">Our records show {{ alreadyOnSite.name }} logged on at {{ alreadyOnSite.buildingName }}. Log off first if you have left site.</p>
      <NuxtLink to="/site-access/logout" class="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-amber-900 no-underline shadow-sm transition hover:bg-amber-100"><LogOut class="size-4" /> Go to log off</NuxtLink>
    </div>

    <p v-if="error" role="alert" class="text-sm font-medium text-rose-600">{{ error }}</p>

    <button type="submit" class="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-soter-600 text-base font-semibold text-white shadow-sm transition hover:bg-soter-700 focus:outline-hidden focus:ring-3 focus:ring-soter-200">Continue <ArrowRight class="size-5" /></button>
  </form>
</template>
