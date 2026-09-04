<script setup lang="ts">
import { renderTemplate } from '~/lib/access-it/templates'

// Shows a user-definable eNote. Wording comes from the configuration store, never from code.
const props = withDefaults(defineProps<{
  code: string
  context?: Record<string, string | undefined>
  tone?: 'neutral' | 'warning' | 'danger' | 'success'
  /** Hide the title and show only the body text. */
  bodyOnly?: boolean
}>(), { context: () => ({}), tone: 'neutral', bodyOnly: false })

const { eNote } = useAccessItConfig()
const note = computed(() => eNote(props.code))
const title = computed(() => renderTemplate(note.value.title, props.context))
const paragraphs = computed(() => renderTemplate(note.value.body, props.context).split(/\n+/).filter(Boolean))

const toneClasses: Record<NonNullable<typeof props.tone>, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-rose-200 bg-rose-50 text-rose-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
}
</script>

<template>
  <div class="rounded-2xl border px-5 py-4" :class="toneClasses[tone]">
    <p v-if="!bodyOnly && title" class="text-base font-semibold">{{ title }}</p>
    <p v-for="(paragraph, index) in paragraphs" :key="index" class="text-sm leading-6" :class="{ 'mt-1.5': index > 0 || (!bodyOnly && title) }">{{ paragraph }}</p>
    <p class="mt-2 text-[11px] uppercase tracking-[0.08em] opacity-60">eNote {{ code }}</p>
  </div>
</template>
