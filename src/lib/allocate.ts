import { supabase } from './supabase'
import { perHitCost } from './breaks'
import type { BreakSpot } from './breaks'

/** Spreads a spot's cost evenly across its current hits and writes the result
 *  into each linked card's `price_paid`.
 *
 *  This mirrors `CardStore.recalculateBreakAllocation` in the iOS app, down to
 *  the rounding, and has to: the two clients write the same rows, and if they
 *  disagreed about a spot's per-hit cost then Total Paid would drift depending
 *  on which device last touched a card.
 *
 *  Why store it on the card at all, rather than deriving it on read? Because
 *  every other aggregate in the app — total paid, profit, value by category —
 *  reads `price_paid` directly. Keeping the allocation there means a
 *  break-sourced card needs no special handling anywhere else.
 *
 *  Must be called whenever a card joins or leaves a spot, or a spot's cost
 *  changes. A spot with no hits is left alone: there is nobody to charge, and
 *  its full cost shows as a loss via `spotProfitLoss`.
 */
export async function reallocateSpot(spot: BreakSpot): Promise<string | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('id, price_paid')
    .eq('break_spot_id', spot.id)

  if (error) return error.message
  const linked = data ?? []
  if (linked.length === 0) return null

  const perHit = perHitCost(spot, linked.length)
  if (perHit == null) return null

  // Only the cards whose share actually changed, so a no-op edit doesn't
  // rewrite every row.
  const stale = linked.filter((c) => Number(c.price_paid) !== perHit)
  for (const card of stale) {
    const { error } = await supabase
      .from('cards')
      .update({ price_paid: perHit })
      .eq('id', card.id)
    if (error) return error.message
  }
  return null
}

/** Reallocates several spots, for the case where a card moves between two of
 *  them — both the spot it left and the spot it joined need recalculating. */
export async function reallocateSpots(spots: BreakSpot[]): Promise<string | null> {
  for (const spot of spots) {
    const err = await reallocateSpot(spot)
    if (err) return err
  }
  return null
}
