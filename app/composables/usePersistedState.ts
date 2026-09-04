const STORAGE_VERSION = 'v1'
const wiredKeys = new Set<string>()

/**
 * `useState` backed by localStorage. Keeps demo data across reloads and, through the storage
 * event, across tabs, so a kiosk tab and a staff tab see the same people on site.
 */
export function usePersistedState<T>(key: string, initialise: () => T) {
  const storageKey = `soterweb:${key}:${STORAGE_VERSION}`

  const state = useState<T>(key, () => {
    if (import.meta.client) {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) return JSON.parse(stored) as T
      }
      catch {
        // Fall through to the fixture when storage is unavailable or corrupt.
      }
    }
    return initialise()
  })

  if (import.meta.client && !wiredKeys.has(storageKey)) {
    wiredKeys.add(storageKey)
    let lastWritten = ''

    // The watcher must outlive the component that first touched the store, so it runs in a
    // detached scope rather than the caller's component scope.
    effectScope(true).run(() => {
      watch(state, (value) => {
        const serialised = JSON.stringify(value)
        if (serialised === lastWritten) return
        lastWritten = serialised
        try {
          localStorage.setItem(storageKey, serialised)
        }
        catch {
          // Storage may be full or blocked; the in-memory state still works.
        }
      }, { deep: true, immediate: true })
    })

    window.addEventListener('storage', (event) => {
      if (event.key !== storageKey || !event.newValue || event.newValue === lastWritten) return
      try {
        lastWritten = event.newValue
        state.value = JSON.parse(event.newValue) as T
      }
      catch {
        // Ignore malformed updates from other tabs.
      }
    })
  }

  function reset() {
    state.value = initialise()
  }

  return { state, reset }
}
