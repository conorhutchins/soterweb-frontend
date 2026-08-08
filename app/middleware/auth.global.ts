export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client || to.path === '/login') return

  const { restoreSession, isAuthenticated } = useAuth()
  restoreSession()

  if (!isAuthenticated.value) return navigateTo('/login')
})
