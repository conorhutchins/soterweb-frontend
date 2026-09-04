<script setup lang="ts">
import { RotateCcw, ShieldX } from '@lucide/vue'
import type { ComplianceCheckResult } from '~/lib/access-it/compliance'

// All compliance and hours refusals share this screen (eNote 5) with a reason-specific eNote below it.
defineProps<{
  reasonCode: '5A' | '5B' | '5C' | '5D'
  checks?: ComplianceCheckResult[]
  coreHours?: string
  flexHours?: string
}>()

defineEmits<{ restart: [] }>()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3 text-rose-700">
      <span class="flex size-11 items-center justify-center rounded-full bg-rose-100"><ShieldX class="size-6" /></span>
      <p class="text-sm font-semibold uppercase tracking-[0.08em]">Entry refused</p>
    </div>

    <AccessItENoteCard code="5" tone="danger" />
    <AccessItENoteCard :code="reasonCode" tone="warning" />

    <div v-if="checks?.length" class="space-y-2">
      <p class="text-sm font-semibold text-ink">Compliance checks</p>
      <AccessItContractorComplianceList :checks="checks" />
    </div>

    <dl v-if="coreHours" class="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm sm:grid-cols-2">
      <div>
        <dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Core hours</dt>
        <dd class="mt-1 font-medium text-ink">{{ coreHours }}</dd>
      </div>
      <div>
        <dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Flex period</dt>
        <dd class="mt-1 font-medium text-ink">{{ flexHours }}</dd>
      </div>
    </dl>

    <div class="flex flex-col gap-3 sm:flex-row">
      <button type="button" class="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-soter-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-soter-700" @click="$emit('restart')"><RotateCcw class="size-4" /> Start again</button>
      <NuxtLink to="/site-access" class="flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 no-underline transition hover:bg-slate-50">Back to the start screen</NuxtLink>
    </div>
  </div>
</template>
