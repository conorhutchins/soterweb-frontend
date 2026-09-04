<script setup lang="ts">
import { Building2, House } from '@lucide/vue'
import { siteProfile } from '~/composables/useSiteDirectory'

// The public frame contractors and visitors see. Branded with the client organisation, never the wider system.
const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  /** Names of the journey steps, shown as a progress strip when provided. */
  steps?: string[]
  currentStep?: number
  /** Widen the card for table-like content such as the asset register. */
  wide?: boolean
}>(), { steps: () => [], currentStep: 0, wide: false })

// Each wizard step swaps the heading; moving focus there keeps screen readers and keyboards oriented.
const heading = ref<HTMLHeadingElement | null>(null)
watch(() => props.title, async () => {
  await nextTick()
  heading.value?.focus({ preventScroll: true })
})
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-[#eef3f8]">
    <header class="border-b border-soter-700 bg-soter-600">
      <div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <NuxtLink to="/site-access" class="flex items-center gap-3 text-white no-underline">
          <span class="flex size-9 items-center justify-center rounded-lg bg-white/15"><Building2 class="size-5" /></span>
          <span class="leading-tight">
            <span class="block text-sm font-semibold">{{ siteProfile.clientName }}</span>
            <span class="block text-xs text-soter-100">{{ siteProfile.siteName }} · Access IT</span>
          </span>
        </NuxtLink>
        <NuxtLink to="/site-access" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-soter-100 no-underline transition hover:bg-white/10 hover:text-white"><House class="size-4" /> Start again</NuxtLink>
      </div>
    </header>

    <main class="mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:py-12" :class="wide ? 'max-w-5xl' : 'max-w-3xl'">
      <ol v-if="steps.length" class="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500" aria-label="Progress">
        <li v-for="(step, index) in steps" :key="step" class="flex items-center gap-2" :aria-current="index === currentStep ? 'step' : undefined">
          <span class="flex size-6 items-center justify-center rounded-full text-[11px] font-semibold" :class="index < currentStep ? 'bg-emerald-500 text-white' : index === currentStep ? 'bg-soter-600 text-white' : 'bg-slate-200 text-slate-500'">{{ index + 1 }}</span>
          <span :class="index === currentStep ? 'text-ink' : 'hidden sm:inline'">{{ step }}</span>
        </li>
      </ol>

      <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <header v-if="title" class="mb-8">
          <h1 ref="heading" tabindex="-1" class="text-3xl font-semibold tracking-tight text-ink outline-hidden">{{ title }}</h1>
          <p v-if="subtitle" class="mt-2 text-base leading-7 text-slate-500">{{ subtitle }}</p>
        </header>
        <slot />
      </section>

      <p class="mt-6 text-center text-xs text-slate-400">Powered by SoterWeb Access IT. If you need help, speak to reception.</p>
    </main>
  </div>
</template>
