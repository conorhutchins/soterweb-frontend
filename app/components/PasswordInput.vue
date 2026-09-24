<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'

defineOptions({ inheritAttrs: false })
const model = defineModel<string>({ required: true })
defineProps<{ id: string, label: string, autocomplete: 'current-password' | 'new-password', minlength?: number }>()
const visible = ref(false)
</script>

<template>
  <div>
    <label :for="id" class="mb-2 block text-sm font-medium text-slate-700">{{ label }}</label>
    <div class="relative">
      <input :id="id" v-model="model" v-bind="$attrs" :type="visible ? 'text' : 'password'" :autocomplete="autocomplete" :minlength="minlength" required class="h-11 w-full rounded-lg border border-slate-300 bg-white pl-3 pr-12 text-base outline-hidden transition focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
      <button type="button" :aria-label="`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`" :aria-pressed="visible" :aria-controls="id" class="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 hover:text-soter-700 focus-visible:outline-2 focus-visible:outline-soter-500" @click="visible = !visible"><component :is="visible ? EyeOff : Eye" class="size-4" /></button>
    </div>
  </div>
</template>
