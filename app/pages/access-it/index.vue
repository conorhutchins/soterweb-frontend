<script setup lang="ts">
import { ArrowRight, ClipboardList, LogIn, LogOut, Send, UsersRound } from '@lucide/vue'
import { formatDateTime } from '~/lib/access-it/time'

const { records, contractorsOnSite, visitorsOnSite, onSiteOver24Hours, onSiteOverExpectedTime } = useSiteAttendance()
const isSendListOpen = ref(false)
const tiles = computed(() => [
  { title: 'Contractors on site', value: contractorsOnSite.value.length, caption: 'Currently recorded on site', tone: 'neutral' as const, to: '/access-it/people-on-site' },
  { title: 'Visitors on site', value: visitorsOnSite.value.length, caption: 'Currently recorded on site', tone: 'neutral' as const, to: '/access-it/people-on-site' },
  { title: 'Overdue departures', value: onSiteOverExpectedTime.value.length, caption: 'Past their expected departure', tone: onSiteOverExpectedTime.value.length ? 'danger' as const : 'success' as const, to: '/access-it/people-on-site' },
  { title: 'On site over 24 hours', value: onSiteOver24Hours.value.length, caption: 'Attendance needs checking', tone: onSiteOver24Hours.value.length ? 'warning' as const : 'success' as const, to: '/access-it/people-on-site' },
])
const actions = [
  { title: 'Manage visitors', description: 'Pre-book a visit or register an arrival.', to: '/access-it/visitors', icon: UsersRound },
  { title: 'Contractor arrival', description: 'Record attendance and work details.', to: '/site-access/login', icon: LogIn },
  { title: 'Contractor departure', description: 'Log off and update permits or assets.', to: '/site-access/logout', icon: LogOut },
]
const recentAttendance = computed(() => records.value.filter((record) => record.loggedOnAt)
  .map((record) => ({ ...record, activityAt: record.loggedOffAt ?? record.loggedOnAt }))
  .sort((a, b) => (b.activityAt ?? '').localeCompare(a.activityAt ?? '')).slice(0, 4))
</script>

<template>
  <AppShell>
    <div class="space-y-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div><p class="text-sm font-medium text-soter-700">Access IT</p><h1 class="mt-1 text-3xl font-semibold tracking-tight text-ink">Site overview</h1><p class="mt-2 text-sm text-slate-600">People, visits and attendance at a glance.</p></div>
        <button class="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50" @click="isSendListOpen = true"><Send class="size-4" /> Send site list</button>
      </header>
      <section aria-label="Current attendance" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AccessItDashboardTile v-for="tile in tiles" :key="tile.title" v-bind="tile" />
      </section>
      <section aria-label="Quick actions" class="grid gap-3 md:grid-cols-3">
        <NuxtLink v-for="action in actions" :key="action.to" :to="action.to" class="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 no-underline shadow-xs hover:border-soter-500">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-soter-50 text-soter-700"><component :is="action.icon" class="size-5" /></span>
          <span><span class="font-semibold text-ink">{{ action.title }}</span><span class="mt-1 block text-sm leading-6 text-slate-600">{{ action.description }}</span></span>
        </NuxtLink>
      </section>
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <header class="flex items-center justify-between gap-3 border-b border-slate-100 p-5"><h2 class="flex items-center gap-2 font-semibold text-ink"><ClipboardList class="size-4 text-slate-500" /> Recent attendance</h2><NuxtLink to="/access-it/people-on-site" class="inline-flex items-center gap-1 text-sm font-medium text-soter-700">View all <ArrowRight class="size-4" /></NuxtLink></header>
        <ul v-if="recentAttendance.length" class="divide-y divide-slate-100">
          <li v-for="record in recentAttendance" :key="record.id" class="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
            <div class="min-w-0"><p class="font-medium text-ink">{{ record.name }}</p><p class="mt-1 text-sm text-slate-600">{{ record.buildingName }} · {{ record.company }}</p></div>
            <div class="text-sm text-slate-600"><p class="font-medium" :class="record.status === 'Departed' ? 'text-slate-600' : 'text-soter-700'">{{ record.status === 'Departed' ? 'Departed' : 'Arrived' }}</p><p class="mt-1 text-xs">{{ formatDateTime(record.activityAt) }}</p></div>
          </li>
        </ul>
        <p v-else class="p-6 text-sm text-slate-500">No arrivals or departures recorded yet.</p>
      </section>
      <AccessItDemoGuide />
    </div>
    <AccessItSendListDialog v-model:open="isSendListOpen" />
  </AppShell>
</template>
