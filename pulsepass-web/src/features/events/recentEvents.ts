import { z } from 'zod'

// GAP-01: there is no "list all events" endpoint, so the admin panel remembers the codes it
// created during this tab session (PRD §9.16). Only codes are stored, never server data (FE-005).
const MAX = 10
const CodesSchema = z.array(z.string().min(1)).max(MAX)

const keyFor = (username: string) => `pulsepass.admin.recentEvents.${username}`

export function readRecentEvents(username: string): string[] {
  try {
    const text = sessionStorage.getItem(keyFor(username))
    if (!text) return []
    // sessionStorage is external data: anything unexpected is discarded.
    return CodesSchema.safeParse(JSON.parse(text)).data ?? []
  } catch {
    return []
  }
}

export function rememberRecentEvent(username: string, eventCode: string): void {
  const codes = [eventCode, ...readRecentEvents(username).filter((c) => c !== eventCode)].slice(0, MAX)
  try {
    sessionStorage.setItem(keyFor(username), JSON.stringify(codes))
  } catch {
    // Without sessionStorage the list is simply not kept.
  }
}
