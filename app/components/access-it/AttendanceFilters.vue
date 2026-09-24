<script setup lang="ts">
import { SlidersHorizontal, X } from '@lucide/vue'
import { emptyAttendanceFilters, type AttendanceFilters } from '~/lib/access-it/attendance-filters'
import type { AttendanceRecord } from '~/types/access-it'

const filters = defineModel<AttendanceFilters>({ required: true })
const props = defineProps<{ records: AttendanceRecord[], history: boolean }>()
const buildings = computed(() => [...new Map(props.records.map((record) => [String(record.buildingId), record.buildingName])).entries()].sort((a, b) => a[1].localeCompare(b[1])))
const companies = computed(() => [...new Set(props.records.map((record) => record.company))].sort())
const chips = computed(() => [
  { key: 'type' as const, label: filters.value.type },
  { key: 'building' as const, label: buildings.value.find(([id]) => id === filters.value.building)?.[1] ?? '' },
  { key: 'company' as const, label: filters.value.company },
  { key: 'attention' as const, label: filters.value.attention === 'overdue' ? 'Overdue' : filters.value.attention === '24h' ? 'Over 24 hours' : '' },
  { key: 'from' as const, label: filters.value.from ? `From ${filters.value.from}` : '' },
  { key: 'to' as const, label: filters.value.to ? `To ${filters.value.to}` : '' },
].filter((chip) => chip.label))
const inputClass = 'mt-1.5 h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-base outline-hidden focus:border-soter-500 focus:ring-2 focus:ring-soter-100 sm:text-sm'
</script>

<template>
  <div class="border-b border-slate-100 px-4 py-3 sm:px-5">
    <div class="flex flex-wrap items-center gap-3">
      <label class="min-w-48 flex-1"><span class="sr-only">Search attendance</span><input v-model="filters.search" type="search" placeholder="Search people, companies or places" class="h-11 w-full rounded-lg border border-slate-300 px-3 text-base outline-hidden focus:border-soter-500 focus:ring-2 focus:ring-soter-100 sm:text-sm" /></label>
      <button v-if="chips.length || filters.search" class="min-h-11 text-sm font-medium text-soter-700 underline-offset-4 hover:underline" @click="filters = emptyAttendanceFilters()">Clear filters</button>
    </div>
    <details class="mt-3">
      <summary class="flex min-h-9 cursor-pointer list-none items-center gap-2 text-sm font-medium text-slate-700"><SlidersHorizontal class="size-4" /> Filters<span v-if="chips.length" class="rounded-full bg-soter-50 px-2 text-soter-700">{{ chips.length }}</span></summary>
      <div class="grid gap-3 pb-2 pt-3 sm:grid-cols-2 lg:grid-cols-4">
        <label class="min-w-0 text-sm font-medium text-slate-700">Person type<select v-model="filters.type" :class="inputClass"><option value="">All people</option><option>Contractor</option><option>Visitor</option></select></label>
        <label class="min-w-0 text-sm font-medium text-slate-700">Building<select v-model="filters.building" :class="inputClass"><option value="">All buildings</option><option v-for="[id, name] in buildings" :key="id" :value="id">{{ name }}</option></select></label>
        <label class="min-w-0 text-sm font-medium text-slate-700">Company<select v-model="filters.company" :class="inputClass"><option value="">All companies</option><option v-for="company in companies" :key="company">{{ company }}</option></select></label>
        <label v-if="!history" class="min-w-0 text-sm font-medium text-slate-700">Attendance status<select v-model="filters.attention" :class="inputClass"><option value="">Any status</option><option value="overdue">Overdue departure</option><option value="24h">On site over 24 hours</option></select></label>
        <template v-if="history">
          <label class="min-w-0 text-sm font-medium text-slate-700">Attendance from<input v-model="filters.from" type="date" :class="inputClass" /></label>
          <label class="min-w-0 text-sm font-medium text-slate-700">Attendance to<input v-model="filters.to" type="date" :min="filters.from || undefined" :class="inputClass" /></label>
        </template>
      </div>
    </details>
    <p v-if="filters.from && filters.to && filters.from > filters.to" role="alert" class="mt-2 text-sm text-rose-700">The end date must be on or after the start date.</p>
    <div v-if="chips.length" class="mt-2 flex flex-wrap gap-2" aria-label="Active filters">
      <button v-for="chip in chips" :key="chip.key" :aria-label="`Remove filter: ${chip.label}`" class="inline-flex min-h-8 max-w-full items-center gap-2 rounded-full bg-soter-50 px-3 py-1 text-left text-xs font-medium text-soter-700" @click="filters[chip.key] = ''"><span class="break-words">{{ chip.label }}</span><X class="size-3 shrink-0" /></button>
    </div>
  </div>
</template>
