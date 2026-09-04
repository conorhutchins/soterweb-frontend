<script setup lang="ts">
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useVueTable, type ColumnDef, type SortingState } from '@tanstack/vue-table'
import { ArrowDownUp, ChevronLeft, ChevronRight, Ellipsis, LogIn, LogOut, Pencil, Printer, Search, Trash2 } from '@lucide/vue'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui'
import { Table } from '~/components/ui/table'
import { formatDateTime } from '~/lib/access-it/time'
import type { AttendanceRecord } from '~/types/access-it'

const props = defineProps<{
  visitors: AttendanceRecord[]
}>()

const emit = defineEmits<{
  edit: [visitor: AttendanceRecord]
  arrived: [visitor: AttendanceRecord]
  departed: [visitor: AttendanceRecord]
  print: [visitor: AttendanceRecord]
  remove: [visitor: AttendanceRecord]
}>()

const searchTerm = ref('')
const sorting = ref<SortingState>([])

function arrivalOf(visitor: AttendanceRecord) {
  return visitor.status === 'Expected' ? visitor.expectedArrivalAt ?? '' : visitor.loggedOnAt ?? ''
}

const columns: ColumnDef<AttendanceRecord>[] = [
  { id: 'status', header: 'Status', accessorFn: (visitor) => visitor.status, enableSorting: false },
  { id: 'name', header: 'Visitor', accessorFn: (visitor) => `${visitor.name} ${visitor.company}` },
  { id: 'host', header: 'Visiting', accessorFn: (visitor) => `${visitor.locationOrHost} ${visitor.hostEmail ?? ''}`, enableSorting: false },
  { id: 'building', header: 'Building', accessorFn: (visitor) => visitor.buildingName },
  { id: 'arrival', header: 'Arrival', accessorFn: arrivalOf },
  { id: 'expectedLogOff', header: 'Expected log off', accessorFn: (visitor) => visitor.expectedLogOffAt, enableSorting: false },
  { id: 'source', header: 'Source', accessorFn: (visitor) => visitor.source ?? '', enableSorting: false },
  { id: 'actions', header: '', enableSorting: false },
]

const table = useVueTable({
  get data() { return props.visitors },
  columns,
  state: {
    get globalFilter() { return searchTerm.value },
    get sorting() { return sorting.value },
  },
  onGlobalFilterChange: (value) => { searchTerm.value = value },
  onSortingChange: (value) => { sorting.value = typeof value === 'function' ? value(sorting.value) : value },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: 8 } },
})

const visibleRows = computed(() => table.getRowModel().rows)
const totalResults = computed(() => table.getFilteredRowModel().rows.length)

function sortColumn(columnId: string) {
  table.getColumn(columnId)?.toggleSorting()
}

function sortDirection(columnId: string) {
  return table.getColumn(columnId)?.getIsSorted()
}

function columnLabel(columnId: string) {
  return columns.find((column) => column.id === columnId)?.header ?? ''
}

function isOverdue(visitor: AttendanceRecord) {
  return visitor.status === 'On site' && new Date(visitor.expectedLogOffAt).getTime() < Date.now()
}

