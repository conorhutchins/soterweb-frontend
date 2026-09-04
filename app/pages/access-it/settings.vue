<script setup lang="ts">
import { TriangleAlert, X } from '@lucide/vue'
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { toast } from 'vue-sonner'

type TabKey = 'parameters' | 'enotes' | 'automations' | 'emails'

const route = useRoute()
const router = useRouter()
const config = useAccessItConfig()
const attendance = useSiteAttendance()
const directory = useSiteDirectory()

const tabs: { key: TabKey, label: string }[] = [
  { key: 'parameters', label: 'System parameters' },
  { key: 'enotes', label: 'eNotes' },
  { key: 'automations', label: 'Email automations' },
  { key: 'emails', label: 'Sent emails' },
]

function isTabKey(value: unknown): value is TabKey {
  return tabs.some((tab) => tab.key === value)
}

const activeTab = computed<TabKey>(() => isTabKey(route.query.tab) ? route.query.tab : 'parameters')

function selectTab(key: TabKey) {
  router.replace({ query: { ...route.query, tab: key === 'parameters' ? undefined : key } })
}

const changedParameters = computed(() => config.parameters.value.filter((parameter) => parameter.value !== parameter.defaultValue).length)
const activeAutomations = computed(() => config.emailAutomations.value.filter((automation) => automation.active).length)

const badges = computed<Record<TabKey, string>>(() => ({
  parameters: `${changedParameters.value} changed`,
  enotes: `${config.eNotes.value.length}`,
  automations: `${activeAutomations.value} active`,
  emails: `${attendance.sentEmails.value.length}`,
}))

const isResetOpen = ref(false)

function resetDemoData() {
  config.resetAll()
  attendance.resetAll()
  directory.resetAll()
  isResetOpen.value = false
  toast.success('Demo data reset to the original fixtures')
}
</script>

<template>
  <AppShell>
    <div class="flex flex-col gap-6">
      <div>
        <div class="mb-3 flex items-center gap-2 text-sm font-medium text-soter-600"><span class="size-2 rounded-full bg-soter-500" /> Access IT</div>
        <h1 class="text-3xl font-semibold tracking-tight text-ink">Module settings</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Behaviour is set by configuration rather than by code. System parameters govern how the module behaves, eNotes hold every message shown on screen, and email automations respond to what happens on site.</p>
      </div>

      <div class="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs" role="tablist" aria-label="Settings sections">
        <button v-for="tab in tabs" :key="tab.key" role="tab" :aria-selected="activeTab === tab.key" class="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition" :class="activeTab === tab.key ? 'bg-soter-100 text-soter-700' : 'text-slate-600 hover:bg-slate-50'" @click="selectTab(tab.key)">
          {{ tab.label }}
          <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="activeTab === tab.key ? 'bg-white text-soter-700' : 'bg-slate-100 text-slate-500'">{{ badges[tab.key] }}</span>
        </button>
      </div>

      <div role="tabpanel">
        <AccessItSettingsParametersPanel v-if="activeTab === 'parameters'" />
        <AccessItSettingsENotesPanel v-else-if="activeTab === 'enotes'" />
        <AccessItSettingsAutomationsPanel v-else-if="activeTab === 'automations'" />
        <AccessItSettingsSentEmailsPanel v-else />
      </div>

      <section class="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex gap-3">
            <TriangleAlert class="mt-0.5 size-5 shrink-0 text-rose-600" />
            <div>
              <h2 class="text-base font-semibold text-rose-900">Reset demo data</h2>
              <p class="mt-1 text-sm leading-6 text-rose-800">Restores the original parameters, eNotes, automations, attendance records, permits and assets. Useful after a demonstration.</p>
            </div>
          </div>
          <button class="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-rose-300 bg-white px-4 text-sm font-semibold text-rose-700 shadow-xs transition hover:bg-rose-100" @click="isResetOpen = true">Reset demo data</button>
        </div>
      </section>
    </div>

    <DialogRoot :open="isResetOpen" @update:open="isResetOpen = $event">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]" />
        <DialogContent class="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-hidden sm:p-7">
          <div class="flex items-start justify-between gap-4">
            <div>
              <DialogTitle class="text-xl font-semibold tracking-tight text-ink">Reset demo data?</DialogTitle>
              <DialogDescription class="mt-1.5 text-sm leading-6 text-slate-500">Every change made in this browser, including attendance records and edited wording, will be replaced with the original fixtures. This cannot be undone.</DialogDescription>
            </div>
            <DialogClose class="rounded-lg p-2 text-slate-400 outline-hidden hover:bg-slate-100 hover:text-slate-700"><X class="size-4" /><span class="sr-only">Close</span></DialogClose>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <DialogClose class="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Keep my data</DialogClose>
            <button type="button" class="h-10 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700" @click="resetDemoData">Reset everything</button>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </AppShell>
</template>
