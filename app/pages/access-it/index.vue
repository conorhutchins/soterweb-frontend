<script setup lang="ts">
import { ArrowRight, Clock, ExternalLink, KeyRound, LogIn, LogOut, Mail, Send, Settings2, UserRoundCheck, Users, UsersRound } from '@lucide/vue'
import { clockIsSet, formatDateTime } from '~/lib/access-it/time'

const { contractorsOnSite, visitorsOnSite, onSiteOver24Hours, onSiteOverExpectedTime, sentEmails } = useSiteAttendance()
const { param } = useAccessItConfig()
const { contractors, organisations, organisationById } = useSiteDirectory()

const isSendListOpen = ref(false)

type TileTone = 'success' | 'warning' | 'danger' | 'neutral'

const tiles = computed<{ title: string, value: number, caption: string, tone: TileTone }[]>(() => [
  { title: 'Contractors on site', value: contractorsOnSite.value.length, caption: 'Logged on now', tone: contractorsOnSite.value.length > 0 ? 'warning' : 'neutral' },
  { title: 'Visitors on site', value: visitorsOnSite.value.length, caption: 'Signed in now', tone: 'success' },
  { title: 'On site over 24 hours', value: onSiteOver24Hours.value.length, caption: 'Probably forgot to log off', tone: onSiteOver24Hours.value.length > 0 ? 'danger' : 'success' },
  { title: 'Past expected log off', value: onSiteOverExpectedTime.value.length, caption: 'Still on site after their expected time', tone: onSiteOverExpectedTime.value.length > 0 ? 'danger' : 'success' },
])

const applications = [
  { title: 'Manage visitors', description: 'Pre-book visitors, register arrivals, print passes and mark departures.', to: '/access-it/visitors', icon: UserRoundCheck },
  { title: 'People on site', description: 'Every contractor and visitor currently on site, plus previous attendance.', to: '/access-it/people-on-site', icon: Users },
  { title: 'Log on contractors', description: 'Run the contractor log on journey from reception, with all compliance checks.', to: '/site-access/login', icon: LogIn },
  { title: 'Log off contractors', description: 'Log a contractor off site and capture asset register updates.', to: '/site-access/logout', icon: LogOut },
  { title: 'Visitors log on / log off', description: 'The self-service visitor route, as shown on a kiosk or tablet.', to: '/site-access/visitors', icon: UsersRound },
  { title: 'Module settings', description: 'System parameters, eNotes and email automations that shape the module.', to: '/access-it/settings', icon: Settings2 },
]

// What each demo account shows off. The public kiosk deliberately does not list these; they live behind sign-in.
const demoHints: Record<string, string> = {
  contractor1: 'Passes every check; PPM contractor for the Energy Centre assets',
  contractor2: 'Asbestos acknowledgement and permit conflicts; already on site',
  contractor3: 'Refused: insurance expired',
  contractor4: 'Refused: induction expired',
  contractor5: 'Out-of-hours approved organisation',
  contractor6: 'Refused: certificate expired',
  contractor7: 'Holds an out-of-hours permit at the Library',
  contractor8: 'Refused: RAMS expired',
  contractor9: 'On site over 24 hours',
}

const demoAccounts = computed(() => contractors.value.map((contractor) => ({
  username: contractor.username,
  password: contractor.password,
  name: `${contractor.firstName} ${contractor.lastName}`,
  organisation: organisationById(contractor.organisationId)?.name ?? '',
  hint: demoHints[contractor.username] ?? '',
})))

const companyCodes = computed(() => organisations.value.map((organisation) => `${organisation.code} (${organisation.name})`).join(', '))
const verificationCode = computed(() => param('Site Access Allow Anonymous Verification Code'))

const recentEmails = computed(() => [...sentEmails.value].sort((left, right) => right.sentAt.localeCompare(left.sentAt)).slice(0, 6))

const workingWindow = computed(() => {
  const coreStart = param('Site Access Check Core Hour START')
  const coreFinish = param('Site Access Check Core Hour FINISH')
  const flexStart = param('Site Access Check Core Hour START Flex')
  const flexFinish = param('Site Access Check Core Hour FINISH Flex')
  const active = clockIsSet(coreStart) && clockIsSet(coreFinish)
  return {
    active,
    core: active ? `${coreStart} to ${coreFinish}` : 'No time restrictions',
    flex: active ? `${clockIsSet(flexStart) ? flexStart : coreStart} to ${clockIsSet(flexFinish) ? flexFinish : coreFinish}` : 'Not applicable',
    maxStay: Number(param('Site Access Expected Logout Max Duration')) > 0 ? `${param('Site Access Expected Logout Max Duration')} hours` : 'Unlimited',
  }
})
</script>

