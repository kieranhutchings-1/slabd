import type { Card } from './types'

/** The same six orderings the iOS collection list offers, under the same
 *  names, so the two don't disagree about what "Recently acquired" means. */
export const SORTS = [
  'Player A–Z',
  'Player Z–A',
  'Recently acquired',
  'Oldest acquired',
  'Value: high to low',
  'Value: low to high',
] as const

export type Sort = (typeof SORTS)[number]

export const DEFAULT_SORT: Sort = 'Player A–Z'

const byPlayer = (a: Card, b: Card) => a.player.localeCompare(b.player, undefined, { sensitivity: 'base' })

/** Cards missing the value being sorted on sink to the bottom in either
 *  direction. Treating a missing comp value as zero would bury every unvalued
 *  card at the top of "low to high", which reads as a broken sort. */
function byOptional<V extends string | number>(
  value: (c: Card) => V | null | undefined,
  ascending: boolean,
) {
  return (a: Card, b: Card) => {
    const l = value(a)
    const r = value(b)
    if (l == null && r == null) return byPlayer(a, b)
    if (l == null) return 1
    if (r == null) return -1
    if (l === r) return byPlayer(a, b)
    return ascending ? (l < r ? -1 : 1) : l < r ? 1 : -1
  }
}

export function sortCards(cards: Card[], sort: Sort): Card[] {
  const out = [...cards]
  switch (sort) {
    case 'Player A–Z':
      return out.sort(byPlayer)
    case 'Player Z–A':
      return out.sort((a, b) => byPlayer(b, a))
    // Dates are stored ISO, so comparing them as strings gives the same
    // order as comparing them as dates, without the parsing.
    case 'Recently acquired':
      return out.sort(byOptional((c) => c.date_acquired, false))
    case 'Oldest acquired':
      return out.sort(byOptional((c) => c.date_acquired, true))
    case 'Value: high to low':
      return out.sort(byOptional((c) => c.comp_value, false))
    case 'Value: low to high':
      return out.sort(byOptional((c) => c.comp_value, true))
  }
}
