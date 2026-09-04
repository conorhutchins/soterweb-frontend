<script setup lang="ts">
import { Send, X } from '@lucide/vue'
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { toast } from 'vue-sonner'
import { formatTime } from '~/lib/access-it/time'

// Issues the current on-site list to a nominated address, normally the fire marshal (automation 00004500).
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { onSite, sendOnSiteList } = useSiteAttendance()
const { siteProfile } = useSiteDirectory()
const { automation } = useAccessItConfig()

const recipient = ref(siteProfile.emergencyContactEmail)
const automationActive = computed(() => automation('00004500')?.active ?? false)

watch(() => props.open, (open) => {
  if (open) recipient.value = siteProfile.emergencyContactEmail
})

function send() {
  const email = sendOnSiteList(recipient.value)
  if (!email) {
    toast.error('Automation 00004500 is inactive, so the list was not sent.')
    return
  }
  toast.success(`On-site list sent to ${email.to}`)
  emit('update:open', false)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]" />
      <DialogContent class="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-hidden sm:p-7">
        <div class="flex items-start justify-between gap-4">
          <div>
            <DialogTitle class="text-xl font-semibold tracking-tight text-ink">Send on-site list</DialogTitle>
            <p class="mt-1.5 text-sm text-slate-500">Email everyone currently recorded on site to the nominated emergency contact.</p>
          </div>
          <DialogClose class="rounded-lg p-2 text-slate-400 outline-hidden hover:bg-slate-100 hover:text-slate-700"><X class="size-4" /><span class="sr-only">Close</span></DialogClose>
        </div>

        <form class="mt-6 space-y-5" @submit.prevent="send">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700">Send to</span>
            <input v-model="recipient" type="email" required class="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-hidden transition focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
            <span class="block text-xs text-slate-500">{{ siteProfile.emergencyContactName }} is the nominated recipient for automation 00004500.</span>
          </label>

          <div class="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
            <p class="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{{ onSite.length }} on site</p>
            <ul v-if="onSite.length" class="divide-y divide-slate-100 text-sm">
              <li v-for="record in onSite" :key="record.id" class="flex items-center justify-between gap-3 px-4 py-2.5">
                <span><span class="font-medium text-ink">{{ record.name }}</span> <span class="text-slate-500">· {{ record.company }}</span></span>
                <span class="whitespace-nowrap text-xs text-slate-500">{{ record.buildingName }} · {{ formatTime(record.loggedOnAt) }}</span>
              </li>
            </ul>
            <p v-else class="px-4 py-6 text-center text-sm text-slate-500">Nobody is currently recorded on site.</p>
          </div>

          <p v-if="!automationActive" class="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Automation 00004500 is inactive. Activate it under Access IT settings to send the list.</p>

          <div class="flex justify-end gap-3">
            <DialogClose class="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Cancel</DialogClose>
            <button type="submit" :disabled="!automationActive" class="flex h-10 items-center gap-2 rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-soter-700 disabled:cursor-not-allowed disabled:opacity-50"><Send class="size-4" /> Send list</button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
