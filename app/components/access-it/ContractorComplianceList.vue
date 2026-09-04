<script setup lang="ts">
import { CircleCheck, CircleMinus, CircleX } from '@lucide/vue'
import type { ComplianceCheckResult } from '~/lib/access-it/compliance'

// The five compliance checks and how each one fared at the point of entry.
defineProps<{ checks: ComplianceCheckResult[] }>()

function icon(check: ComplianceCheckResult) {
  if (!check.enabled) return CircleMinus
  return check.passed ? CircleCheck : CircleX
}

function iconClass(check: ComplianceCheckResult) {
  if (!check.enabled) return 'text-slate-300'
  return check.passed ? 'text-emerald-500' : 'text-rose-500'
}

function statusLabel(check: ComplianceCheckResult) {
  if (!check.enabled) return 'Not checked'
  return check.passed ? 'Pass' : 'Fail'
}

function statusTone(check: ComplianceCheckResult): 'success' | 'danger' | 'neutral' {
  if (!check.enabled) return 'neutral'
  return check.passed ? 'success' : 'danger'
}
</script>

<template>
  <ul class="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <li v-for="check in checks" :key="check.key" class="flex items-start gap-3 px-4 py-3" :class="{ 'opacity-60': !check.enabled }">
      <component :is="icon(check)" class="mt-0.5 size-5 shrink-0" :class="iconClass(check)" />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm font-medium text-ink">{{ check.label }} <span class="text-xs font-normal text-slate-400">· {{ check.level }}</span></p>
          <AccessItStatusPill :label="statusLabel(check)" :tone="statusTone(check)" />
        </div>
        <p class="mt-0.5 text-xs text-slate-500">{{ check.enabled ? check.detail : 'Switched off by system parameter' }}</p>
      </div>
    </li>
  </ul>
</template>
