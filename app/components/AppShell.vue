<script setup lang="ts">
import { ChevronDown, LogOut, UserRound } from '@lucide/vue'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui'

const { signOut } = useAuth()
const router = useRouter()
const route = useRoute()
const { paramIsYes } = useAccessItConfig()

const navigation = computed(() => [
  { label: 'Organisations', to: '/organisations' },
  ...(paramIsYes('System Menu Show Access IT Tab') ? [{ label: 'Access IT', to: '/access-it' }] : []),
])

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
    <header class="border-b border-soter-700 bg-soter-600 shadow-sm">
      <div class="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-5 lg:px-8">
        <div class="flex min-w-0 items-center gap-6">
          <NuxtLink to="/organisations" class="flex shrink-0 items-center gap-5 no-underline">
            <AppWordmark />
            <span class="hidden border-l border-white/20 pl-5 text-sm font-medium text-soter-100 xl:block">Integrated Workplace Management System</span>
          </NuxtLink>
          <nav class="flex items-center gap-1" aria-label="Main">
            <NuxtLink v-for="item in navigation" :key="item.to" :to="item.to" class="rounded-lg px-3 py-2 text-sm font-medium no-underline transition" :class="isActive(item.to) ? 'bg-white/15 text-white' : 'text-soter-100 hover:bg-white/10 hover:text-white'" :aria-current="isActive(item.to) ? 'page' : undefined">{{ item.label }}</NuxtLink>
          </nav>
        </div>

        <DropdownMenuRoot>
          <DropdownMenuTrigger class="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-white outline-hidden transition hover:bg-white/10 data-[state=open]:bg-white/10">
            <span class="flex size-7 items-center justify-center rounded-full bg-white/15"><UserRound class="size-4" /></span>
            <span class="hidden sm:block">Administrator</span>
            <ChevronDown class="size-4 text-soter-100" />
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
    </header>

    <main class="mx-auto max-w-[1440px] px-5 py-8 lg:px-8 lg:py-10">
      <slot />
    </main>
  </div>
</template>