<template>
  <AppShell>
    <div class="flex flex-col gap-8">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="mb-3 flex items-center gap-2 text-sm font-medium text-soter-600"><span class="size-2 rounded-full bg-soter-500" /> Module</div>
          <h1 class="text-3xl font-semibold tracking-tight text-ink">Access IT</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Who is on site, where they are working and what they are doing. A live picture of every contractor and visitor, the fire list in an emergency, and proof that only competent, insured contractors are admitted.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50" @click="isSendListOpen = true"><Send class="size-4 text-slate-500" /> Send list</button>
          <NuxtLink to="/site-access" target="_blank" class="inline-flex h-11 items-center gap-2 rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-soter-700">Open kiosk <ExternalLink class="size-4" /></NuxtLink>
        </div>
      </div>

      <section>
        <div class="mb-3 flex items-baseline justify-between gap-3">
          <h2 class="text-base font-semibold text-ink">Dashboard</h2>
          <p class="text-xs text-slate-500">Tiles use RAG indicators and turn red when items fall outside expected parameters.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AccessItDashboardTile v-for="tile in tiles" :key="tile.title" :title="tile.title" :value="tile.value" :caption="tile.caption" :tone="tile.tone" to="/access-it/people-on-site" />
        </div>
      </section>

      <section>
        <h2 class="mb-3 text-base font-semibold text-ink">Applications</h2>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <NuxtLink v-for="application in applications" :key="application.to" :to="application.to" class="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-soter-200 hover:shadow-md">
            <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-soter-50 text-soter-600"><component :is="application.icon" class="size-5" /></span>
            <span class="min-w-0">
              <span class="flex items-center gap-2 font-semibold text-ink">{{ application.title }} <ArrowRight class="size-4 text-soter-500 opacity-0 transition group-hover:opacity-100" /></span>
              <span class="mt-1 block text-sm leading-6 text-slate-500">{{ application.description }}</span>
            </span>
          </NuxtLink>
        </div>
      </section>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h2 class="flex items-center gap-2 text-base font-semibold text-ink"><Mail class="size-4 text-slate-400" /> Recent activity</h2>
            <NuxtLink to="/access-it/settings?tab=emails" class="text-sm font-medium text-soter-600 no-underline hover:underline">All sent emails</NuxtLink>
          </header>
          <ul v-if="recentEmails.length" class="divide-y divide-slate-100">
            <li v-for="email in recentEmails" :key="email.id" class="flex items-start justify-between gap-4 px-5 py-3.5">
              <div class="flex min-w-0 gap-3">
                <span class="mt-0.5 shrink-0 rounded-md bg-soter-50 px-2 py-1 font-mono text-[11px] font-semibold text-soter-700">{{ email.runOrder }}</span>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-ink">{{ email.subject }}</p>
                  <p class="truncate text-xs text-slate-500">To {{ email.to }}</p>
                </div>
              </div>
              <span class="shrink-0 whitespace-nowrap text-xs text-slate-500">{{ formatDateTime(email.sentAt) }}</span>
            </li>
          </ul>
          <p v-else class="px-5 py-10 text-center text-sm text-slate-500">No automations have fired yet.</p>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="flex items-center gap-2 text-base font-semibold text-ink"><Clock class="size-4 text-slate-400" /> Working window</h2>
          <dl class="mt-4 space-y-3 text-sm">
            <div class="flex items-center justify-between gap-3"><dt class="text-slate-500">Core hours</dt><dd class="font-medium text-ink">{{ workingWindow.core }}</dd></div>
            <div class="flex items-center justify-between gap-3"><dt class="text-slate-500">Flex period</dt><dd class="font-medium text-ink">{{ workingWindow.flex }}</dd></div>
            <div class="flex items-center justify-between gap-3"><dt class="text-slate-500">Maximum stay</dt><dd class="font-medium text-ink">{{ workingWindow.maxStay }}</dd></div>
          </dl>
          <p class="mt-4 text-xs leading-5 text-slate-500">{{ workingWindow.active ? 'Contractors logging on in the flex period are admitted with a reminder; outside it they are refused unless they hold an out of hours permit or belong to an approved organisation.' : 'Core hours are set to 00:00, so no time checks run at log on.' }}</p>
          <NuxtLink to="/access-it/settings" class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-soter-600 no-underline hover:underline">Change in settings <ArrowRight class="size-3.5" /></NuxtLink>
        </section>
      </div>

      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header class="border-b border-slate-100 px-5 py-4">
          <h2 class="flex items-center gap-2 text-base font-semibold text-ink"><KeyRound class="size-4 text-slate-400" /> Demo accounts for the kiosk</h2>
          <p class="mt-1 text-xs leading-5 text-slate-500">Every contractor account uses the password <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">demo</code>. Staff sign in as <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">Test</code> / <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">Leeds</code>. The public kiosk deliberately does not show any of this.</p>
        </header>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th scope="col" class="px-5 py-3 font-semibold">Username</th>
                <th scope="col" class="px-5 py-3 font-semibold">Operative</th>
                <th scope="col" class="px-5 py-3 font-semibold">Demonstrates</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="account in demoAccounts" :key="account.username">
                <td class="whitespace-nowrap px-5 py-2.5 font-mono text-xs font-medium text-soter-700">{{ account.username }}</td>
                <td class="px-5 py-2.5"><span class="font-medium text-ink">{{ account.name }}</span><span class="block text-xs text-slate-500">{{ account.organisation }}</span></td>
                <td class="px-5 py-2.5 text-slate-600">{{ account.hint }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <dl class="grid gap-3 border-t border-slate-100 px-5 py-4 text-sm sm:grid-cols-2">
          <div><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Anonymous verification code</dt><dd class="mt-1 font-mono text-xs font-medium text-soter-700">{{ verificationCode || 'Not set' }}</dd></div>
          <div><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Company codes</dt><dd class="mt-1 text-slate-600">{{ companyCodes }}</dd></div>
        </dl>
      </section>
    </div>

    <AccessItSendListDialog v-model:open="isSendListOpen" />
  </AppShell>
</template>
