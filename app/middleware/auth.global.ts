// Contractors and visitors reach Access IT through a dedicated address and never see the wider
// system, so the kiosk routes are public. Everything else needs a signed-in user.
const PUBLIC_PREFIXES = ['/login', '/site-access']

export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client || PUBLIC_PREFIXES.some((prefix) => to.path === prefix || to.path.startsWith(`${prefix}/`))) return

  const { restoreSession, isAuthenticated } = useAuth()
  restoreSession()

  if (!isAuthenticated.value) return navigateTo('/login')
})
