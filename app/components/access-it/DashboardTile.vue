<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

// A dashboard tile with a RAG indicator: the border and value turn red when items fall outside expected parameters.
type Tone = 'success' | 'warning' | 'danger' | 'neutral'

defineProps<{
  title: string
  value: number
  caption: string
  tone: Tone
  to: string
}>()

const toneClasses: Record<Tone, { border: string, value: string, dot: string }> = {
  success: { border: 'border-emerald-200', value: 'text-emerald-700', dot: 'bg-emerald-500' },
  warning: { border: 'border-amber-200', value: 'text-amber-700', dot: 'bg-amber-500' },
  danger: { border: 'border-rose-300', value: 'text-rose-700', dot: 'bg-rose-500' },
  neutral: { border: 'border-slate-200', value: 'text-ink', dot: 'bg-slate-400' },
}
</script>

<template>
  <NuxtLink :to="to" class="group flex flex-col justify-between rounded-2xl border-2 bg-white p-5 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" :class="toneClasses[tone].border">
    <div class="flex items-center justify-between gap-3">
      <p class="text-sm font-medium text-slate-600">{{ title }}</p>
      <span class="size-2.5 rounded-full" :class="toneClasses[tone].dot" aria-hidden="true" />
    </div>
    <p class="mt-4 text-4xl font-semibold tracking-tight" :class="toneClasses[tone].value">{{ value }}</p>
    <div class="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
      <span>{{ caption }}</span>
      <span class="flex items-center gap-1 font-medium text-soter-600 opacity-0 transition group-hover:opacity-100">View <ArrowRight class="size-3.5" /></span>
    </div>
  </NuxtLink>
</template>
