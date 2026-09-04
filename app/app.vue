<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtPage />
  <Toaster rich-colors position="top-right" />
</template>
