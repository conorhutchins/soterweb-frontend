<script setup lang="ts">
import { KeyRound } from '@lucide/vue'
import { clockIsSet } from '~/lib/access-it/time'
const { param } = useAccessItConfig()
const { contractors, organisations, organisationById } = useSiteDirectory()
// What each demo account shows off. The public kiosk deliberately does not list these; they live behind sign-in.
const demoHints: Record<string, string> = {
  contractor1: 'Passes every check; PPM contractor for the Energy Centre assets',
  contractor2: 'Asbestos acknowledgement and permit conflicts; already on site',
  contractor3: 'Refused: insurance expired',
  contractor4: 'Refused: induction expired',
  contractor5: 'Out-of-hours approved organisation',
  contractor6: 'Refused: certificate expired',
  contractor7: 'Holds an out-of-hours permit at the Library',
  contractor8: 'Refused: RAMS expired',
  contractor9: 'On site over 24 hours',
}

const demoAccounts = computed(() => contractors.value.map((contractor) => ({
  username: contractor.username,
  password: contractor.password,
  name: `${contractor.firstName} ${contractor.lastName}`,
  organisation: organisationById(contractor.organisationId)?.name ?? '',
  hint: demoHints[contractor.username] ?? '',
})))

const companyCodes = computed(() => organisations.value.map((organisation) => `${organisation.code} (${organisation.name})`).join(', '))
const verificationCode = computed(() => param('Site Access Allow Anonymous Verification Code'))

const workingWindow = computed(() => {
  const coreStart = param('Site Access Check Core Hour START')
  const coreFinish = param('Site Access Check Core Hour FINISH')
  const flexStart = param('Site Access Check Core Hour START Flex')
  const flexFinish = param('Site Access Check Core Hour FINISH Flex')
  const active = clockIsSet(coreStart) && clockIsSet(coreFinish)
  return {
    active,
    core: active ? `${coreStart} to ${coreFinish}` : 'No time restrictions',
    flex: active ? `${clockIsSet(flexStart) ? flexStart : coreStart} to ${clockIsSet(flexFinish) ? flexFinish : coreFinish}` : 'Not applicable',
    maxStay: Number(param('Site Access Expected Logout Max Duration')) > 0 ? `${param('Site Access Expected Logout Max Duration')} hours` : 'Unlimited',
  }
})
</script>

<template>
  <details class="rounded-2xl border border-slate-200 bg-white">
    <summary class="cursor-pointer px-5 py-4 text-sm font-semibold text-soter-700">Demo guide and working hours</summary>
    <div class="space-y-5 border-t border-slate-100 p-4 sm:p-5">
      <p class="text-sm leading-6 text-slate-600">Try a contractor arrival, check People on site, then record their departure. Notifications appear in the demo outbox; no emails are sent.</p>
      <dl class="grid gap-3 text-sm sm:grid-cols-3">
        <div><dt class="text-slate-500">Core hours</dt><dd class="font-medium">{{ workingWindow.core }}</dd></div>
        <div><dt class="text-slate-500">Flex period</dt><dd class="font-medium">{{ workingWindow.flex }}</dd></div>
        <div><dt class="text-slate-500">Maximum stay</dt><dd class="font-medium">{{ workingWindow.maxStay }}</dd></div>
      </dl>
      <p class="text-sm text-slate-600">Working hours and access checks are configurable in <NuxtLink to="/access-it/settings" class="font-medium text-soter-700 underline">Settings</NuxtLink>.</p>
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header class="border-b border-slate-100 px-5 py-4">
          <h2 class="flex items-center gap-2 text-base font-semibold text-ink"><KeyRound class="size-4 text-slate-400" /> Demo accounts for the kiosk</h2>
          <p class="mt-1 text-xs leading-5 text-slate-500">Every contractor account uses the password <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">demo</code>. Staff sign in as <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">Test</code> / <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">Leeds</code>. The public kiosk deliberately does not show any of this.</p>
        </header>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th scope="col" class="px-5 py-3 font-semibold">Username</th>
                <th scope="col" class="px-5 py-3 font-semibold">Operative</th>
                <th scope="col" class="px-5 py-3 font-semibold">Demonstrates</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="account in demoAccounts" :key="account.username">
                <td class="whitespace-nowrap px-5 py-2.5 font-mono text-xs font-medium text-soter-700">{{ account.username }}</td>
                <td class="px-5 py-2.5"><span class="font-medium text-ink">{{ account.name }}</span><span class="block text-xs text-slate-500">{{ account.organisation }}</span></td>
                <td class="px-5 py-2.5 text-slate-600">{{ account.hint }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <dl class="grid gap-3 border-t border-slate-100 px-5 py-4 text-sm sm:grid-cols-2">
          <div><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Anonymous verification code</dt><dd class="mt-1 font-mono text-xs font-medium text-soter-700">{{ verificationCode || 'Not set' }}</dd></div>
          <div><dt class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Company codes</dt><dd class="mt-1 text-slate-600">{{ companyCodes }}</dd></div>
        </dl>
      </section>

      <div class="flex flex-wrap gap-4 text-sm font-medium text-soter-700">
        <NuxtLink to="/login/reset?preview=reset" class="underline">Preview password reset</NuxtLink>
        <NuxtLink to="/login/reset?preview=activate" class="underline">Preview account activation</NuxtLink>
      </div>
    </div>
  </details>
</template>
