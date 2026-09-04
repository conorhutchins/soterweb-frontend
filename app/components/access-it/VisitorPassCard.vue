<script setup lang="ts">
import { formatDateTime } from '~/lib/access-it/time'
import type { AttendanceRecord } from '~/types/access-it'

// The digital visitor pass: emailed on arrival, shown on screen and printable at the desk.
const props = defineProps<{ record: AttendanceRecord }>()

const { siteProfile } = useSiteDirectory()

const rows = computed(() => [
  ['Name', props.record.name],
  ['Company', props.record.company],
  ['Visiting', props.record.locationOrHost],
  ['Reason for visit', props.record.description],
  ['Building', props.record.buildingName],
  ['Date', formatDateTime(props.record.loggedOnAt ?? props.record.expectedArrivalAt)],
])
</script>

<template>
  <div class="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm">
    <div class="bg-soter-600 px-5 py-4 text-white">
      <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-soter-100">Visitor pass</p>
      <p class="mt-1 text-lg font-semibold leading-tight">{{ siteProfile.clientName }}</p>
      <p class="text-xs text-soter-100">{{ siteProfile.siteName }}</p>
    </div>
    <dl class="divide-y divide-slate-100">
      <div v-for="[label, value] in rows" :key="label" class="flex items-baseline justify-between gap-4 px-5 py-2.5">
        <dt class="shrink-0 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">{{ label }}</dt>
        <dd class="text-right text-sm font-medium text-ink">{{ value || '—' }}</dd>
      </div>
    </dl>
    <p class="border-t border-dashed border-slate-200 px-5 py-3 text-center text-xs text-slate-500">Pass {{ record.passToken.toUpperCase() }} · Please log off when you leave.</p>
  </div>
</template>
