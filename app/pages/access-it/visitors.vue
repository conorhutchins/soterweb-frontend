<script setup lang="ts">
import { Download, FileDown, Plus, RefreshCw, Send, X } from '@lucide/vue'
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { toast } from 'vue-sonner'
import type { VisitorInput } from '~/composables/useSiteAttendance'
import { isoDate } from '~/lib/access-it/time'
import type { AttendanceRecord } from '~/types/access-it'

type VisitorFilter = 'Active' | 'Expected' | 'On site' | 'Departed' | 'All'

const { records, sentEmails, addVisitor, updateVisitor, deleteRecord, markArrived, markDeparted } = useSiteAttendance()

const filters: VisitorFilter[] = ['Active', 'Expected', 'On site', 'Departed', 'All']
const filter = ref<VisitorFilter>('Active')

const isDialogOpen = ref(false)
const selectedVisitor = ref<AttendanceRecord | null>(null)
const isPassOpen = ref(false)
const passVisitor = ref<AttendanceRecord | null>(null)
const isDeleteOpen = ref(false)
const pendingDelete = ref<AttendanceRecord | null>(null)
const isSendListOpen = ref(false)

const visitors = computed(() => records.value.filter((record) => record.type === 'Visitor'))
const filteredVisitors = computed(() => visitors.value.filter((visitor) => {
  if (filter.value === 'All') return true
  if (filter.value === 'Active') return visitor.status !== 'Departed'
  return visitor.status === filter.value
}))

const onSiteCount = computed(() => visitors.value.filter((visitor) => visitor.status === 'On site').length)
const expectedTodayCount = computed(() => {
  const today = isoDate(new Date())
  return visitors.value.filter((visitor) => visitor.status === 'Expected' && visitor.expectedArrivalAt && isoDate(new Date(visitor.expectedArrivalAt)) === today).length
})

function filterCount(candidate: VisitorFilter) {
  if (candidate === 'All') return visitors.value.length
  if (candidate === 'Active') return visitors.value.filter((visitor) => visitor.status !== 'Departed').length
  return visitors.value.filter((visitor) => visitor.status === candidate).length
}

/** Run a store action and describe which email automations it fired. */
function describeEmails(action: () => void) {
  const before = sentEmails.value.length
  action()
  const fired = sentEmails.value.slice(0, sentEmails.value.length - before)
  return fired.length ? fired.map((email) => `Email ${email.runOrder} sent to ${email.to}`).join(' · ') : 'No email automations were active for this action.'
}

function openCreateDialog() {
  selectedVisitor.value = null
  isDialogOpen.value = true
}

function openEditDialog(visitor: AttendanceRecord) {
  selectedVisitor.value = visitor
  isDialogOpen.value = true
}

function saveVisitor({ input, arrived }: { input: VisitorInput, arrived: boolean }) {
  if (selectedVisitor.value) {
    updateVisitor(selectedVisitor.value.id, input)
    toast.success('Visitor updated')
    return
  }

  const description = describeEmails(() => addVisitor(input, arrived))
  toast.success(arrived ? `${input.name} registered on site` : `${input.name} pre-booked`, { description })
}

function arriveVisitor(visitor: AttendanceRecord) {
  const description = describeEmails(() => markArrived(visitor.id))
  toast.success(`${visitor.name} marked as arrived`, { description })
}

function departVisitor(visitor: AttendanceRecord) {
  markDeparted(visitor.id)
  toast.success(`${visitor.name} marked as departed`)
}

function openPass(visitor: AttendanceRecord) {
  passVisitor.value = visitor
  isPassOpen.value = true
}

function confirmDelete(visitor: AttendanceRecord) {
  pendingDelete.value = visitor
  isDeleteOpen.value = true
}

function deleteVisitor() {
  if (!pendingDelete.value) return
  deleteRecord(pendingDelete.value.id)
  toast.success(`${pendingDelete.value.name} deleted`)
  pendingDelete.value = null
  isDeleteOpen.value = false
}

function showFutureIntegration(action: string) {
  toast.info(`${action} will connect to the SoterWeb API in the next phase.`)
}
</script>

<template>
  <AppShell>
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="mb-3 flex items-center gap-2 text-sm font-medium text-soter-600"><span class="size-2 rounded-full bg-soter-500" /> Access IT</div>
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><h1 class="text-3xl font-semibold tracking-tight text-ink">Manage visitors</h1><span class="text-sm text-slate-500">{{ onSiteCount }} on site · {{ expectedTodayCount }} expected today</span></div>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Pre-book visitors, register arrivals at the desk, print passes and issue the on-site list in an emergency.</p>
        </div>
        <button class="flex h-11 items-center justify-center gap-2 rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-soter-700 focus:outline-hidden focus:ring-3 focus:ring-soter-200" @click="openCreateDialog"><Plus class="size-4" /> Add visitor</button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50" @click="isSendListOpen = true"><Send class="size-4 text-slate-500" /> Send list</button>
        <button class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50" @click="showFutureIntegration('XLSX export')"><Download class="size-4 text-slate-500" /> Export XLSX</button>
        <button class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50" @click="showFutureIntegration('PDF export')"><FileDown class="size-4 text-slate-500" /> Export PDF</button>
        <button class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50" @click="showFutureIntegration('Refresh')"><RefreshCw class="size-4 text-slate-500" /> Refresh</button>
        <div class="ml-auto flex flex-wrap gap-1 rounded-lg bg-white p-1 shadow-xs" role="radiogroup" aria-label="Filter visitors">
          <button v-for="candidate in filters" :key="candidate" role="radio" :aria-checked="filter === candidate" class="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition" :class="filter === candidate ? 'bg-soter-100 text-soter-700' : 'text-slate-600 hover:bg-slate-50'" @click="filter = candidate">
            {{ candidate }} <span class="text-xs" :class="filter === candidate ? 'text-soter-600' : 'text-slate-400'">{{ filterCount(candidate) }}</span>
          </button>
        </div>
      </div>

      <AccessItVisitorsTable :visitors="filteredVisitors" @edit="openEditDialog" @arrived="arriveVisitor" @departed="departVisitor" @print="openPass" @remove="confirmDelete" />
    </div>

    <AccessItVisitorDialog v-model:open="isDialogOpen" :visitor="selectedVisitor" @save="saveVisitor" />
    <AccessItVisitorPassDialog v-model:open="isPassOpen" :record="passVisitor" />
    <AccessItSendListDialog v-model:open="isSendListOpen" />

    <DialogRoot :open="isDeleteOpen" @update:open="isDeleteOpen = $event">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]" />
        <DialogContent class="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-hidden">
          <div class="flex items-start justify-between gap-4">
            <div>
              <DialogTitle class="text-xl font-semibold tracking-tight text-ink">Delete visitor record</DialogTitle>
              <p class="mt-1.5 text-sm text-slate-500">This removes <strong class="font-semibold text-slate-700">{{ pendingDelete?.name }}</strong> from the visitor register entirely. It cannot be undone.</p>
            </div>
            <DialogClose class="rounded-lg p-2 text-slate-400 outline-hidden hover:bg-slate-100 hover:text-slate-700"><X class="size-4" /><span class="sr-only">Close</span></DialogClose>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <DialogClose class="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Cancel</DialogClose>
            <button type="button" class="h-10 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700" @click="deleteVisitor">Delete record</button>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </AppShell>
</template>
