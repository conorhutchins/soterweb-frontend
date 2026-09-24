<script setup lang="ts">
import { ArrowRight, Clock, LogIn, LogOut, Users } from '@lucide/vue'
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
  { title: 'Log on to site', description: 'Contractor arrival and work details.', to: '/site-access/login', icon: LogIn, accent: 'bg-emerald-100 text-emerald-700' },
  { title: 'Log off site', description: 'Record your departure.', to: '/site-access/logout', icon: LogOut, accent: 'bg-rose-100 text-rose-700' },
  ...(config.visitorsCanSelfServe.value
    ? [{ title: 'Visitors', description: 'Visitor arrival or departure.', to: '/site-access/visitors', icon: Users, accent: 'bg-soter-100 text-soter-700' }]
    : []),
])

</script>

<template>
  <AccessItKioskShell wide>
    <div class="space-y-6">
      <header class="text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.12em] text-soter-600">{{ siteProfile.clientName }}</p>
        <h1 class="mt-2 text-2xl font-semibold sm:text-4xl tracking-tight text-ink">Welcome to {{ siteProfile.siteName }}</h1>
        <p class="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-500">Please record your arrival and departure.</p>
      </header>

      <div class="grid gap-3" :class="actions.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'">
        <NuxtLink v-for="action in actions" :key="action.to" :to="action.to" class="group flex items-center gap-3 md:flex-col md:items-start md:gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-6 no-underline shadow-xs transition hover:-translate-y-0.5 hover:border-soter-300 hover:shadow-md focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-soter-100">
          <span class="flex size-12 items-center justify-center rounded-xl" :class="action.accent"><component :is="action.icon" class="size-6" /></span>
          <span class="flex-1">
            <span class="block text-base font-semibold md:text-xl text-ink">{{ action.title }}</span>
            <span class="mt-1.5 block text-sm leading-6 text-slate-500">{{ action.description }}</span>
          </span>
          <span class="flex items-center gap-1.5 text-sm font-semibold text-soter-600"><span class="sr-only md:not-sr-only">Continue</span> <ArrowRight class="size-4 transition group-hover:translate-x-0.5" /></span>
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
    </div>
  </AccessItKioskShell>
</template>
