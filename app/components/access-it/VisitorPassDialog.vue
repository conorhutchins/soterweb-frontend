<script setup lang="ts">
import { Printer, X } from '@lucide/vue'
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import type { AttendanceRecord } from '~/types/access-it'

// Preview and print a visitor's pass. A physical pass can be produced at the desk if desired.
defineProps<{
  open: boolean
  record: AttendanceRecord | null
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const PRINTING_CLASS = 'printing-visitor-pass'

function printPass() {
  if (!import.meta.client) return
  const finish = () => {
    document.body.classList.remove(PRINTING_CLASS)
    window.removeEventListener('afterprint', finish)
  }
  window.addEventListener('afterprint', finish)
  document.body.classList.add(PRINTING_CLASS)
  window.print()
  window.setTimeout(finish, 1500)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]" />
      <DialogContent class="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-hidden sm:p-7">
        <div class="flex items-start justify-between gap-4">
          <div>
            <DialogTitle class="text-xl font-semibold tracking-tight text-ink">Visitor pass</DialogTitle>
            <p class="mt-1.5 text-sm text-slate-500">Print a physical pass or let the visitor use the emailed one.</p>
          </div>
          <DialogClose class="rounded-lg p-2 text-slate-400 outline-hidden hover:bg-slate-100 hover:text-slate-700"><X class="size-4" /><span class="sr-only">Close</span></DialogClose>
        </div>

        <div v-if="record" class="mt-6 space-y-5">
          <AccessItENoteCard code="VP" />
          <AccessItVisitorPassCard :record="record" />
          <div class="flex justify-end gap-3">
            <DialogClose class="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Close</DialogClose>
            <button type="button" class="flex h-10 items-center gap-2 rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-soter-700" @click="printPass"><Printer class="size-4" /> Print pass</button>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>

  <Teleport v-if="open && record" to="body">
    <div class="visitor-pass-print"><AccessItVisitorPassCard :record="record" /></div>
  </Teleport>
</template>

<style>
.visitor-pass-print { display: none; }

@media print {
  body.printing-visitor-pass > *:not(.visitor-pass-print) { display: none !important; }
  body.printing-visitor-pass > .visitor-pass-print { display: block !important; padding: 2rem; }
}
</style>
