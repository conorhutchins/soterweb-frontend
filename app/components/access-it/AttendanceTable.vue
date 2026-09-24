<script setup lang="ts">
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useVueTable, type ColumnDef, type SortingState } from '@tanstack/vue-table'
import { ArrowDownUp, ChevronLeft, ChevronRight, Ellipsis, Eye, LogOut } from '@lucide/vue'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui'
import { Table } from '~/components/ui/table'
import { matchesAttendance, type AttendanceFilters } from '~/lib/access-it/attendance-filters'
import { describeDuration, formatDateTime } from '~/lib/access-it/time'
import type { AttendanceRecord } from '~/types/access-it'

const props = defineProps<{
  records: AttendanceRecord[]
  filterRecords: AttendanceRecord[]
  /** Previous attendance shows the logged off column instead of duration-to-now. */
  history: boolean
}>()

const emit = defineEmits<{
  view: [record: AttendanceRecord]
  logOff: [record: AttendanceRecord]
}>()

const { now, isPastExpectedLogOff, isOnSiteOver24Hours } = useSiteAttendance()

const filters = defineModel<AttendanceFilters>('filters', { required: true })
const sorting = ref<SortingState>([{ id: 'name', desc: false }])

const columns: ColumnDef<AttendanceRecord>[] = [
  { accessorKey: 'type', header: 'Type', enableSorting: false },
  { id: 'name', header: 'Name', accessorFn: (record) => `${record.name} ${record.company}` },
  { accessorKey: 'mobile', header: 'Mobile', enableSorting: false },
  { accessorKey: 'buildingName', header: 'Building' },
  { accessorKey: 'locationOrHost', header: 'Location / visiting', enableSorting: false },
  { accessorKey: 'description', header: 'Description', enableSorting: false },
  { accessorKey: 'loggedOnAt', header: 'Logged on' },
  { accessorKey: 'expectedLogOffAt', header: 'Expected log off', enableSorting: false },
  { id: 'duration', header: 'Duration', enableSorting: false },
  { id: 'actions', header: '', enableSorting: false },
]

const filteredRecords = computed(() => props.records.filter((record) => matchesAttendance(record, filters.value, now.value)))

const table = useVueTable({
  get data() { return filteredRecords.value },
  columns,
  state: {
    get sorting() { return sorting.value },
  },
  onSortingChange: (value) => { sorting.value = typeof value === 'function' ? value(sorting.value) : value },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: 8 } },
})

const visibleRows = computed(() => table.getRowModel().rows)
const totalResults = computed(() => table.getFilteredRowModel().rows.length)

watch([() => props.history, filters], () => table.setPageIndex(0), { deep: true })

function sortColumn(columnId: string) {
  table.getColumn(columnId)?.toggleSorting()
}

function sortDirection(columnId: string) {
  return table.getColumn(columnId)?.getIsSorted()
}

function columnLabel(columnId: string) {
  if (columnId === 'duration' && props.history) return 'Logged off'
  return columns.find((column) => ('accessorKey' in column && column.accessorKey === columnId) || column.id === columnId)?.header ?? ''
}

