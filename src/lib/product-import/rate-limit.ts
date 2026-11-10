const windows = new Map<
  string,
  { count: number; until: number; busy: boolean }
>()
let active = 0

/** Per-process bounds, including concurrent requests. No external service required. */
export function acquireImportSlot(userId: string) {
  const now = Date.now()
  for (const [key, entry] of windows)
    if (entry.until <= now && !entry.busy) windows.delete(key)
  let entry = windows.get(userId)
  if (!entry) {
    if (windows.size >= 2000) return null
    entry = { count: 0, until: now + 60000, busy: false }
    windows.set(userId, entry)
  }
  if (entry.busy || entry.count >= 10 || active >= 12) return null
  entry.count++
  entry.busy = true
  active++
  return () => {
    entry.busy = false
    active--
  }
}
