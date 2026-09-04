<script setup lang="ts">
type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

defineProps<{
  label: string
  tone: Tone
}>()

const toneClasses: Record<Tone, { pill: string, dot: string }> = {
  success: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  warning: { pill: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  danger: { pill: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  neutral: { pill: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  info: { pill: 'bg-soter-50 text-soter-700', dot: 'bg-soter-500' },
}
</script>

<template>
  <span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium" :class="toneClasses[tone].pill"><span class="size-1.5 rounded-full" :class="toneClasses[tone].dot" />{{ label }}</span>
</template>
