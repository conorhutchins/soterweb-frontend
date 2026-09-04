<script setup lang="ts">
import { Pencil } from '@lucide/vue'
import { toast } from 'vue-sonner'
import type { ENote, ENoteGroup } from '~/types/access-it'

// The module's eNotes: every message a contractor or visitor sees, grouped by journey.
const { eNotes, updateENote, resetENote } = useAccessItConfig()

const groupOrder: { group: ENoteGroup, intro: string }[] = [
  { group: 'Log on', intro: 'eNotes 1 to 5E cover the contractor log on journey, including every access denied reason.' },
  { group: 'Log off', intro: 'eNotes 6 to 9 cover the contractor log off journey and the asset register question.' },
  { group: 'Visitors', intro: 'eNotes V0 to VP cover the visitor log on, log off and pass screens.' },
]

const groups = computed(() => groupOrder.map((entry) => ({ ...entry, notes: eNotes.value.filter((note) => note.group === entry.group) })))

const isDialogOpen = ref(false)
const selectedNote = ref<ENote | null>(null)

function edit(note: ENote) {
  selectedNote.value = note
  isDialogOpen.value = true
}

function save(changes: { title: string, body: string }) {
  if (!selectedNote.value) return
  updateENote(selectedNote.value.code, changes)
  toast.success(`eNote ${selectedNote.value.code} saved`)
}

function restore() {
  if (!selectedNote.value) return
  resetENote(selectedNote.value.code)
  toast.success(`eNote ${selectedNote.value.code} restored to default wording`)
  isDialogOpen.value = false
}

function truncate(text: string, length = 110) {
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text
}
</script>

<template>
  <div class="space-y-6">
    <section v-for="entry in groups" :key="entry.group" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header class="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <h2 class="text-base font-semibold text-ink">{{ entry.group }}</h2>
        <p class="mt-1 text-sm text-slate-500">{{ entry.intro }}</p>
      </header>
      <ul class="divide-y divide-slate-100">
        <li v-for="note in entry.notes" :key="note.code" class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex min-w-0 gap-4">
            <span class="flex h-8 min-w-10 shrink-0 items-center justify-center rounded-lg bg-soter-50 px-2 font-mono text-xs font-semibold text-soter-700">{{ note.code }}</span>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{{ note.screen }}</p>
              <p class="mt-1 font-medium text-ink">{{ note.title || 'Untitled' }}</p>
              <p class="mt-0.5 text-sm leading-6 text-slate-500">{{ truncate(note.body) }}</p>
            </div>
          </div>
          <button type="button" class="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50" @click="edit(note)"><Pencil class="size-4 text-slate-500" /> Edit</button>
        </li>
      </ul>
    </section>

    <AccessItENoteDialog v-model:open="isDialogOpen" :note="selectedNote" @save="save" @restore="restore" />
  </div>
</template>