const statusTone: Record<AttendanceRecord['status'], 'info' | 'success' | 'neutral'> = {
  'Expected': 'info',
  'On site': 'success',
  'Departed': 'neutral',
}
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative max-w-md flex-1">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input v-model="searchTerm" type="search" placeholder="Search visitors, hosts or buildings…" class="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:bg-white focus:ring-3 focus:ring-soter-100" />
      </div>
      <p class="text-sm text-slate-500"><span class="font-semibold text-slate-700">{{ totalResults }}</span> matching {{ totalResults === 1 ? 'visitor' : 'visitors' }}</p>
    </div>

    <Table class="min-w-[1000px] border-collapse text-left">
      <thead class="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
        <tr>
          <th v-for="header in table.getFlatHeaders()" :key="header.id" scope="col" class="whitespace-nowrap px-5 py-3.5 font-semibold">
            <button v-if="header.column.getCanSort()" class="flex items-center gap-2 outline-hidden hover:text-soter-600 focus:text-soter-600" @click="sortColumn(header.column.id)">
              {{ columnLabel(header.column.id) }}
              <ArrowDownUp class="size-3.5" :class="sortDirection(header.column.id) ? 'text-soter-600' : 'text-slate-300'" />
            </button>
            <template v-else>{{ columnLabel(header.column.id) }}</template>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 text-sm">
        <tr v-for="row in visibleRows" :key="row.id" class="group transition hover:bg-soter-50/60">
          <td class="px-5 py-4">
            <div class="flex flex-wrap items-center gap-1.5">
              <AccessItStatusPill :label="row.original.status" :tone="statusTone[row.original.status]" />
              <AccessItStatusPill v-if="isOverdue(row.original)" label="Overdue" tone="danger" />
            </div>
          </td>
          <td class="min-w-52 px-5 py-4">
            <p class="font-medium text-ink">{{ row.original.name }}</p>
            <p class="text-xs text-slate-500">{{ row.original.company }}</p>
          </td>
          <td class="px-5 py-4">
            <p class="text-slate-700">{{ row.original.locationOrHost }}</p>
            <p v-if="row.original.hostEmail" class="text-xs text-slate-500">{{ row.original.hostEmail }}</p>
          </td>
          <td class="px-5 py-4 text-slate-600">{{ row.original.buildingName }}</td>
          <td class="px-5 py-4 whitespace-nowrap text-slate-600">
            <span v-if="row.original.status === 'Expected'" class="text-xs uppercase tracking-[0.06em] text-soter-700">Due </span>{{ formatDateTime(arrivalOf(row.original)) }}
          </td>
          <td class="px-5 py-4 whitespace-nowrap" :class="isOverdue(row.original) ? 'font-medium text-rose-700' : 'text-slate-600'">{{ formatDateTime(row.original.expectedLogOffAt) }}</td>
          <td class="px-5 py-4 text-slate-600">{{ row.original.source ?? '—' }}</td>
          <td class="px-5 py-4 text-right">
            <DropdownMenuRoot>
              <DropdownMenuTrigger class="rounded-lg p-2 text-slate-400 outline-hidden transition hover:bg-white hover:text-slate-700 group-hover:bg-white/80"><Ellipsis class="size-4" /><span class="sr-only">Actions for {{ row.original.name }}</span></DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent class="z-50 min-w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg" :side-offset="6" align="end">
                  <DropdownMenuItem class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-hidden hover:bg-slate-50" @select="emit('edit', row.original)"><Pencil class="size-4 text-slate-500" /> Edit</DropdownMenuItem>
                  <DropdownMenuItem v-if="row.original.status === 'Expected'" class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-emerald-700 outline-hidden hover:bg-emerald-50" @select="emit('arrived', row.original)"><LogIn class="size-4" /> Mark arrived</DropdownMenuItem>
                  <DropdownMenuItem v-if="row.original.status === 'On site'" class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-hidden hover:bg-slate-50" @select="emit('departed', row.original)"><LogOut class="size-4 text-slate-500" /> Mark departed</DropdownMenuItem>
                  <DropdownMenuItem class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-hidden hover:bg-slate-50" @select="emit('print', row.original)"><Printer class="size-4 text-slate-500" /> Print pass</DropdownMenuItem>
                  <DropdownMenuItem class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-700 outline-hidden hover:bg-rose-50" @select="emit('remove', row.original)"><Trash2 class="size-4" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenuRoot>
          </td>
        </tr>
        <tr v-if="visibleRows.length === 0"><td colspan="8" class="px-5 py-14 text-center text-sm text-slate-500">No visitors match this view.</td></tr>
      </tbody>
    </Table>

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
