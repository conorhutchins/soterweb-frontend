<script setup lang="ts">
import { Check, X } from '@lucide/vue'

// A configurable message the contractor must accept before continuing (compliance, flex, asbestos, RAMS).
withDefaults(defineProps<{
  code: string
  context?: Record<string, string | undefined>
  tone?: 'neutral' | 'warning' | 'danger' | 'success'
  prompt?: string
}>(), { context: () => ({}), tone: 'neutral', prompt: 'Please confirm acceptance of the message below' })

defineEmits<{ yes: [], no: [] }>()
</script>

<template>
  <div class="space-y-6">
    <p class="text-base font-semibold text-ink">{{ prompt }}</p>
    <AccessItENoteCard :code="code" :context="context" :tone="tone" />
    <div class="grid gap-3 sm:grid-cols-2">
      <button type="button" class="flex h-14 items-center justify-center gap-2 rounded-2xl bg-soter-600 text-base font-semibold text-white shadow-sm transition hover:bg-soter-700 focus:outline-hidden focus:ring-3 focus:ring-soter-200" @click="$emit('yes')"><Check class="size-5" /> Yes, I accept</button>
      <button type="button" class="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-base font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-hidden focus:ring-3 focus:ring-soter-100" @click="$emit('no')"><X class="size-5" /> No</button>
    </div>
  </div>
</template>
