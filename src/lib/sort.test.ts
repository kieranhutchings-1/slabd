import { describe, expect, it } from 'vitest'
import { DEFAULT_SORT, SORTS, sortCards } from './sort'
import { card } from '../test/helpers'

const ids = (cards: ReturnType<typeof card>[]) => cards.map((c) => c.id)

describe('sortCards', () => {
  it('orders players A to Z, ignoring case', () => {
    const list = [card({ id: 'b', player: 'bruno' }), card({ id: 'a', player: 'Alvarez' })]
    expect(ids(sortCards(list, 'Player A–Z'))).toEqual(['a', 'b'])
  })

  it('reverses for Z to A', () => {
    const list = [card({ id: 'a', player: 'Alvarez' }), card({ id: 'b', player: 'Bruno' })]
    expect(ids(sortCards(list, 'Player Z–A'))).toEqual(['b', 'a'])
  })

  it('puts the newest acquisition first', () => {
    const list = [
      card({ id: 'old', date_acquired: '2026-01-01' }),
      card({ id: 'new', date_acquired: '2026-09-01' }),
    ]
    expect(ids(sortCards(list, 'Recently acquired'))).toEqual(['new', 'old'])
  })

  it('sinks a card with no date to the bottom in both directions', () => {
    // Treating a missing value as zero would bury every undated card at
    // the top of one direction, which reads as a broken sort.
    const list = [
      card({ id: 'none', date_acquired: null }),
      card({ id: 'dated', date_acquired: '2026-01-01' }),
    ]
    expect(ids(sortCards(list, 'Recently acquired'))).toEqual(['dated', 'none'])
    expect(ids(sortCards(list, 'Oldest acquired'))).toEqual(['dated', 'none'])
  })

  it('sinks an unvalued card to the bottom in both directions', () => {
    const list = [
      card({ id: 'none', comp_value: null }),
      card({ id: 'cheap', comp_value: 1 }),
      card({ id: 'dear', comp_value: 100 }),
    ]
    expect(ids(sortCards(list, 'Value: high to low'))).toEqual(['dear', 'cheap', 'none'])
    expect(ids(sortCards(list, 'Value: low to high'))).toEqual(['cheap', 'dear', 'none'])
  })

  it('breaks a tie on player name, so the order is stable to read', () => {
    const list = [
      card({ id: 'z', player: 'Zidane', comp_value: 10 }),
      card({ id: 'a', player: 'Alvarez', comp_value: 10 }),
    ]
    expect(ids(sortCards(list, 'Value: high to low'))).toEqual(['a', 'z'])
  })

  it('does not mutate the list it was given', () => {
    const list = [card({ id: 'b', player: 'Bruno' }), card({ id: 'a', player: 'Alvarez' })]
    sortCards(list, 'Player A–Z')
    expect(ids(list)).toEqual(['b', 'a'])
  })

  it('handles every declared sort without falling through', () => {
    const list = [card({ id: 'a' }), card({ id: 'b', player: 'B' })]
    for (const sort of SORTS) expect(sortCards(list, sort)).toHaveLength(2)
  })

  it('has a default that is one of the declared sorts', () => {
    expect(SORTS).toContain(DEFAULT_SORT)
  })
})
