<script setup lang="ts">
import { Download, FileDown, History, RefreshCw, Send, Users } from '@lucide/vue'
import { toast } from 'vue-sonner'
import type { AttendanceRecord } from '~/types/access-it'

const { records, onSite, markDeparted } = useSiteAttendance()

const showHistory = ref(false)
const isSendListOpen = ref(false)
const isDetailOpen = ref(false)
const selectedRecord = ref<AttendanceRecord | null>(null)

const previousAttendance = computed(() => records.value
  .filter((record) => record.status === 'Departed')
  .sort((left, right) => (right.loggedOffAt ?? '').localeCompare(left.loggedOffAt ?? '')))

const visibleRecords = computed(() => showHistory.value ? previousAttendance.value : onSite.value)

function viewRecord(record: AttendanceRecord) {
  selectedRecord.value = record
  isDetailOpen.value = true
}

function logOff(record: AttendanceRecord) {
  markDeparted(record.id)
  toast.success(`${record.name} logged off site`)
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
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><h1 class="text-3xl font-semibold tracking-tight text-ink">People on site</h1><span class="text-sm text-slate-500">{{ onSite.length }} on site</span></div>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Every contractor and visitor currently recorded as being on site. Switch to previous attendance to see who has been here before.</p>
        </div>
        <button class="flex h-11 items-center justify-center gap-2 rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-soter-700 focus:outline-hidden focus:ring-3 focus:ring-soter-200" @click="isSendListOpen = true"><Send class="size-4" /> Send list</button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50" @click="showFutureIntegration('XLSX export')"><Download class="size-4 text-slate-500" /> Export XLSX</button>
        <button class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50" @click="showFutureIntegration('PDF export')"><FileDown class="size-4 text-slate-500" /> Export PDF</button>
        <button class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50" @click="showFutureIntegration('Refresh')"><RefreshCw class="size-4 text-slate-500" /> Refresh</button>
        <div class="ml-auto inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs" role="radiogroup" aria-label="Which records to show">
          <button role="radio" :aria-checked="!showHistory" class="inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium transition" :class="!showHistory ? 'bg-soter-100 text-soter-700' : 'text-slate-600 hover:bg-slate-50'" @click="showHistory = false"><Users class="size-4" /> On site now</button>
          <button role="radio" :aria-checked="showHistory" class="inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium transition" :class="showHistory ? 'bg-soter-100 text-soter-700' : 'text-slate-600 hover:bg-slate-50'" @click="showHistory = true"><History class="size-4" /> Previous attendance</button>
        </div>
      </div>

      <AccessItAttendanceTable :records="visibleRecords" :history="showHistory" @view="viewRecord" @log-off="logOff" />
    </div>

    <AccessItAttendanceDetailDialog v-model:open="isDetailOpen" :record="selectedRecord" />
    <AccessItSendListDialog v-model:open="isSendListOpen" />
  </AppShell>
</template>
