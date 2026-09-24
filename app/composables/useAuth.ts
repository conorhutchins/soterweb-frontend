import { createDemoSession, DEMO_SESSION_KEY, isDemoSessionValid } from '~/lib/auth/demo-session'

export function useAuth() {
  const isAuthenticated = useState('isAuthenticated', () => false)

  function clearStoredSessions() {
    localStorage.removeItem(DEMO_SESSION_KEY)
    sessionStorage.removeItem(DEMO_SESSION_KEY)
    localStorage.removeItem('soterweb-authenticated')
  }

  function restoreSession() {
    if (!import.meta.client) return
    try {
      isAuthenticated.value = [sessionStorage, localStorage].some((storage) => isDemoSessionValid(storage.getItem(DEMO_SESSION_KEY), Date.now()))
      if (!isAuthenticated.value) clearStoredSessions()
    }
    catch {
      // A browser that blocks storage can still use the demo for the current page session.
    }
  }

  function signIn(username: string, password: string, remember = false) {
    if (username.trim() !== 'Test' || password !== 'Leeds') return false
    isAuthenticated.value = true
    try {
      clearStoredSessions()
      const storage = remember ? localStorage : sessionStorage
      storage.setItem(DEMO_SESSION_KEY, createDemoSession(Date.now(), remember))
    }
    catch {
      // Do not store credentials or prevent a preview when storage is unavailable.
    }
    return true
  }

  function signOut() {
    isAuthenticated.value = false
    try { clearStoredSessions() }
    catch { /* Storage may be unavailable. */ }
  }

  return { isAuthenticated, restoreSession, signIn, signOut }
}
