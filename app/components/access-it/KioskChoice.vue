<script setup lang="ts">
import { Check } from '@lucide/vue'

// A large, touch-friendly option used for lists such as the reason for attendance.
defineProps<{
  label: string
  description?: string
  selected: boolean
  disabled?: boolean
}>()

defineEmits<{ select: [] }>()
</script>

<template>
  <button type="button" :disabled="disabled" role="radio" :aria-checked="selected" class="flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition outline-hidden focus-visible:ring-3 focus-visible:ring-soter-100 disabled:cursor-not-allowed disabled:opacity-50" :class="selected ? 'border-soter-500 bg-soter-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'" @click="$emit('select')">
    <span class="flex size-6 shrink-0 items-center justify-center rounded-full border-2" :class="selected ? 'border-soter-600 bg-soter-600 text-white' : 'border-slate-300 bg-white text-transparent'"><Check class="size-3.5" /></span>
    <span class="min-w-0">
      <span class="block text-base font-medium text-ink">{{ label }}</span>
      <span v-if="description" class="mt-0.5 block text-sm text-slate-500">{{ description }}</span>
    </span>
  </button>
</template>
