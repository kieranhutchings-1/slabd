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
