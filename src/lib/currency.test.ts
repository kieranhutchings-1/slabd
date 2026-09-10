import { afterEach, describe, expect, it } from 'vitest'
import {
  CURRENCIES,
  CURRENCY_LABELS,
  formatMoney,
  getCurrency,
  setCurrencyLocally,
  subscribeCurrency,
} from './currency'

// Module state, so each test puts it back.
afterEach(() => setCurrencyLocally('GBP'))

describe('formatMoney', () => {
  it('shows a dash for a missing amount, not zero', () => {
    // Zero and "not recorded" are different facts about a card.
    expect(formatMoney(null)).toBe('—')
    expect(formatMoney(undefined)).toBe('—')
    expect(formatMoney(0)).toContain('0')
  })

  it('always shows both pence digits, so a column lines up', () => {
    expect(formatMoney(12.5)).toContain('12.50')
  })

  it('uses the symbol of the chosen currency', () => {
    expect(formatMoney(1)).toContain('£')
    setCurrencyLocally('USD')
    expect(formatMoney(1)).toContain('$')
    setCurrencyLocally('EUR')
    expect(formatMoney(1)).toContain('€')
  })

  it('relabels rather than converts, so the number never changes', () => {
    // There is no exchange rate anywhere in SLABD. Switching currency must
    // not rewrite the meaning of what somebody already entered.
    const before = formatMoney(1000)
    setCurrencyLocally('USD')
    const after = formatMoney(1000)
    expect(before).toContain('1,000.00')
    expect(after).toContain('1,000.00')
  })

  it('formats a negative amount without losing the sign', () => {
    expect(formatMoney(-5)).toMatch(/[-−]/)
  })
})

describe('the currency store', () => {
  it('starts on sterling when nothing is stored', () => {
    expect(getCurrency()).toBe('GBP')
  })

  it('tells subscribers when the currency changes', () => {
    let calls = 0
    const stop = subscribeCurrency(() => calls++)
    setCurrencyLocally('USD')
    expect(calls).toBe(1)
    stop()
    setCurrencyLocally('EUR')
    expect(calls).toBe(1)
  })

  it('does not notify when the currency is set to what it already is', () => {
    let calls = 0
    const stop = subscribeCurrency(() => calls++)
    setCurrencyLocally('GBP')
    expect(calls).toBe(0)
    stop()
  })

  it('labels every currency it offers', () => {
    for (const c of CURRENCIES) expect(CURRENCY_LABELS[c]).toBeTruthy()
  })
})
