<script setup lang="ts">
import { CircleCheck, Link2Off } from '@lucide/vue'
const route = useRoute()
const password = ref('')
const confirmation = ref('')
const error = ref('')
const complete = ref(false)
const isActivation = computed(() => route.query.preview === 'activate')
const validPreview = computed(() => ['reset', 'activate'].includes(String(route.query.preview)))
const title = computed(() => !validPreview.value ? 'This link is not valid' : complete.value ? 'Preview complete' : isActivation.value ? 'Activate your account' : 'Choose a new password')

function submit() {
  if (password.value !== confirmation.value) {
    error.value = 'Your passwords do not match. Please try again.'
    return
  }
  password.value = ''
  confirmation.value = ''
  complete.value = true
}
</script>

<template>
  <AuthFrame :title="title" :description="!validPreview ? 'Request a new password reset link to continue.' : complete ? 'You have reached the end of the account setup preview.' : 'Enter and confirm your new password.'">
    <div v-if="!validPreview" class="space-y-5"><Link2Off class="size-8 text-slate-400" aria-hidden="true" /><NuxtLink to="/login/forgot-password" class="inline-flex min-h-11 items-center rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white">Request a new link</NuxtLink></div>
    <div v-else-if="complete" role="status" class="space-y-5"><CircleCheck class="size-9 text-emerald-600" aria-hidden="true" /><p class="text-sm leading-6 text-slate-600">No password has been saved or changed. You can still sign in to the demo with <strong>Test</strong> / <strong>Leeds</strong>.</p><NuxtLink to="/login" class="flex min-h-11 items-center justify-center rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white">Back to sign in</NuxtLink></div>
    <form v-else class="space-y-5" @submit.prevent="submit">
      <p id="preview-note" class="rounded-lg bg-soter-50 p-3 text-sm leading-6 text-soter-700">Preview only. Use a sample password with at least 8 characters. It will not be saved.</p>
      <PasswordInput id="new-password" v-model="password" label="New password" autocomplete="new-password" :minlength="8" aria-describedby="preview-note" @input="error = ''" />
      <PasswordInput id="confirm-password" v-model="confirmation" label="Confirm password" autocomplete="new-password" :minlength="8" :aria-invalid="Boolean(error)" :aria-describedby="error ? 'reset-error' : 'preview-note'" @input="error = ''" />
      <p v-if="error" id="reset-error" role="alert" class="text-sm text-rose-700">{{ error }}</p>
      <button type="submit" class="h-11 w-full rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white hover:bg-soter-700">{{ isActivation ? 'Preview activation' : 'Preview password reset' }}</button>
    </form>
    <template #footer><NuxtLink v-if="!complete" to="/login" class="font-medium text-white hover:underline">Back to sign in</NuxtLink></template>
  </AuthFrame>
</template>