function duration(record: AttendanceRecord) {
  if (!record.loggedOnAt) return '—'
  return describeDuration(record.loggedOnAt, record.loggedOffAt ?? now.value.toISOString())
}
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <AccessItAttendanceFilters v-model="filters" :records="filterRecords" :history="history" />
    <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
      <p role="status" class="text-sm text-slate-600"><strong>{{ totalResults }}</strong> {{ totalResults === 1 ? 'record' : 'records' }} {{ history ? 'in attendance history' : 'on site' }}</p>
      <label class="flex items-center gap-2 text-sm text-slate-600 lg:hidden">Sort by<select :value="sorting[0]?.id ?? 'name'" class="h-9 rounded border border-slate-200 bg-white px-2" @change="table.setSorting([{ id: ($event.target as HTMLSelectElement).value, desc: false }])"><option value="name">Name</option><option value="buildingName">Building</option><option value="loggedOnAt">Arrival</option></select></label>
    </div>
    <ul class="divide-y divide-slate-100 lg:hidden" aria-label="Attendance records">
      <li v-for="row in visibleRows" :key="row.id" class="space-y-3 p-4">
        <div class="flex flex-wrap items-start justify-between gap-2"><div><h2 class="font-semibold text-ink">{{ row.original.name }}</h2><p class="mt-1 text-sm text-slate-600">{{ row.original.company }}</p></div><AccessItStatusPill :label="row.original.type" :tone="row.original.type === 'Contractor' ? 'info' : 'success'" /></div>
        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div><dt class="text-xs text-slate-500">Building</dt><dd class="mt-1 font-medium text-ink">{{ row.original.buildingName }}</dd></div>
          <div><dt class="text-xs text-slate-500">{{ history ? 'Departed' : 'Expected departure' }}</dt><dd class="mt-1 text-slate-700">{{ formatDateTime(history ? row.original.loggedOffAt : row.original.expectedLogOffAt) }}</dd></div>
        </dl>
        <div class="flex flex-wrap items-center gap-2"><AccessItStatusPill v-if="isPastExpectedLogOff(row.original)" label="Overdue" tone="danger" /><AccessItStatusPill v-if="isOnSiteOver24Hours(row.original)" label="Over 24 hours" tone="warning" /><span class="text-xs text-slate-500">{{ duration(row.original) }} on site</span></div>
        <div class="flex gap-3"><button :aria-label="`View details for ${row.original.name}`" class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-soter-700" @click="emit('view', row.original)"><Eye class="size-4" /> Details</button><button v-if="row.original.status === 'On site'" :aria-label="`Log off ${row.original.name}`" class="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-50" @click="emit('logOff', row.original)"><LogOut class="size-4" /> Log off</button></div>
      </li>
      <li v-if="!visibleRows.length" class="px-4 py-10 text-center text-sm text-slate-600">No attendance matches these filters.</li>
    </ul>
    <div class="hidden overflow-x-auto lg:block">
      <Table class="min-w-[1100px] border-collapse text-left">
        <thead class="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
          <tr>
            <th v-for="header in table.getFlatHeaders()" :key="header.id" scope="col" class="whitespace-nowrap px-4 py-3.5 font-semibold">
              <button v-if="header.column.getCanSort()" class="flex items-center gap-2 outline-hidden hover:text-soter-600 focus:text-soter-600" @click="sortColumn(header.column.id)">
                {{ columnLabel(header.column.id) }}
                <ArrowDownUp class="size-3.5" :class="sortDirection(header.column.id) ? 'text-soter-600' : 'text-slate-300'" />
              </button>
              <template v-else>{{ columnLabel(header.column.id) }}</template>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm">
          <tr v-for="row in visibleRows" :key="row.id" class="group align-top transition hover:bg-soter-50/60">
            <td class="px-4 py-3.5"><AccessItStatusPill :label="row.original.type" :tone="row.original.type === 'Contractor' ? 'info' : 'success'" /></td>
            <td class="min-w-52 px-4 py-3.5">
              <p class="font-medium text-ink">{{ row.original.name }}</p>
              <p class="mt-0.5 text-xs text-slate-500">{{ row.original.company }}</p>
            </td>
            <td class="whitespace-nowrap px-4 py-3.5 text-slate-600">{{ row.original.mobile }}</td>
            <td class="px-4 py-3.5 text-slate-700">{{ row.original.buildingName }}</td>
            <td class="px-4 py-3.5 text-slate-600">{{ row.original.locationOrHost }}</td>
            <td class="max-w-[240px] px-4 py-3.5 text-slate-600">{{ row.original.description }}</td>
            <td class="whitespace-nowrap px-4 py-3.5 text-slate-600">{{ formatDateTime(row.original.loggedOnAt) }}</td>
            <td class="whitespace-nowrap px-4 py-3.5 text-slate-600">
              <span class="flex items-center gap-2">{{ formatDateTime(row.original.expectedLogOffAt) }}<AccessItStatusPill v-if="isPastExpectedLogOff(row.original)" label="Overdue" tone="danger" /></span>
            </td>
            <td class="whitespace-nowrap px-4 py-3.5 text-slate-600">
              <span v-if="history">{{ formatDateTime(row.original.loggedOffAt) }}</span>
              <span v-else class="flex items-center gap-2">{{ duration(row.original) }}<AccessItStatusPill v-if="isOnSiteOver24Hours(row.original)" label="> 24h" tone="warning" /></span>
            </td>
            <td class="px-4 py-3.5 text-right">
              <DropdownMenuRoot>
                <DropdownMenuTrigger class="rounded-lg p-2 text-slate-400 outline-hidden transition hover:bg-white hover:text-slate-700 group-hover:bg-white/80"><Ellipsis class="size-4" /><span class="sr-only">Actions for {{ row.original.name }}</span></DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent class="z-50 min-w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg" :side-offset="6" align="end">
                    <DropdownMenuItem class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-hidden hover:bg-slate-50" @select="emit('view', row.original)"><Eye class="size-4 text-slate-500" /> View details</DropdownMenuItem>
                    <DropdownMenuItem v-if="row.original.status === 'On site'" class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-700 outline-hidden hover:bg-rose-50" @select="emit('logOff', row.original)"><LogOut class="size-4" /> Log off site</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenuRoot>
            </td>
          </tr>
          <tr v-if="visibleRows.length === 0">
            <td colspan="10" class="px-5 py-14 text-center text-sm text-slate-500">
              No attendance matches these filters.
            </td>
          </tr>
        </tbody>
      </Table>
    </div>

    <footer class="flex flex-col gap-3 border-t border-slate-100 px-5 py-3.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>Page <strong class="font-semibold text-slate-700">{{ table.getState().pagination.pageIndex + 1 }}</strong> of <strong class="font-semibold text-slate-700">{{ table.getPageCount() || 1 }}</strong></span>
      <div class="flex items-center gap-3">
        <span>{{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + (visibleRows.length ? 1 : 0) }}–{{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + visibleRows.length }} of {{ totalResults }}</span>
        <div class="flex gap-1">
          <button :disabled="!table.getCanPreviousPage()" class="rounded-lg border border-slate-200 p-1.5 text-slate-600 outline-hidden transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" @click="table.previousPage()"><ChevronLeft class="size-4" /><span class="sr-only">Previous page</span></button>
          <button :disabled="!table.getCanNextPage()" class="rounded-lg border border-slate-200 p-1.5 text-slate-600 outline-hidden transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" @click="table.nextPage()"><ChevronRight class="size-4" /><span class="sr-only">Next page</span></button>
        </div>
      </div>
    </footer>
  </section>
</template>
