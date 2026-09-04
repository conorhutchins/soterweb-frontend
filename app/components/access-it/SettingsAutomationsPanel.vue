<script setup lang="ts">
import { Ellipsis, Paperclip, Pencil, Power, PowerOff } from '@lucide/vue'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui'
import { toast } from 'vue-sonner'
import { Table } from '~/components/ui/table'
import type { EmailAutomation } from '~/types/access-it'

// The twelve email automations that support the module.
const { emailAutomations, updateAutomation } = useAccessItConfig()

const isDialogOpen = ref(false)
const selectedAutomation = ref<EmailAutomation | null>(null)

const activeCount = computed(() => emailAutomations.value.filter((automation) => automation.active).length)

function edit(automation: EmailAutomation) {
  selectedAutomation.value = automation
  isDialogOpen.value = true
}

function save(changes: { subject: string, body: string, attachment: string }) {
  if (!selectedAutomation.value) return
  updateAutomation(selectedAutomation.value.runOrder, changes)
  toast.success(`Automation ${selectedAutomation.value.runOrder} saved`)
}

function setActive(automation: EmailAutomation, active: boolean) {
  updateAutomation(automation.runOrder, { active })
  toast.success(`Automation ${automation.runOrder} ${active ? 'activated' : 'inactivated'}`)
}
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header class="flex flex-col gap-2 border-b border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-base font-semibold text-ink">Email automations</h2>
        <p class="mt-1 text-sm text-slate-500">Triggered by system events such as a visitor arriving or a contractor still on site after core hours. Placeholders in square brackets must not be altered.</p>
      </div>
      <p class="text-sm text-slate-500"><span class="font-semibold text-slate-700">{{ activeCount }}</span> of {{ emailAutomations.length }} active</p>
    </header>

    <div class="overflow-x-auto">
      <Table class="min-w-[820px] border-collapse text-left">
        <thead class="bg-white text-xs uppercase tracking-[0.08em] text-slate-500">
          <tr>
            <th scope="col" class="whitespace-nowrap px-5 py-3.5 font-semibold">Run order</th>
            <th scope="col" class="px-5 py-3.5 font-semibold">Description</th>
            <th scope="col" class="whitespace-nowrap px-5 py-3.5 font-semibold">Recipient</th>
            <th scope="col" class="whitespace-nowrap px-5 py-3.5 font-semibold">Attachment</th>
            <th scope="col" class="whitespace-nowrap px-5 py-3.5 font-semibold">Status</th>
            <th scope="col" class="px-5 py-3.5" />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm">
          <tr v-for="automation in emailAutomations" :key="automation.runOrder" class="group align-top transition hover:bg-soter-50/60">
            <td class="whitespace-nowrap px-5 py-4 font-mono text-xs font-medium text-soter-700">{{ automation.runOrder }}</td>
            <td class="min-w-72 px-5 py-4">
              <p class="font-medium text-ink">{{ automation.description }}</p>
              <p class="mt-0.5 text-xs text-slate-500">Subject: {{ automation.subject }}</p>
            </td>
            <td class="whitespace-nowrap px-5 py-4 text-slate-600">{{ automation.recipient }}</td>
            <td class="whitespace-nowrap px-5 py-4 text-slate-600">
              <span v-if="automation.attachment" class="inline-flex items-center gap-1.5"><Paperclip class="size-3.5 text-slate-400" /> {{ automation.attachment }}</span>
              <span v-else class="text-slate-400">None</span>
            </td>
            <td class="px-5 py-4"><AccessItStatusPill :label="automation.active ? 'Active' : 'Inactive'" :tone="automation.active ? 'success' : 'neutral'" /></td>
            <td class="px-5 py-4 text-right">
              <DropdownMenuRoot>
                <DropdownMenuTrigger class="rounded-lg p-2 text-slate-400 outline-hidden transition hover:bg-white hover:text-slate-700 group-hover:bg-white/80"><Ellipsis class="size-4" /><span class="sr-only">Actions for automation {{ automation.runOrder }}</span></DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent class="z-50 min-w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg" :side-offset="6" align="end">
                    <DropdownMenuItem class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-hidden hover:bg-slate-50" @select="edit(automation)"><Pencil class="size-4 text-slate-500" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem v-if="automation.active" class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-700 outline-hidden hover:bg-rose-50" @select="setActive(automation, false)"><PowerOff class="size-4" /> Inactivate</DropdownMenuItem>
                    <DropdownMenuItem v-else class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-emerald-700 outline-hidden hover:bg-emerald-50" @select="setActive(automation, true)"><Power class="size-4" /> Activate</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenuRoot>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>

    <AccessItAutomationDialog v-model:open="isDialogOpen" :automation="selectedAutomation" @save="save" />
  </section>
</template>
