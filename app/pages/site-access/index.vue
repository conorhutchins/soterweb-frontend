<script setup lang="ts">
import { ArrowRight, Clock, KeyRound, LogIn, LogOut, Users } from '@lucide/vue'
import { clockIsSet } from '~/lib/access-it/time'

definePageMeta({ layout: false })

const directory = useSiteDirectory()
const config = useAccessItConfig()

const { siteProfile } = directory

const coreStart = computed(() => config.param('Site Access Check Core Hour START'))
const coreFinish = computed(() => config.param('Site Access Check Core Hour FINISH'))
const flexStart = computed(() => config.param('Site Access Check Core Hour START Flex'))
const flexFinish = computed(() => config.param('Site Access Check Core Hour FINISH Flex'))

const workingWindow = computed(() => {
  if (!clockIsSet(coreStart.value) || !clockIsSet(coreFinish.value)) return null
  const outerStart = clockIsSet(flexStart.value) ? flexStart.value : coreStart.value
  const outerFinish = clockIsSet(flexFinish.value) ? flexFinish.value : coreFinish.value
  return { core: `${coreStart.value} to ${coreFinish.value}`, flex: `${outerStart} to ${outerFinish}` }
})

const actions = computed(() => [
  { title: 'Log on to site', description: 'Contractors: tell us why you are attending and where you will be working.', to: '/site-access/login', icon: LogIn, accent: 'bg-emerald-100 text-emerald-700' },
  { title: 'Log off site', description: 'Leaving? Close your attendance and update the asset register where required.', to: '/site-access/logout', icon: LogOut, accent: 'bg-rose-100 text-rose-700' },
  ...(config.visitorsCanSelfServe.value
    ? [{ title: 'Visitors', description: 'Record your arrival, notify your host and get a digital pass.', to: '/site-access/visitors', icon: Users, accent: 'bg-soter-100 text-soter-700' }]
    : []),
])

const demoHints: Record<string, string> = {
  contractor1: 'Fully compliant. PPM contractor for Energy Centre assets, so the asset register is offered at log off. Sees the RAMS acknowledgement.',
  contractor2: 'Asbestos acknowledgement in flagged buildings. Log on to Priory House to see conflicting permits.',
  contractor3: 'Refused: the organisation\'s insurance has expired.',
  contractor4: 'Refused: personal induction has expired.',
  contractor5: 'Organisation approved for out of hours work, so no time checks apply.',
  contractor6: 'Refused: operative certificate has expired.',
  contractor7: 'Holds an out of hours permit for the Library, so may log on outside core hours there.',
  contractor8: 'Refused: the organisation\'s RAMS have expired.',
}

const demoAccounts = computed(() => directory.contractors.value
  .filter((contractor) => demoHints[contractor.username])
  .map((contractor) => ({
    username: contractor.username,
    name: directory.contractorFullName(contractor),
    organisation: directory.organisationById(contractor.organisationId)?.name ?? '',
    hint: demoHints[contractor.username] ?? '',
  })))

const companyCodes = computed(() => directory.organisations.value.map((organisation) => organisation.code).join(', '))
const verificationCode = computed(() => config.param('Site Access Allow Anonymous Verification Code'))
const showDemoPanel = ref(false)
</script>

<template>
  <AccessItKioskShell wide>
    <div class="space-y-10">
      <header class="text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.12em] text-soter-600">{{ siteProfile.clientName }}</p>
        <h1 class="mt-2 text-4xl font-semibold tracking-tight text-ink">Welcome to {{ siteProfile.siteName }}</h1>
        <p class="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-500">Everyone attending site must record their arrival and departure so we can account for you in an emergency and confirm your work is authorised.</p>
      </header>

      <div class="grid gap-4 md:grid-cols-3" :class="{ 'md:grid-cols-2': actions.length === 2 }">
        <NuxtLink v-for="action in actions" :key="action.to" :to="action.to" class="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 no-underline shadow-xs transition hover:-translate-y-0.5 hover:border-soter-300 hover:shadow-md focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-soter-100">
          <span class="flex size-12 items-center justify-center rounded-xl" :class="action.accent"><component :is="action.icon" class="size-6" /></span>
          <span class="flex-1">
            <span class="block text-xl font-semibold text-ink">{{ action.title }}</span>
            <span class="mt-1.5 block text-sm leading-6 text-slate-500">{{ action.description }}</span>
          </span>
          <span class="flex items-center gap-1.5 text-sm font-semibold text-soter-600">Continue <ArrowRight class="size-4 transition group-hover:translate-x-0.5" /></span>
        </NuxtLink>
      </div>

      <div class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center">
        <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-soter-600 shadow-xs"><Clock class="size-5" /></span>
        <div v-if="workingWindow" class="grid flex-1 gap-3 text-sm sm:grid-cols-2">
          <p><span class="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Core working hours</span><span class="font-medium text-ink">{{ workingWindow.core }}</span></p>
          <p><span class="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Flex period</span><span class="font-medium text-ink">{{ workingWindow.flex }}</span> <span class="text-slate-500">(a reminder is shown)</span></p>
        </div>
        <p v-else class="flex-1 text-sm text-slate-600"><span class="font-medium text-ink">No time restrictions</span> apply to contractor attendance at this site.</p>
      </div>

      <section class="rounded-2xl border border-dashed border-slate-300 bg-white/60">
        <button type="button" class="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left text-sm font-medium text-slate-600 transition hover:text-ink" :aria-expanded="showDemoPanel" @click="showDemoPanel = !showDemoPanel">
          <span class="flex items-center gap-2"><KeyRound class="size-4 text-slate-400" /> Demo accounts for this proof of concept</span>
          <span class="text-xs text-slate-400">{{ showDemoPanel ? 'Hide' : 'Show' }}</span>
        </button>
        <div v-if="showDemoPanel" class="border-t border-slate-200 px-5 py-4">
          <p class="text-xs text-slate-500">Every account uses the password <strong class="font-semibold text-slate-700">demo</strong>. Anonymous log on accepts verification code <strong class="font-semibold text-slate-700">{{ verificationCode }}</strong> with company codes {{ companyCodes }}.</p>
          <ul class="mt-3 grid gap-2 sm:grid-cols-2">
            <li v-for="account in demoAccounts" :key="account.username" class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <p class="flex flex-wrap items-baseline gap-x-2"><code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-soter-700">{{ account.username }}</code><span class="font-medium text-ink">{{ account.name }}</span><span class="text-xs text-slate-400">{{ account.organisation }}</span></p>
              <p class="mt-1 text-xs leading-5 text-slate-500">{{ account.hint }}</p>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </AccessItKioskShell>
</template>
