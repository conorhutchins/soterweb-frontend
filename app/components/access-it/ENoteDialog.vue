<script setup lang="ts">
import { RotateCcw, X } from '@lucide/vue'
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { placeholdersIn } from '~/lib/access-it/templates'
import type { ENote } from '~/types/access-it'

// Edit the wording of one eNote. Placeholders in square brackets are filled by the system and must be kept.
const props = defineProps<{
  open: boolean
  note: ENote | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [changes: { title: string, body: string }]
  'restore': []
}>()

const form = reactive({ title: '', body: '' })

watch(() => [props.open, props.note] as const, () => {
  form.title = props.note?.title ?? ''
  form.body = props.note?.body ?? ''
}, { immediate: true })

const originalPlaceholders = computed(() => placeholdersIn(`${props.note?.title ?? ''} ${props.note?.body ?? ''}`))
const missingPlaceholders = computed(() => {
  const current = placeholdersIn(`${form.title} ${form.body}`)
  return originalPlaceholders.value.filter((placeholder) => !current.includes(placeholder))
})

const previewParagraphs = computed(() => form.body.split(/\n+/).filter(Boolean))

function save() {
  emit('save', { title: form.title.trim(), body: form.body.trim() })
  emit('update:open', false)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]" />
      <DialogContent class="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-hidden sm:p-7">
        <div class="flex items-start justify-between gap-4">
          <div>
            <DialogTitle class="text-xl font-semibold tracking-tight text-ink">Edit eNote {{ note?.code }}</DialogTitle>
            <DialogDescription class="mt-1.5 text-sm text-slate-500">{{ note?.screen }}. Changes apply to every future visit to this screen.</DialogDescription>
          </div>
          <DialogClose class="rounded-lg p-2 text-slate-400 outline-hidden hover:bg-slate-100 hover:text-slate-700"><X class="size-4" /><span class="sr-only">Close</span></DialogClose>
        </div>

        <form class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" @submit.prevent="save">
          <div class="space-y-5">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-slate-700">Title</span>
              <input v-model="form.title" type="text" class="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-hidden transition focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-slate-700">Body</span>
              <textarea v-model="form.body" rows="8" required class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-hidden transition focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
            </label>
            <div v-if="originalPlaceholders.length" class="rounded-lg px-3 py-2 text-xs leading-5" :class="missingPlaceholders.length ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'">
              <p>This eNote uses placeholders the system fills in: <span v-for="placeholder in originalPlaceholders" :key="placeholder" class="mr-1 font-mono font-medium">[{{ placeholder }}]</span></p>
              <p v-if="missingPlaceholders.length" class="mt-1 font-medium">Missing: {{ missingPlaceholders.map((placeholder) => `[${placeholder}]`).join(', ') }}. Put them back before saving.</p>
              <p v-else class="mt-1">Keep them exactly as written.</p>
            </div>
          </div>

          <div>
            <p class="text-sm font-medium text-slate-700">Preview</p>
            <div class="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-700">
              <p v-if="form.title" class="text-base font-semibold">{{ form.title }}</p>
              <p v-for="(paragraph, index) in previewParagraphs" :key="index" class="text-sm leading-6" :class="{ 'mt-1.5': index > 0 || form.title }">{{ paragraph }}</p>
              <p v-if="!form.title && !previewParagraphs.length" class="text-sm text-slate-400">Nothing to show yet.</p>
              <p class="mt-2 text-[11px] uppercase tracking-[0.08em] opacity-60">eNote {{ note?.code }}</p>
            </div>
          </div>

          <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
            <button type="button" class="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800" @click="emit('restore')"><RotateCcw class="size-4" /> Restore default wording</button>
            <div class="flex justify-end gap-3">
              <DialogClose class="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Cancel</DialogClose>
              <button type="submit" :disabled="missingPlaceholders.length > 0" class="h-10 rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-soter-700 disabled:cursor-not-allowed disabled:opacity-50">Save eNote</button>
            </div>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
