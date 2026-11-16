// Redux Persist needs an asynchronous storage adapter.
// Explicitly wrap browser localStorage to avoid CommonJS default-import
// interoperability problems in Vite 8/Rolldown.
const storage = {
    async getItem(key: string): Promise<string | null> {
        try {
            return window.localStorage.getItem(key)
        } catch {
            // Storage can be disabled by browser settings.
            return null
        }
    },
    async setItem(key: string, value: string): Promise<string> {
        try {
            window.localStorage.setItem(key, value)
        } catch {
            // Keep the app usable even if storage is blocked or full.
        }
        return value
    },
    async removeItem(key: string): Promise<void> {
        try {
            window.localStorage.removeItem(key)
        } catch {
            // Keep the app usable if storage is blocked.
        }
    },
}

export default storage
