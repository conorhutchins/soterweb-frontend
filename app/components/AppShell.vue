<script setup lang="ts">
import { ChevronDown, ExternalLink, LogOut, UserRound } from '@lucide/vue'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui'

const { signOut } = useAuth()
const router = useRouter()
const route = useRoute()
const { paramIsYes } = useAccessItConfig()

const navigation = computed(() => [
  { label: 'Organisations', to: '/organisations' },
  ...(paramIsYes('System Menu Show Access IT Tab') ? [{ label: 'Access IT', to: '/access-it' }] : []),
])

const accessNavigation = [
  { label: 'Overview', to: '/access-it' },
  { label: 'People on site', to: '/access-it/people-on-site' },
  { label: 'Visitors', to: '/access-it/visitors' },
  { label: 'Settings', to: '/access-it/settings' },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

function leaveApplication() {
  signOut()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-dvh bg-[#f5f8fb]">
    <header class="border-b border-slate-200 bg-white shadow-xs">
      <div class="mx-auto flex min-h-16 max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-6 lg:px-8">
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:gap-6">
          <NuxtLink to="/organisations" class="flex shrink-0 items-center gap-5 no-underline">
            <AppWordmark />
            <span class="hidden border-l border-slate-200 pl-5 text-sm font-medium text-slate-500 xl:block">Integrated Workplace Management System</span>
          </NuxtLink>
          <nav class="flex items-center gap-1" aria-label="Main">
            <NuxtLink v-for="item in navigation" :key="item.to" :to="item.to" class="rounded-lg px-3 py-2 text-sm font-medium no-underline transition" :class="isActive(item.to) ? 'bg-soter-50 text-soter-700' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'" :aria-current="isActive(item.to) ? 'page' : undefined">{{ item.label }}</NuxtLink>
          </nav>
        </div>

        <DropdownMenuRoot>
          <DropdownMenuTrigger aria-label="Account menu" class="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-700 outline-hidden transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-soter-500 data-[state=open]:bg-slate-50">
            <span class="flex size-7 items-center justify-center rounded-full bg-soter-50"><UserRound class="size-4" /></span>
            <span class="hidden sm:block">Administrator</span>
            <ChevronDown class="size-4 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent class="z-50 mt-2 min-w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg" :side-offset="8">
              <DropdownMenuItem class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-hidden hover:bg-slate-50" @select="leaveApplication">
                <LogOut class="size-4 text-slate-500" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>
      </div>
      <div v-if="route.path.startsWith('/access-it') && paramIsYes('System Menu Show Access IT Tab')" class="border-t border-slate-100 bg-slate-50/70">
        <div class="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-2 lg:px-8">
          <nav aria-label="Access IT" class="grid w-full grid-cols-4 gap-1 sm:w-auto sm:flex">
            <NuxtLink v-for="item in accessNavigation" :key="item.to" :to="item.to" :aria-current="route.path === item.to ? 'page' : undefined" class="flex min-h-11 items-center justify-center rounded-lg px-2 text-center text-xs font-medium no-underline sm:px-4 sm:text-sm" :class="route.path === item.to ? 'bg-white text-soter-700 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:bg-white'">{{ item.label }}</NuxtLink>
          </nav>
          <NuxtLink to="/site-access" target="_blank" class="inline-flex min-h-9 items-center gap-2 px-2 text-sm font-semibold text-soter-700 no-underline hover:underline">Open kiosk <ExternalLink class="size-4" /><span class="sr-only">(opens a new tab)</span></NuxtLink>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-[1440px] px-4 py-6 lg:px-8 lg:py-8">
      <slot />
    </main>
  </div>
</template>
