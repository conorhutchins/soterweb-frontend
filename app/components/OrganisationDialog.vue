<script setup lang="ts">
import { X } from '@lucide/vue'
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import type { Organisation, OrganisationInput } from '~/types/organisation'

const props = defineProps<{
  open: boolean
  organisation?: Organisation | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [organisationInput: OrganisationInput]
}>()

const form = reactive<OrganisationInput>({
  code: '',
  name: '',
  telephone: '',
  email: '',
  active: true,
})

const isEditing = computed(() => Boolean(props.organisation))

watch(
  () => [props.open, props.organisation] as const,
  () => {
    Object.assign(form, props.organisation ?? {
      code: '',
      name: '',
      telephone: '',
      email: '',
      active: true,
    })
  },
  { immediate: true },
)

function updateOpen(value: boolean) {
  emit('update:open', value)
}

function saveOrganisation() {
  emit('save', { ...form })
  updateOpen(false)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="updateOpen">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]" />
      <DialogContent class="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-hidden sm:p-7">
        <div class="flex items-start justify-between gap-4">
          <div>
            <DialogTitle class="text-xl font-semibold tracking-tight text-ink">{{ isEditing ? 'Edit organisation' : 'Add organisation' }}</DialogTitle>
            <p class="mt-1.5 text-sm text-slate-500">{{ isEditing ? 'Update this organisation’s contact details.' : 'Create a new organisation in the workspace.' }}</p>
          </div>
          <DialogClose class="rounded-lg p-2 text-slate-400 outline-hidden hover:bg-slate-100 hover:text-slate-700"><X class="size-4" /><span class="sr-only">Close</span></DialogClose>
        </div>

        <form class="mt-6 grid gap-5 sm:grid-cols-2" @submit.prevent="saveOrganisation">
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">Organisation code</span>
            <input v-model="form.code" required placeholder="e.g. SOTERweb001" class="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm uppercase outline-hidden transition placeholder:normal-case placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">Organisation name</span>
            <input v-model="form.name" required placeholder="Organisation name" class="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">Telephone</span>
            <input v-model="form.telephone" required type="tel" placeholder="Telephone number" class="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-700">Email address</span>
            <input v-model="form.email" required type="email" placeholder="name@organisation.co.uk" class="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
          </label>
          <label v-if="isEditing" class="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
            <input v-model="form.active" type="checkbox" class="size-4 rounded border-slate-300 text-soter-600 focus:ring-soter-500" /> Active organisation
          </label>
          <div class="mt-2 flex justify-end gap-3 sm:col-span-2">
            <DialogClose class="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Cancel</DialogClose>
            <button type="submit" class="h-10 rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-soter-700">{{ isEditing ? 'Save changes' : 'Add organisation' }}</button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
