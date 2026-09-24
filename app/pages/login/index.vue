<script setup lang="ts">
import { ArrowRight, LoaderCircle } from '@lucide/vue'

definePageMeta({ layout: false })
const username = ref('')
const password = ref('')
const remember = ref(false)
const loginError = ref('')
const submitting = ref(false)
const { signIn, restoreSession, isAuthenticated } = useAuth()
const { paramIsYes } = useAccessItConfig()
const landingPage = computed(() => paramIsYes('System Menu Show Access IT Tab') ? '/access-it' : '/organisations')
const showKioskLink = computed(() => paramIsYes('System Menu Show Access IT (Not Logged In)'))

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) navigateTo(landingPage.value, { replace: true })
})

async function submitLogin() {
  if (submitting.value) return
  submitting.value = true
  loginError.value = ''
  try {
    if (!signIn(username.value, password.value, remember.value)) {
      loginError.value = 'Check your username and password, then try again.'
      return
    }
    await navigateTo(landingPage.value)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthFrame title="Welcome back" description="Sign in to your workplace account.">
    <form class="space-y-5" :aria-busy="submitting" @submit.prevent="submitLogin">
      <div>
        <label for="username" class="mb-2 block text-sm font-medium text-slate-700">Username</label>
        <input id="username" v-model="username" required autocomplete="username" autocapitalize="none" spellcheck="false" :aria-invalid="Boolean(loginError)" :aria-describedby="loginError ? 'login-error' : undefined" class="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base outline-hidden focus:border-soter-500 focus:ring-3 focus:ring-soter-100" @input="loginError = ''" />
      </div>
      <PasswordInput id="password" v-model="password" label="Password" autocomplete="current-password" :aria-invalid="Boolean(loginError)" :aria-describedby="loginError ? 'login-error' : undefined" @input="loginError = ''" />
      <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
        <label class="flex min-h-9 cursor-pointer items-center gap-2 text-slate-600"><input v-model="remember" type="checkbox" class="size-4 accent-soter-600" /> Remember me for 30 days</label>
        <NuxtLink to="/login/forgot-password" class="font-semibold text-soter-700 underline-offset-4 hover:underline">Forgot password?</NuxtLink>
      </div>
      <p v-if="loginError" id="login-error" role="alert" class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{{ loginError }}</p>
      <button type="submit" :disabled="submitting" class="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-soter-600 text-sm font-semibold text-white transition hover:bg-soter-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soter-600 disabled:opacity-60"><LoaderCircle v-if="submitting" class="size-4 animate-spin" /><ArrowRight v-else class="size-4" /> {{ submitting ? 'Signing in…' : 'Sign in' }}</button>
    </form>
    <p class="mt-6 border-t border-slate-100 pt-5 text-center text-xs leading-5 text-slate-500">Frontend demo · Username <strong>Test</strong> · Password <strong>Leeds</strong></p>
    <template #footer><p v-if="showKioskLink">Contractor or visitor? <NuxtLink to="/site-access" class="font-semibold text-white underline-offset-4 hover:underline">Go to site access</NuxtLink></p></template>
  </AuthFrame>
</template>
