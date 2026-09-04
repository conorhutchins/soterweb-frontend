<script setup lang="ts">
import { X } from '@lucide/vue'
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import type { VisitorInput } from '~/composables/useSiteAttendance'
import { fromDateTimeLocal, toDateTimeLocal } from '~/lib/access-it/time'
import { emptyVisitorForm, visitorFormFromRecord, visitorInputFromForm, visitorTimingErrors } from '~/lib/access-it/visitor-form'
import type { AttendanceRecord } from '~/types/access-it'

// Reception adds a visitor on arrival or pre-books one for later, and edits existing visits.
const props = defineProps<{
  open: boolean
  visitor?: AttendanceRecord | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [payload: { input: VisitorInput, arrived: boolean }]
}>()

const { activeBuildings, staffContacts } = useSiteDirectory()

const form = ref(emptyVisitorForm())
const buildingId = ref<number | ''>('')
const arrivalMode = ref<'now' | 'later'>('now')
const expectedArrivalAt = ref(nextHourLocal())
const timingErrors = ref<string[]>([])

const isEditing = computed(() => Boolean(props.visitor))
const showArrivalField = computed(() => isEditing.value ? props.visitor?.status === 'Expected' : arrivalMode.value === 'later')

function nextHourLocal() {
  const date = new Date()
  date.setHours(date.getHours() + 1, 0, 0, 0)
  return toDateTimeLocal(date.toISOString())
}

watch(
  () => [props.open, props.visitor] as const,
  () => {
    if (props.visitor) {
      form.value = visitorFormFromRecord(props.visitor)
      buildingId.value = props.visitor.buildingId
      arrivalMode.value = props.visitor.status === 'Expected' ? 'later' : 'now'
      expectedArrivalAt.value = props.visitor.expectedArrivalAt ? toDateTimeLocal(props.visitor.expectedArrivalAt) : nextHourLocal()
      timingErrors.value = []
      return
    }
    form.value = emptyVisitorForm()
    buildingId.value = ''
    arrivalMode.value = 'now'
    expectedArrivalAt.value = nextHourLocal()
    timingErrors.value = []
  },
  { immediate: true },
)

// A pre-booked visit should not be expected to end before it starts.
watch(expectedArrivalAt, (arrival) => {
  if (showArrivalField.value && form.value.expectedLogOffAt < arrival) {
    const logOff = new Date(fromDateTimeLocal(arrival))
    logOff.setHours(logOff.getHours() + 2)
    form.value.expectedLogOffAt = toDateTimeLocal(logOff.toISOString())
  }
})

function updateOpen(value: boolean) {
  emit('update:open', value)
}

function saveVisitor() {
  if (buildingId.value === '') return
  const arrived = isEditing.value ? props.visitor?.status !== 'Expected' : arrivalMode.value === 'now'
  timingErrors.value = visitorTimingErrors(form.value, showArrivalField.value ? { expectedArrivalAt: expectedArrivalAt.value } : {})
  if (timingErrors.value.length) return
  const arrivalIso = showArrivalField.value ? fromDateTimeLocal(expectedArrivalAt.value) : undefined
  emit('save', { input: visitorInputFromForm(form.value, buildingId.value, staffContacts.value, arrivalIso), arrived })
  updateOpen(false)
}

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100'
</script>

<template>
  <DialogRoot :open="open" @update:open="updateOpen">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]" />
      <DialogContent class="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-hidden sm:p-7">
        <div class="flex items-start justify-between gap-4">
          <div>
            <DialogTitle class="text-xl font-semibold tracking-tight text-ink">{{ isEditing ? 'Edit visitor' : 'Add visitor' }}</DialogTitle>
            <p class="mt-1.5 text-sm text-slate-500">{{ isEditing ? 'Update the details of this visit.' : 'Register a visitor on arrival, or pre-book one and email them an arrival link.' }}</p>
          </div>
          <DialogClose class="rounded-lg p-2 text-slate-400 outline-hidden hover:bg-slate-100 hover:text-slate-700"><X class="size-4" /><span class="sr-only">Close</span></DialogClose>
        </div>

        <form class="mt-6 space-y-5" @submit.prevent="saveVisitor">
          <div v-if="!isEditing" class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1" role="radiogroup" aria-label="Arrival">
            <button type="button" role="radio" :aria-checked="arrivalMode === 'now'" class="rounded-md px-4 py-1.5 text-sm font-medium transition" :class="arrivalMode === 'now' ? 'bg-white text-soter-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'" @click="arrivalMode = 'now'">Arrived now</button>
            <button type="button" role="radio" :aria-checked="arrivalMode === 'later'" class="rounded-md px-4 py-1.5 text-sm font-medium transition" :class="arrivalMode === 'later' ? 'bg-white text-soter-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'" @click="arrivalMode = 'later'">Pre-book</button>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-700">Building</span>
              <select v-model="buildingId" required :class="inputClass">
                <option value="" disabled>Choose a building</option>
                <option v-for="building in activeBuildings" :key="building.id" :value="building.id">{{ building.name }}</option>
              </select>
            </label>
            <label v-if="showArrivalField" class="space-y-2">
              <span class="text-sm font-medium text-slate-700">Expected arrival</span>
              <input v-model="expectedArrivalAt" required type="datetime-local" :class="inputClass" />
            </label>
          </div>

          <AccessItVisitorFields v-model="form" />

          <p v-if="!isEditing" class="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
            {{ arrivalMode === 'now' ? 'The visitor is emailed a digital pass (automation 00003990) and their host is notified they have arrived.' : 'The visitor is emailed an arrival link (automation 00004000). Using it on arrival records their presence and notifies their host.' }}
          </p>

          <ul v-if="timingErrors.length" role="alert" class="space-y-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <li v-for="error in timingErrors" :key="error">{{ error }}</li>
          </ul>

          <div class="flex justify-end gap-3">
            <DialogClose class="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Cancel</DialogClose>
            <button type="submit" class="h-10 rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-soter-700">{{ isEditing ? 'Save changes' : arrivalMode === 'now' ? 'Register arrival' : 'Pre-book visitor' }}</button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
