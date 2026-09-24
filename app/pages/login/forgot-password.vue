<script setup lang="ts">
import { ArrowLeft, MailCheck } from '@lucide/vue'
const username = ref('')
const submitted = ref(false)
</script>

<template>
  <AuthFrame :title="submitted ? 'Check your email' : 'Forgot your password?'" :description="submitted ? 'If an account matches that username, you will receive a link to reset your password.' : 'Enter your username and we will help you get back into your account.'">
    <div v-if="submitted" role="status" class="space-y-5">
      <MailCheck class="size-9 text-soter-600" aria-hidden="true" />
      <p class="rounded-lg bg-soter-50 p-3 text-sm leading-6 text-soter-700">This is a demo preview. No email has been sent.</p>
      <NuxtLink to="/login/reset?preview=reset" class="flex min-h-11 items-center justify-center rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white hover:bg-soter-700">Preview the reset link</NuxtLink>
      <button class="text-sm font-medium text-soter-700 underline-offset-4 hover:underline" @click="submitted = false">Try another username</button>
    </div>
    <form v-else class="space-y-5" @submit.prevent="submitted = true">
      <label class="block space-y-2"><span class="text-sm font-medium text-slate-700">Username</span><input v-model="username" required autocomplete="username" autocapitalize="none" spellcheck="false" class="h-11 w-full rounded-lg border border-slate-300 px-3 text-base outline-hidden focus:border-soter-500 focus:ring-3 focus:ring-soter-100" /></label>
      <button type="submit" class="h-11 w-full rounded-lg bg-soter-600 px-4 text-sm font-semibold text-white hover:bg-soter-700">Continue</button>
      <p class="text-xs leading-5 text-slate-500">Demo preview only. Account emails are not sent.</p>
    </form>
    <template #footer><NuxtLink to="/login" class="inline-flex items-center gap-2 font-medium text-white hover:underline"><ArrowLeft class="size-4" /> Back to sign in</NuxtLink></template>
  </AuthFrame>
</template>
