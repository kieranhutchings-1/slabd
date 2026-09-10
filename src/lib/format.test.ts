import { describe, expect, it } from 'vitest'
import { profitLoss, signedMoney } from './format'
import { fixture } from '../test/helpers'

interface ProfitFixture {
  cases: {
    status: string
    price_paid: number | null
    comp_value: number | null
    sold_price: number | null
    expect: number
    why: string
  }[]
}

describe('profitLoss, against the shared fixture', () => {
  // Mirrors Card.profitLoss in the iOS app. Every total in either product
  // sums this one function, so a disagreement here is a disagreement about
  // every headline figure.
  for (const c of fixture<ProfitFixture>('profit-loss.json').cases) {
    it(`${c.status}: paid ${c.price_paid}, comp ${c.comp_value}, sold ${c.sold_price} -> ${c.expect} (${c.why})`, () => {
      expect(
        profitLoss({
          status: c.status,
          price_paid: c.price_paid,
          comp_value: c.comp_value,
          sold_price: c.sold_price,
        }),
      ).toBe(c.expect)
    })
  }
})

describe('signedMoney', () => {
  it('leads a gain with a plus', () => {
    expect(signedMoney(10)).toMatch(/^\+/)
  })

  it('leads a loss with a minus sign, not a hyphen', () => {
    // U+2212. A hyphen next to tabular figures reads as a dash in the
    // column rather than a sign on the number.
    expect(signedMoney(-10).startsWith('−')).toBe(true)
  })

  it('treats zero as a gain, so a break-even card is not shown as a loss', () => {
    expect(signedMoney(0)).toMatch(/^\+/)
  })
})
