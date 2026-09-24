<script setup lang="ts">
defineProps<{ title: string, description: string }>()
</script>

<template>
  <main class="relative grid min-h-dvh place-items-center bg-slate-950 px-5 py-8 sm:py-12">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0c4f83,transparent_70%)]" />
    <section class="relative w-full max-w-[460px]">
      <div class="overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div aria-hidden="true" class="h-1.5 bg-gradient-to-r from-[#00a5df] via-[#00a5df] to-[#f59a00]" />
        <div class="p-6 sm:p-9">
          <NuxtLink to="/login" class="mb-8 inline-block rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-soter-500" aria-label="SOTERweb sign in"><AppWordmark large /></NuxtLink>
          <h1 class="text-2xl font-semibold tracking-tight text-ink">{{ title }}</h1>
          <p class="mt-2 text-sm leading-6 text-slate-600">{{ description }}</p>
          <div class="mt-6"><slot /></div>
        </div>
      </div>
      <div class="mt-5 text-center text-sm leading-6 text-slate-200"><slot name="footer" /></div>
    </section>
  </main>
</template>
