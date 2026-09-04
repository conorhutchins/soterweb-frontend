<script setup lang="ts">
import { X } from '@lucide/vue'
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { placeholdersIn } from '~/lib/access-it/templates'
import type { EmailAutomation } from '~/types/access-it'

// Edit the subject, body and attachment of an email automation.
const props = defineProps<{
  open: boolean
  automation: EmailAutomation | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [changes: { subject: string, body: string, attachment: string }]
}>()

const form = reactive({ subject: '', body: '', attachment: '' })

watch(() => [props.open, props.automation] as const, () => {
  form.subject = props.automation?.subject ?? ''
  form.body = props.automation?.body ?? ''
  form.attachment = props.automation?.attachment ?? ''
}, { immediate: true })

const originalPlaceholders = computed(() => placeholdersIn(`${props.automation?.subject ?? ''} ${props.automation?.body ?? ''}`))
const missingPlaceholders = computed(() => {
  const current = placeholdersIn(`${form.subject} ${form.body}`)
  return originalPlaceholders.value.filter((placeholder) => !current.includes(placeholder))
})

function save() {
  emit('save', { subject: form.subject.trim(), body: form.body.trim(), attachment: form.attachment.trim() })
  emit('update:open', false)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]" />
      <DialogContent class="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-hidden sm:p-7">
        <div class="flex items-start justify-between gap-4">
          <div>
            <DialogTitle class="text-xl font-semibold tracking-tight text-ink">Edit automation {{ automation?.runOrder }}</DialogTitle>
            <DialogDescription class="mt-1.5 text-sm text-slate-500">{{ automation?.description }}. Sent to: {{ automation?.recipient }}.</DialogDescription>
          </div>
          <DialogClose class="rounded-lg p-2 text-slate-400 outline-hidden hover:bg-slate-100 hover:text-slate-700"><X class="size-4" /><span class="sr-only">Close</span></DialogClose>
        </div>

        <form class="mt-6 space-y-5" @submit.prevent="save">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700">Subject</span>
            <input v-model="form.subject" type="text" required class="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-hidden transition focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700">Body</span>
            <textarea v-model="form.body" rows="9" required class="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm leading-6 outline-hidden transition focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700">Attachment file name</span>
            <input v-model="form.attachment" type="text" placeholder="e.g. Visitor site rules.pdf" class="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
            <span class="block text-xs text-slate-500">A document already added to the Document Manager. The folder is set by the System Email Automation Attachments Path parameter.</span>
          </label>

          <div v-if="originalPlaceholders.length" class="rounded-lg px-3 py-2 text-xs leading-5" :class="missingPlaceholders.length ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'">
            <p>Do not alter or remove the placeholders in square brackets. The system replaces them when the email is sent: <span v-for="placeholder in originalPlaceholders" :key="placeholder" class="mr-1 font-mono font-medium">[{{ placeholder }}]</span></p>
            <p v-if="missingPlaceholders.length" class="mt-1 font-medium">Missing: {{ missingPlaceholders.map((placeholder) => `[${placeholder}]`).join(', ') }}. Put them back before saving.</p>
          </div>

          <div class="flex justify-end gap-3">
            <DialogClose class="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Cancel</DialogClose>
            <button type="submit" :disabled="missingPlaceholders.length > 0" class="h-10 rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-soter-700 disabled:cursor-not-allowed disabled:opacity-50">Save automation</button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
