/** Mirrors the `wants` table, and the app's `WantItem`. */
export interface WantItem {
  id: string
  user_id: string | null
  category: string
  player: string
  year: string | null
  set_name: string | null
  auto_type: string | null
  serial_wanted: string | null
  max_price: number | null
  priority: string
  seen_at: string | null
  date_added: string | null
  notes: string | null
  last_checked_price: number | null
  last_checked_at: string | null
}

export const PRIORITIES = ['High', 'Medium', 'Low'] as const

const RANK: Record<string, number> = { High: 0, Medium: 1, Low: 2 }

/** True once a price check has come back at or under the target. The check
 *  itself is run from the app; the web only reports the result. */
export const isBelowTarget = (w: WantItem) =>
  w.last_checked_price != null && w.max_price != null && w.last_checked_price <= w.max_price

/** What the list would cost if you bought everything at your own ceiling. */
export const wantBudget = (wants: WantItem[]) =>
  wants.reduce((sum, w) => sum + (w.max_price ?? 0), 0)

/** Highest priority first, then the cards you're closest to being able to
 *  justify — a below-target want is the one to act on. */
export const orderWants = (wants: WantItem[]) =>
  [...wants].sort((a, b) => {
    const byPriority = (RANK[a.priority] ?? 9) - (RANK[b.priority] ?? 9)
    if (byPriority !== 0) return byPriority
    const belowA = isBelowTarget(a) ? 0 : 1
    const belowB = isBelowTarget(b) ? 0 : 1
    if (belowA !== belowB) return belowA - belowB
    return a.player.localeCompare(b.player)
  })

/** The fields the app carries across when a want becomes a card, from
 *  `WantItem.toCard()`. Price paid is deliberately left for you to fill in —
 *  what you hoped to pay is not what you paid. */
export function wantToCardPrefill(w: WantItem) {
  return {
    category: w.category,
    player: w.player,
    year: w.year ?? '',
    set_name: w.set_name ?? '',
    auto_type: w.auto_type ?? 'Auto',
    // The app defaults an unspecified print run to 99 rather than leaving it
    // blank, so the slab has something to show.
    serial_total: w.serial_wanted && w.serial_wanted.trim() !== '' ? w.serial_wanted : '99',
    seller: w.seen_at ?? '',
    notes: w.notes ?? '',
  }
}
