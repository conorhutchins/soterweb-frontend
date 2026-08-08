<script setup lang="ts">
import { Download, FileDown, Plus, RefreshCw, SlidersHorizontal } from '@lucide/vue'
import { toast } from 'vue-sonner'
import type { Organisation, OrganisationInput } from '~/types/organisation'

const { organisations, create, update, deactivate } = useOrganisations()
const activeOnly = ref(true)
const isDialogOpen = ref(false)
const selectedOrganisation = ref<Organisation | null>(null)

const activeCount = computed(() => organisations.value.filter((organisation) => organisation.active).length)

function openCreateDialog() {
  selectedOrganisation.value = null
  isDialogOpen.value = true
}

function openEditDialog(organisation: Organisation) {
  selectedOrganisation.value = organisation
  isDialogOpen.value = true
}

function saveOrganisation(organisationInput: OrganisationInput) {
  if (selectedOrganisation.value) {
    update(selectedOrganisation.value.id, organisationInput)
    toast.success('Organisation updated')
    return
  }

  create(organisationInput)
  toast.success('Organisation added')
}

function deactivateOrganisation(organisation: Organisation) {
  deactivate(organisation.id)
  toast.success(`${organisation.name} deactivated`)
}

function showFutureIntegration(action: string) {
  toast.info(`${action} will connect to the SoterWeb API in the next phase.`)
}
</script>

<template>
  <AppShell>
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="mb-3 flex items-center gap-2 text-sm font-medium text-soter-600"><span class="size-2 rounded-full bg-soter-500" /> Directory</div>
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><h1 class="text-3xl font-semibold tracking-tight text-ink">Organisations</h1><span class="text-sm text-slate-500">{{ activeCount }} active records</span></div>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage the organisations and workplace accounts in your SoterWeb workspace.</p>
        </div>
        <button class="flex h-11 items-center justify-center gap-2 rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-soter-700 focus:outline-hidden focus:ring-3 focus:ring-soter-200" @click="openCreateDialog"><Plus class="size-4" /> Add organisation</button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50" @click="showFutureIntegration('XLSX export')"><Download class="size-4 text-slate-500" /> Export XLSX</button>
        <button class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50" @click="showFutureIntegration('PDF export')"><FileDown class="size-4 text-slate-500" /> Export PDF</button>
        <button class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50" @click="showFutureIntegration('Refresh')"><RefreshCw class="size-4 text-slate-500" /> Refresh</button>
        <button class="ml-auto inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition" :class="activeOnly ? 'bg-soter-100 text-soter-700' : 'bg-white text-slate-600 hover:bg-slate-50'" @click="activeOnly = !activeOnly"><SlidersHorizontal class="size-4" /> {{ activeOnly ? 'Active only' : 'All records' }}</button>
      </div>

      <OrganisationsTable :organisations="organisations" :active-only="activeOnly" @edit="openEditDialog" @deactivate="deactivateOrganisation" />
    </div>

    <OrganisationDialog v-model:open="isDialogOpen" :organisation="selectedOrganisation" @save="saveOrganisation" />
  </AppShell>
</template>
