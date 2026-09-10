import { describe, expect, it } from 'vitest'
import { deriveStats } from './stats'
import { card } from '../test/helpers'

describe('deriveStats', () => {
  const cards = [
    card({ id: 'a', category: 'Football', price_paid: 10, comp_value: 40 }),
    card({ id: 'b', category: 'Football', price_paid: 20, comp_value: 30 }),
    card({ id: 'c', category: 'Pokemon', price_paid: 5, comp_value: 100 }),
    card({ id: 'd', category: 'Pokemon', price_paid: 50, comp_value: 60, status: 'Sold', sold_price: 80 }),
  ]
  const s = deriveStats(cards)

  it('counts every card, sold ones included', () => {
    expect(s.count).toBe(4)
  })

  it('sums what was paid across every card, sold ones included', () => {
    expect(s.totalPaid).toBe(85)
  })

  it('values only the cards still held', () => {
    // The sold card's 60 is excluded: its value has already been realised.
    expect(s.heldValue).toBe(170)
  })

  it('mixes unrealised and realised into one profit figure', () => {
    // held: (40-10) + (30-20) + (100-5) = 135. sold: 80-50 = 30.
    expect(s.profit).toBe(165)
  })

  it('averages value over held cards only', () => {
    expect(s.averageValue).toBeCloseTo(170 / 3)
  })

  it('groups held value by category, biggest first', () => {
    expect(s.byCategory).toEqual([
      { label: 'Pokemon', value: 100, count: 1 },
      { label: 'Football', value: 70, count: 2 },
    ])
  })

  it('files a card with no category under Other', () => {
    const [row] = deriveStats([card({ category: '', comp_value: 5 })]).byCategory
    expect(row.label).toBe('Other')
  })

  it('lists statuses in a fixed order and hides the empty ones', () => {
    expect(s.byStatus).toEqual([
      { label: 'Kept', count: 3 },
      { label: 'Sold', count: 1 },
    ])
  })

  it('ranks the most valuable held cards, excluding sold and unvalued', () => {
    expect(s.topCards.map((c) => c.id)).toEqual(['c', 'a', 'b'])
  })

  it('caps the most-valuable list at six', () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      card({ id: `c${i}`, comp_value: i + 1 }),
    )
    expect(deriveStats(many).topCards).toHaveLength(6)
  })

  it('handles an empty collection without dividing by zero', () => {
    const empty = deriveStats([])
    expect(empty).toMatchObject({ count: 0, totalPaid: 0, heldValue: 0, profit: 0, averageValue: 0 })
    expect(empty.byCategory).toEqual([])
    expect(empty.byStatus).toEqual([])
  })
})
