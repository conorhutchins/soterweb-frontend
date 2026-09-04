<script setup lang="ts">
import { RotateCcw } from '@lucide/vue'
import type { SystemParameter } from '~/types/access-it'

// One system parameter row. Saves on change so the kiosk reflects the setting immediately.
const props = defineProps<{ parameter: SystemParameter }>()

const emit = defineEmits<{
  change: [value: string]
  reset: []
}>()

const draft = ref(props.parameter.value)

watch(() => props.parameter.value, (value) => { draft.value = value })

const isChanged = computed(() => props.parameter.value !== props.parameter.defaultValue)

function commit(value: string) {
  if (value === props.parameter.value) return
  emit('change', value)
}

function commitDraft() {
  commit(draft.value)
}
</script>

<template>
  <div class="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
    <div class="min-w-0">
      <p class="font-mono text-xs font-medium text-soter-700">{{ parameter.key }}</p>
      <p class="mt-1 text-sm text-slate-600">{{ parameter.description }}</p>
      <p class="mt-1 text-xs text-slate-400">
        Default: <span class="font-medium text-slate-500">{{ parameter.defaultValue || '(blank)' }}</span>
        <button v-if="isChanged" type="button" class="ml-2 inline-flex items-center gap-1 font-medium text-soter-600 hover:underline" @click="emit('reset')"><RotateCcw class="size-3" /> Reset</button>
      </p>
    </div>

    <div class="md:w-64">
      <div v-if="parameter.type === 'yesno'" class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5" role="radiogroup" :aria-label="parameter.key">
        <button v-for="option in ['Yes', 'No']" :key="option" type="button" role="radio" :aria-checked="parameter.value === option" class="h-8 rounded-md px-4 text-sm font-medium transition" :class="parameter.value === option ? 'bg-white text-soter-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'" @click="commit(option)">{{ option }}</button>
      </div>
      <select v-else-if="parameter.type === 'select'" :value="parameter.value" :aria-label="parameter.key" class="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-hidden transition focus:border-soter-500 focus:ring-3 focus:ring-soter-100" @change="commit(($event.target as HTMLSelectElement).value)">
        <option v-for="option in parameter.options" :key="option" :value="option">{{ option }}</option>
      </select>
      <input v-else-if="parameter.type === 'time'" v-model="draft" type="time" :aria-label="parameter.key" class="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-hidden transition focus:border-soter-500 focus:ring-3 focus:ring-soter-100" @change="commitDraft" @blur="commitDraft" />
      <input v-else-if="parameter.type === 'number'" v-model="draft" type="number" min="0" :aria-label="parameter.key" class="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-hidden transition focus:border-soter-500 focus:ring-3 focus:ring-soter-100" @change="commitDraft" @blur="commitDraft" />
      <input v-else v-model="draft" type="text" :aria-label="parameter.key" class="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-hidden transition focus:border-soter-500 focus:ring-3 focus:ring-soter-100" @change="commitDraft" @blur="commitDraft" @keydown.enter.prevent="commitDraft" />
    </div>
  </div>
</template>
