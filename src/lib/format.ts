import { formatMoney } from './currency'

/** Formats in the user's chosen currency, matching the app's `Money.format`.
 *  See `currency.ts` — switching relabels amounts rather than converting them. */
export const money = formatMoney

export const signedMoney = (value: number) =>
  `${value >= 0 ? '+' : '−'}${money(Math.abs(value))}`

/** Comp value minus paid if kept, sold price minus paid if sold — the same
 *  rule as `Card.profitLoss` in the app. */
export const profitLoss = (c: {
  status: string
  price_paid: number | null
  comp_value: number | null
  sold_price: number | null
}) => {
  const paid = c.price_paid ?? 0
  return c.status === 'Sold' ? (c.sold_price ?? 0) - paid : (c.comp_value ?? 0) - paid
}

/** Renders a stored date for reading: 18/08/2026.
 *
 *  Dates are stored and exchanged as ISO (YYYY-MM-DD) — that's what a Postgres
 *  date column gives back, and it's the only unambiguous way to move a date
 *  between two clients. This is purely how it's shown.
 *
 *  Four-digit year deliberately. A two-digit one saves two characters and
 *  loses the century, and "05/09/26" is the exact shape that gets misread as
 *  a US date; the whole point of a fixed display format is removing that
 *  doubt.
 *
 *  Parsed as UTC rather than local. `new Date('2026-08-18')` is midnight UTC,
 *  which in any timezone behind UTC renders as the 17th — a date that silently
 *  shifts by one day depending on where you're standing is worse than no
 *  formatting at all. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  // Anything not ISO-shaped is shown as-is rather than mangled into
  // "NaN/NaN/NaN".
  if (!match) return iso
  const [, year, month, day] = match
  return `${day}/${month}/${year}`
}
