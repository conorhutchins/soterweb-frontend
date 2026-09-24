<script setup lang="ts">
withDefaults(defineProps<{ large?: boolean }>(), { large: false })
const baseURL = useRuntimeConfig().app.baseURL
</script>

<template>
  <img :src="`${baseURL}brand/soterweb-logo.png`" alt="SOTERweb — Integrated Workplace Management System" width="550" height="140" class="block h-auto rounded bg-white" :class="large ? 'w-64 max-w-full' : 'w-32 px-1.5 py-1'" />
</template>
