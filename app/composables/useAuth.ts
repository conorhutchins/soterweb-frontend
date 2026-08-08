const AUTHENTICATION_STORAGE_KEY = 'soterweb-authenticated'
const DEMO_ACCOUNTS = [
  { username: 'Test', password: 'Leeds' },
]

export function useAuth() {
  const isAuthenticated = useState('isAuthenticated', () => false)

  function restoreSession() {
    if (import.meta.client) {
      isAuthenticated.value = localStorage.getItem(AUTHENTICATION_STORAGE_KEY) === 'true'
    }
  }

  function signIn(username: string, password: string) {
    const credentialsAreValid = DEMO_ACCOUNTS.some((account) => account.username === username && account.password === password)

    if (!credentialsAreValid) return false

    isAuthenticated.value = true
    localStorage.setItem(AUTHENTICATION_STORAGE_KEY, 'true')
    return true
  }

  function signOut() {
    isAuthenticated.value = false
    localStorage.removeItem(AUTHENTICATION_STORAGE_KEY)
  }

  return { isAuthenticated, restoreSession, signIn, signOut }
}
