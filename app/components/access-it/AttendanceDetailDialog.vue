<script setup lang="ts">
import { Paperclip, X } from '@lucide/vue'
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { LOG_OFF_OPTIONS, LOG_ON_REASONS } from '~/lib/access-it/config-defaults'
import { describeDuration, formatDateTime } from '~/lib/access-it/time'
import type { AttendanceRecord } from '~/types/access-it'

// Read-only view of one attendance record, including any asset register updates captured at log off.
const props = defineProps<{
  open: boolean
  record: AttendanceRecord | null
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const statusTone = computed(() => {
  if (props.record?.status === 'On site') return 'success'
  if (props.record?.status === 'Expected') return 'warning'
  return 'neutral'
})

const reasonLabel = computed(() => LOG_ON_REASONS.find((reason) => reason.code === props.record?.reason)?.label ?? '—')
const logOffOptionLabel = computed(() => LOG_OFF_OPTIONS.find((option) => option.code === props.record?.logOffOption)?.label ?? '—')

const duration = computed(() => {
  if (!props.record?.loggedOnAt) return '—'
  return describeDuration(props.record.loggedOnAt, props.record.loggedOffAt ?? new Date().toISOString())
})

const details = computed(() => {
  const record = props.record
  if (!record) return []
  const rows: { label: string, value: string }[] = [
    { label: 'Company', value: record.company },
    { label: 'Mobile', value: record.mobile },
    { label: 'Email', value: record.email },
    { label: 'Building', value: record.buildingName },
    { label: record.type === 'Visitor' ? 'Visiting' : 'Location', value: record.locationOrHost },
    { label: 'Description', value: record.description },
    { label: 'Logged on', value: formatDateTime(record.loggedOnAt) },
    { label: 'Expected log off', value: formatDateTime(record.expectedLogOffAt) },
    { label: 'Logged off', value: formatDateTime(record.loggedOffAt) },
    { label: 'Time on site', value: duration.value },
  ]

  if (record.type === 'Contractor') {
    rows.push(
      { label: 'Reason for attendance', value: reasonLabel.value },
      { label: 'Working window', value: record.workingWindowBasis ?? '—' },
      { label: 'Account', value: record.anonymous ? 'Anonymous log on' : 'SOTERweb account' },
      { label: 'Log off option', value: logOffOptionLabel.value },
    )
  }
  else {
    rows.push(
      { label: 'Source', value: record.source ?? '—' },
      { label: 'Expected arrival', value: formatDateTime(record.expectedArrivalAt) },
      { label: 'Host email', value: record.hostEmail || '—' },
      { label: 'Vehicle registration', value: record.vehicleReg || '—' },
    )
  }

  return rows
})
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]" />
      <DialogContent class="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-hidden sm:p-7">
        <div v-if="record" class="flex items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <DialogTitle class="text-xl font-semibold tracking-tight text-ink">{{ record.name }}</DialogTitle>
              <AccessItStatusPill :label="record.type" :tone="record.type === 'Contractor' ? 'info' : 'success'" />
              <AccessItStatusPill :label="record.status" :tone="statusTone" />
            </div>
            <DialogDescription class="mt-1.5 text-sm text-slate-500">Attendance record #{{ String(record.id).padStart(4, '0') }}</DialogDescription>
          </div>
          <DialogClose class="rounded-lg p-2 text-slate-400 outline-hidden hover:bg-slate-100 hover:text-slate-700"><X class="size-4" /><span class="sr-only">Close</span></DialogClose>
        </div>

        <dl v-if="record" class="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <div v-for="detail in details" :key="detail.label">
            <dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{{ detail.label }}</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ detail.value || '—' }}</dd>
          </div>
        </dl>

        <section v-if="record?.assetActivities?.length" class="mt-7">
          <h3 class="text-sm font-semibold text-ink">Asset register updates</h3>
          <p class="mt-1 text-xs text-slate-500">Captured as the contractor left site.</p>
          <ul class="mt-3 space-y-3">
            <li v-for="(activity, index) in record.assetActivities" :key="index" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="font-medium text-ink">{{ activity.type }} <span class="font-mono text-xs text-soter-700">{{ activity.assetTag }}</span></p>
                <span class="text-xs text-slate-500">{{ activity.serviceConditionRating }} · {{ activity.conditionStatus }}</span>
              </div>
              <p class="mt-1 text-sm text-slate-700">{{ activity.description }}<span v-if="activity.location" class="text-slate-500"> · {{ activity.location }}</span></p>
              <p v-if="activity.notes" class="mt-2 text-sm leading-6 text-slate-600">{{ activity.notes }}</p>
              <p v-if="activity.certificateFileName || activity.photoFileName" class="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                <span v-if="activity.certificateFileName" class="flex items-center gap-1"><Paperclip class="size-3.5" /> {{ activity.certificateFileName }}</span>
                <span v-if="activity.photoFileName" class="flex items-center gap-1"><Paperclip class="size-3.5" /> {{ activity.photoFileName }}</span>
              </p>
            </li>
          </ul>
        </section>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
