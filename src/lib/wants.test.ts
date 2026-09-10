import { describe, expect, it } from 'vitest'
import { isBelowTarget, orderWants, wantBudget, wantToCardPrefill } from './wants'
import { want } from '../test/helpers'

describe('isBelowTarget', () => {
  it('is true once a checked price lands at or under the ceiling', () => {
    expect(isBelowTarget(want({ max_price: 100, last_checked_price: 100 }))).toBe(true)
    expect(isBelowTarget(want({ max_price: 100, last_checked_price: 99 }))).toBe(true)
  })

  it('is false above the ceiling', () => {
    expect(isBelowTarget(want({ max_price: 100, last_checked_price: 101 }))).toBe(false)
  })

  it('is false when either figure is missing, rather than guessing', () => {
    expect(isBelowTarget(want({ max_price: 100, last_checked_price: null }))).toBe(false)
    expect(isBelowTarget(want({ max_price: null, last_checked_price: 10 }))).toBe(false)
  })
})

describe('wantBudget', () => {
  it('sums the ceilings, treating a missing one as nothing', () => {
    expect(wantBudget([want({ max_price: 50 }), want({ max_price: null }), want({ max_price: 25 })])).toBe(75)
  })

  it('is zero for an empty list', () => {
    expect(wantBudget([])).toBe(0)
  })
})

describe('orderWants', () => {
  it('puts High before Medium before Low', () => {
    const list = [
      want({ id: 'low', priority: 'Low' }),
      want({ id: 'high', priority: 'High' }),
      want({ id: 'med', priority: 'Medium' }),
    ]
    expect(orderWants(list).map((w) => w.id)).toEqual(['high', 'med', 'low'])
  })

  it('within a priority, floats the one you could actually act on', () => {
    const list = [
      want({ id: 'over', priority: 'High', max_price: 100, last_checked_price: 200 }),
      want({ id: 'under', priority: 'High', max_price: 100, last_checked_price: 50 }),
    ]
    expect(orderWants(list).map((w) => w.id)).toEqual(['under', 'over'])
  })

  it('falls back to player name', () => {
    const list = [
      want({ id: 'z', player: 'Zidane' }),
      want({ id: 'a', player: 'Alvarez' }),
    ]
    expect(orderWants(list).map((w) => w.id)).toEqual(['a', 'z'])
  })

  it('sorts an unknown priority to the bottom instead of throwing', () => {
    const list = [want({ id: 'odd', priority: 'Someday' }), want({ id: 'low', priority: 'Low' })]
    expect(orderWants(list).map((w) => w.id)).toEqual(['low', 'odd'])
  })

  it('does not mutate the list it was given', () => {
    const list = [want({ id: 'low', priority: 'Low' }), want({ id: 'high', priority: 'High' })]
    orderWants(list)
    expect(list.map((w) => w.id)).toEqual(['low', 'high'])
  })
})

describe('wantToCardPrefill', () => {
  it('carries the card details across', () => {
    const prefill = wantToCardPrefill(
      want({ player: 'Mbappe', category: 'Football', year: '2026', set_name: 'Topps', seen_at: 'eBay' }),
    )
    expect(prefill).toMatchObject({
      player: 'Mbappe',
      category: 'Football',
      year: '2026',
      set_name: 'Topps',
      seller: 'eBay',
    })
  })

  it('never carries a price, because what you hoped to pay is not what you paid', () => {
    expect('price_paid' in wantToCardPrefill(want({ max_price: 100 }))).toBe(false)
  })

  it('defaults an unspecified print run to 99, so the slab has something to show', () => {
    expect(wantToCardPrefill(want({ serial_wanted: null })).serial_total).toBe('99')
    expect(wantToCardPrefill(want({ serial_wanted: '  ' })).serial_total).toBe('99')
  })

  it('keeps a print run that was specified', () => {
    expect(wantToCardPrefill(want({ serial_wanted: '25' })).serial_total).toBe('25')
  })

  it('turns missing text into empty strings, since a form cannot hold null', () => {
    const prefill = wantToCardPrefill(want({ year: null, set_name: null, notes: null }))
    expect(prefill.year).toBe('')
    expect(prefill.set_name).toBe('')
    expect(prefill.notes).toBe('')
  })
})
