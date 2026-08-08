<script setup lang="ts">
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useVueTable, type ColumnDef, type SortingState } from '@tanstack/vue-table'
import { ArrowDownUp, ChevronLeft, ChevronRight, Ellipsis, Eye, Pencil, Search, UserRoundCheck, UserRoundX } from '@lucide/vue'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui'
import { Table } from '~/components/ui/table'
import type { Organisation } from '~/types/organisation'

const props = defineProps<{
  organisations: Organisation[]
  activeOnly: boolean
}>()

const emit = defineEmits<{
  edit: [organisation: Organisation]
  deactivate: [organisation: Organisation]
}>()

const searchTerm = ref('')
const sorting = ref<SortingState>([])

const columns: ColumnDef<Organisation>[] = [
  { accessorKey: 'id', header: 'ID', cell: ({ row }) => `#${String(row.original.id).padStart(3, '0')}` },
  { accessorKey: 'code', header: 'Code' },
  { accessorKey: 'name', header: 'Organisation' },
  { accessorKey: 'telephone', header: 'Telephone' },
  { accessorKey: 'email', header: 'Email' },
  { id: 'status', header: 'Status', accessorFn: (organisation) => organisation.active ? 'Active' : 'Inactive' },
  { id: 'actions', header: '', enableSorting: false },
]

const filteredOrganisations = computed(() => props.organisations.filter((organisation) => !props.activeOnly || organisation.active))

const table = useVueTable({
  get data() { return filteredOrganisations.value },
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
  initialState: { pagination: { pageSize: 6 } },
})

const visibleOrganisations = computed(() => table.getRowModel().rows)
const totalResults = computed(() => table.getFilteredRowModel().rows.length)

function sortColumn(columnId: string) {
  table.getColumn(columnId)?.toggleSorting()
}

function sortDirection(columnId: string) {
  return table.getColumn(columnId)?.getIsSorted()
}

function columnLabel(columnId: string) {
  return columns.find((column) => ('accessorKey' in column && column.accessorKey === columnId) || column.id === columnId)?.header ?? ''
}
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative max-w-md flex-1">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input v-model="searchTerm" type="search" placeholder="Search organisations…" class="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:bg-white focus:ring-3 focus:ring-soter-100" />
      </div>
      <p class="text-sm text-slate-500"><span class="font-semibold text-slate-700">{{ totalResults }}</span> matching {{ totalResults === 1 ? 'organisation' : 'organisations' }}</p>
    </div>

    <Table class="min-w-[850px] border-collapse text-left">
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
        <tr v-for="row in visibleOrganisations" :key="row.id" class="group transition hover:bg-soter-50/60">
          <td class="px-5 py-4 font-mono text-xs text-slate-500">{{ row.original.id.toString().padStart(3, '0') }}</td>
          <td class="px-5 py-4 font-mono text-xs font-medium text-soter-700">{{ row.original.code }}</td>
          <td class="px-5 py-4 font-medium text-ink">{{ row.original.name }}</td>
          <td class="px-5 py-4 text-slate-600">{{ row.original.telephone }}</td>
          <td class="px-5 py-4 text-slate-600"><a :href="`mailto:${row.original.email}`" class="hover:text-soter-600 hover:underline">{{ row.original.email }}</a></td>
          <td class="px-5 py-4"><span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" :class="row.original.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"><span class="size-1.5 rounded-full" :class="row.original.active ? 'bg-emerald-500' : 'bg-slate-400'" />{{ row.original.active ? 'Active' : 'Inactive' }}</span></td>
          <td class="px-5 py-4 text-right">
            <DropdownMenuRoot>
              <DropdownMenuTrigger class="rounded-lg p-2 text-slate-400 outline-hidden transition hover:bg-white hover:text-slate-700 group-hover:bg-white/80"><Ellipsis class="size-4" /><span class="sr-only">Actions for {{ row.original.name }}</span></DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent class="z-50 min-w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg" :side-offset="6" align="end">
                  <DropdownMenuItem class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-hidden hover:bg-slate-50" @select="emit('edit', row.original)"><Eye class="size-4 text-slate-500" /> View</DropdownMenuItem>
                  <DropdownMenuItem class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-hidden hover:bg-slate-50" @select="emit('edit', row.original)"><Pencil class="size-4 text-slate-500" /> Edit</DropdownMenuItem>
                  <DropdownMenuItem v-if="row.original.active" class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-700 outline-hidden hover:bg-rose-50" @select="emit('deactivate', row.original)"><UserRoundX class="size-4" /> Deactivate</DropdownMenuItem>
                  <DropdownMenuItem v-else class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-emerald-700 outline-hidden hover:bg-emerald-50" @select="emit('edit', { ...row.original, active: true })"><UserRoundCheck class="size-4" /> Reactivate</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenuRoot>
          </td>
        </tr>
        <tr v-if="visibleOrganisations.length === 0"><td colspan="7" class="px-5 py-14 text-center text-sm text-slate-500">No organisations match your search.</td></tr>
      </tbody>
    </Table>

    <footer class="flex flex-col gap-3 border-t border-slate-100 px-5 py-3.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>Page <strong class="font-semibold text-slate-700">{{ table.getState().pagination.pageIndex + 1 }}</strong> of <strong class="font-semibold text-slate-700">{{ table.getPageCount() || 1 }}</strong></span>
      <div class="flex items-center gap-3">
        <span>{{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + (visibleOrganisations.length ? 1 : 0) }}–{{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + visibleOrganisations.length }} of {{ totalResults }}</span>
        <div class="flex gap-1">
          <button :disabled="!table.getCanPreviousPage()" class="rounded-lg border border-slate-200 p-1.5 text-slate-600 outline-hidden transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" @click="table.previousPage()"><ChevronLeft class="size-4" /><span class="sr-only">Previous page</span></button>
          <button :disabled="!table.getCanNextPage()" class="rounded-lg border border-slate-200 p-1.5 text-slate-600 outline-hidden transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" @click="table.nextPage()"><ChevronRight class="size-4" /><span class="sr-only">Next page</span></button>
        </div>
      </div>
    </footer>
  </section>
</template>
