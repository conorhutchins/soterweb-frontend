<script setup lang="ts">
import { RefreshCw } from '@lucide/vue'

// The on-screen code a visitor must type, required by the Site Access User Site Code for Visitors parameter.
const entry = defineModel<string>({ required: true })

defineProps<{
  code: string
  error?: string
}>()

defineEmits<{ refresh: [] }>()
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <p class="text-sm font-medium text-slate-700">Type the code shown</p>
    <div class="mt-3 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <span class="select-none rounded-xl bg-soter-600 px-8 py-3 text-center font-mono text-3xl font-semibold tracking-[0.4em] text-white" aria-label="Site code">{{ code }}</span>
      <input v-model="entry" required inputmode="numeric" maxlength="4" autocomplete="off" placeholder="Enter code" class="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-center text-xl tracking-[0.3em] outline-hidden transition placeholder:tracking-normal placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
    </div>
    <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
      <button type="button" class="inline-flex items-center gap-1.5 text-sm font-medium text-soter-600 hover:text-soter-700" @click="$emit('refresh')"><RefreshCw class="size-3.5" /> Show another code</button>
      <span class="text-xs text-slate-500">The code changes each time you start again.</span>
    </div>
    <p v-if="error" role="alert" class="mt-3 text-sm font-medium text-rose-600">{{ error }}</p>
  </div>
</template>
