<script setup lang="ts">
const { paramIsYes } = useAccessItConfig()
navigateTo(paramIsYes('System Menu Show Access IT Tab') ? '/access-it' : '/organisations', { replace: true })
</script>

<template><span class="sr-only">Opening your workspace…</span></template>
