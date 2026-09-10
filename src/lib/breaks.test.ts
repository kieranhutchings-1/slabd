import { describe, expect, it } from 'vitest'
import {
  deriveBreakStats,
  hitsFor,
  orderBreaks,
  percent,
  perHitCost,
  spotProfitLoss,
  type Break,
  type BreakSpot,
} from './breaks'
import { card, fixture } from '../test/helpers'

interface PerHitFixture {
  cases: { cost: number; hits: number; expect: number | null; why: string }[]
}

const spot = (o: Partial<BreakSpot> = {}): BreakSpot => ({
  id: 'spot-1',
  break_id: 'break-1',
  user_id: 'user-1',
  name: 'A Team',
  cost: 100,
  ...o,
})

const brk = (o: Partial<Break> = {}): Break => ({
  id: 'break-1',
  user_id: 'user-1',
  name: 'A Break',
  break_date: '2026-08-01',
  seller: 'A Seller',
  notes: null,
  ...o,
})

describe('perHitCost, against the shared fixture', () => {
  // This number is written back to each linked card's price_paid, so the
  // iOS side must round it identically or Total Paid disagrees between the
  // two apps for the same collection.
  for (const c of fixture<PerHitFixture>('per-hit-cost.json').cases) {
    it(`${c.cost} across ${c.hits} hits -> ${c.expect} (${c.why})`, () => {
      expect(perHitCost(spot({ cost: c.cost }), c.hits)).toBe(c.expect)
    })
  }
})

describe('spotProfitLoss', () => {
  it('counts a spot with no hits as a total loss of its cost', () => {
    // Summing an empty list would read as break-even, which is actively
    // misleading for a spot that whiffed.
    expect(spotProfitLoss(spot({ cost: 60 }), [])).toBe(-60)
  })

  it('sums the profit of the cards it hit', () => {
    const cards = [
      card({ id: 'a', break_spot_id: 'spot-1', price_paid: 30, comp_value: 50 }),
      card({ id: 'b', break_spot_id: 'spot-1', price_paid: 30, comp_value: 10 }),
    ]
    expect(spotProfitLoss(spot(), cards)).toBe(0)
  })

  it('ignores cards belonging to another spot', () => {
    const cards = [card({ break_spot_id: 'spot-2', price_paid: 0, comp_value: 999 })]
    expect(spotProfitLoss(spot({ cost: 40 }), cards)).toBe(-40)
  })
})

describe('hitsFor', () => {
  it('returns only the cards linked to that spot', () => {
    const cards = [
      card({ id: 'a', break_spot_id: 'spot-1' }),
      card({ id: 'b', break_spot_id: 'spot-2' }),
      card({ id: 'c', break_spot_id: null }),
    ]
    expect(hitsFor(cards, 'spot-1').map((c) => c.id)).toEqual(['a'])
  })
})

describe('deriveBreakStats', () => {
  const breaks = [brk(), brk({ id: 'break-2', name: 'Second', seller: '  ' })]
  const spots = [
    spot({ id: 's1', break_id: 'break-1', cost: 100 }),
    spot({ id: 's2', break_id: 'break-1', cost: 50 }),
    spot({ id: 's3', break_id: 'break-2', cost: 25 }),
  ]
  const cards = [
    card({ id: 'a', break_spot_id: 's1', price_paid: 50, comp_value: 90 }),
    card({ id: 'b', break_spot_id: 's1', price_paid: 50, comp_value: 90 }),
  ]
  const s = deriveBreakStats(breaks, spots, cards)

  it('sums every spot cost as the spend', () => {
    expect(s.totalSpend).toBe(175)
  })

  it('counts hits across all spots', () => {
    expect(s.totalHits).toBe(2)
  })

  it('measures hit rate as spots that hit at least once, over all spots', () => {
    expect(s.hitRate).toBeCloseTo(1 / 3)
  })

  it('divides total spend by hits for cost per hit', () => {
    expect(s.costPerHit).toBeCloseTo(87.5)
  })

  it('counts the two dead spots as full losses', () => {
    // s1 made +80, s2 and s3 whiffed for -50 and -25.
    expect(s.profit).toBe(5)
  })

  it('rolls each break up under its own id', () => {
    expect(s.rollup['break-1']).toEqual({ cost: 150, hits: 2, spotCount: 2, profit: 30 })
    expect(s.rollup['break-2']).toEqual({ cost: 25, hits: 0, spotCount: 1, profit: -25 })
  })

  it('files a blank seller under Unknown Seller rather than an empty row', () => {
    expect(s.bySeller.map((r) => r.seller)).toContain('Unknown Seller')
  })

  it('ranks sellers by how often you buy from them', () => {
    const many = [
      brk({ id: 'b1', seller: 'Rare' }),
      brk({ id: 'b2', seller: 'Often' }),
      brk({ id: 'b3', seller: 'Often' }),
    ]
    const manySpots = [
      spot({ id: 'x', break_id: 'b1', cost: 1000 }),
      spot({ id: 'y', break_id: 'b2', cost: 1 }),
    ]
    const ranked = deriveBreakStats(many, manySpots, []).bySeller
    // Ranked on frequency, so the bigger single spend does not win.
    expect(ranked[0].seller).toBe('Often')
  })

  it('reports no hit rate at all when nothing has been bought', () => {
    const empty = deriveBreakStats([], [], [])
    expect(empty.hitRate).toBeNull()
    expect(empty.costPerHit).toBeNull()
  })
})

describe('orderBreaks', () => {
  it('puts the most recent break first, by when it happened', () => {
    const list = [
      brk({ id: 'old', break_date: '2026-01-01' }),
      brk({ id: 'new', break_date: '2026-09-01' }),
    ]
    expect(orderBreaks(list).map((b) => b.id)).toEqual(['new', 'old'])
  })

  it('sinks a break with no date to the bottom', () => {
    const list = [brk({ id: 'undated', break_date: null }), brk({ id: 'dated' })]
    expect(orderBreaks(list).map((b) => b.id)).toEqual(['dated', 'undated'])
  })

  it('does not mutate the list it was given', () => {
    const list = [brk({ id: 'a', break_date: '2026-01-01' }), brk({ id: 'b' })]
    orderBreaks(list)
    expect(list.map((b) => b.id)).toEqual(['a', 'b'])
  })
})

describe('percent', () => {
  it('rounds to a whole percent', () => {
    expect(percent(1 / 3)).toBe('33%')
    expect(percent(1)).toBe('100%')
  })
})
