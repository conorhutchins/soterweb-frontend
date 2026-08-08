<script setup lang="ts">
import { ArrowRight, LockKeyhole, UserRound } from '@lucide/vue'

definePageMeta({ layout: false })

const username = ref('')
const password = ref('')
const loginError = ref('')
const { signIn, restoreSession, isAuthenticated } = useAuth()
const router = useRouter()

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) router.replace('/organisations')
})

function submitLogin() {
  if (!signIn(username.value, password.value)) {
    loginError.value = 'Check your username and password, then try again.'
    return
  }

  router.push('/organisations')
}
</script>

<template>
  <div class="relative grid min-h-dvh place-items-center overflow-hidden bg-slate-950 px-5 py-10">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1677bd_0%,#0f3556_42%,#0f172a_75%)]" />
    <div class="absolute -left-24 top-24 size-80 rounded-full bg-soter-500/25 blur-3xl" />
    <div class="absolute -bottom-32 right-0 size-96 rounded-full bg-cyan-300/10 blur-3xl" />

    <section class="relative w-full max-w-[430px]">
      <div class="mb-8 text-center">
        <AppWordmark class="text-4xl" />
        <p class="mt-3 text-sm font-medium tracking-wide text-soter-100">INTEGRATED WORKPLACE MANAGEMENT SYSTEM</p>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white p-7 shadow-2xl sm:p-9">
        <div class="mb-7">
          <h1 class="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
          <p class="mt-2 text-sm leading-6 text-slate-500">Sign in to manage your workplace data.</p>
        </div>

        <form class="space-y-5" @submit.prevent="submitLogin">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700">Username</span>
            <span class="relative block"><UserRound class="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" /><input v-model="username" type="text" autocomplete="username" placeholder="Enter your username" class="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100" /></span>
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700">Password</span>
            <span class="relative block"><LockKeyhole class="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" /><input v-model="password" type="password" autocomplete="current-password" placeholder="Enter your password" class="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100" /></span>
          </label>
          <button type="submit" class="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-soter-600 text-sm font-semibold text-white shadow-sm transition hover:bg-soter-700 focus:outline-hidden focus:ring-3 focus:ring-soter-200">Sign in <ArrowRight class="size-4" /></button>
          <p v-if="loginError" role="alert" class="text-center text-sm font-medium text-rose-600">{{ loginError }}</p>
        </form>

        <p class="mt-6 text-center text-xs leading-5 text-slate-400">Demo account: <strong class="font-semibold text-slate-500">Test</strong> / <strong class="font-semibold text-slate-500">Leeds</strong></p>
      </div>
    </section>
  </div>
</template>
