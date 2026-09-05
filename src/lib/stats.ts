import type { Card } from './types'
import { profitLoss } from './format'

export interface Stats {
  count: number
  totalPaid: number
  /** Comp value of cards still held. Sold cards are excluded because their
   *  value has already been realised, which is the same rule the app's
   *  summary uses. */
  heldValue: number
  profit: number
  averageValue: number
  byCategory: { label: string; value: number; count: number }[]
  byStatus: { label: string; count: number }[]
  topCards: Card[]
}

export function deriveStats(cards: Card[]): Stats {
  const held = cards.filter((c) => c.status !== 'Sold')
  const totalPaid = cards.reduce((s, c) => s + (c.price_paid ?? 0), 0)
  const heldValue = held.reduce((s, c) => s + (c.comp_value ?? 0), 0)
  // Unvalued cards contribute nothing rather than a phantom loss.
  const profit = cards.reduce((s, c) => s + (profitLoss(c) ?? 0), 0)

  const catMap = new Map<string, { value: number; count: number }>()
  for (const c of held) {
    const k = c.category || 'Other'
    const prev = catMap.get(k) ?? { value: 0, count: 0 }
    catMap.set(k, { value: prev.value + (c.comp_value ?? 0), count: prev.count + 1 })
  }

  const statusMap = new Map<string, number>()
  for (const c of cards) statusMap.set(c.status, (statusMap.get(c.status) ?? 0) + 1)

  return {
    count: cards.length,
    totalPaid,
    heldValue,
    profit,
    averageValue: held.length ? heldValue / held.length : 0,
    byCategory: [...catMap.entries()]
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => b.value - a.value),
    byStatus: ['Kept', 'For Sale', 'Sold']
      .map((label) => ({ label, count: statusMap.get(label) ?? 0 }))
      .filter((s) => s.count > 0),
    topCards: [...held]
      .filter((c) => (c.comp_value ?? 0) > 0)
      .sort((a, b) => (b.comp_value ?? 0) - (a.comp_value ?? 0))
      .slice(0, 6),
  }
}
